const { getVideoDurationInSeconds: duration } = require('get-video-duration')
const SpotifyWebApi = require('spotify-web-api-node');
const yt_download = require("ytdl-core")
const yt_Search = require("yt-search")
const path = require("path")
const fs = require("fs")

const { discord: dataHelper, mainDataPath } = require("./dataHelper")
const songsPath = path.join(mainDataPath, "songs")
fs.mkdirSync(songsPath, { recursive: true })

const Client = require("./clientBuilder")
const { BroadcastChannel } = require("worker_threads")

const { spotify } = require("../../config.json");
const Eris = require('eris');

const spotifyApi = new SpotifyWebApi({
    clientId: spotify.clientID,
    clientSecret: spotify.clientSecret
});

// const video = document.getElementById('myVideo');
// video.currentTime = 10;

async function renewSpotify() {
    // Retrieve an access token
    spotifyApi.clientCredentialsGrant().then(
        (data) => {
            console.debug('The access token expires in ' + data.body['expires_in']);
            console.debug('The access token is ' + data.body['access_token']);

            // Save the access token so that it's used in future calls
            spotifyApi.setAccessToken(data.body['access_token']);
        },
        (err) => {
            console.log(
                'Something went wrong when retrieving an access token',
                err.message
            );
        }
    ).catch(e => { })
}

const isValidUrl = urlString => {
    var urlPattern = new RegExp('^(https?:\\/\\/)?' + // validate protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // validate fragment locator
    return !!urlPattern.test(urlString);
}

class spotifyC {
    async data(url) {
        let clean = url.replace("https://open.spotify.com/", "")
        if (clean.startsWith("playlist")) {
            let id = clean.replace("playlist/", "")
            let songData = await spotifyApi.getPlaylist(id)
            return { data: songData.body.tracks.items, type: 1 }
        } else if (clean.startsWith("track")) {
            let id = clean.replace("track/", "")
            let songData = await spotifyApi.getTrack(id)
            return { data: songData.body, type: 2 }
        } else if (clean.startsWith("album")) {
            let id = clean.replace("album/", "")
            let songData = await spotifyApi.getAlbum(id)
            return { data: songData.body.tracks.items, type: 3 }
        }
    }
    async get(url) {
        let sData = await this.data(url)
        switch (sData.type) {
            case 1: {
                var o = []
                for (var trackData of sData.data) {
                    if (trackData && trackData.track) o.push(`${trackData.track.name} BY: ${trackData.track.artists[0].name}`)
                }
                return o
                break
            }
            case 3: {
                var o = []
                for (var trackData of sData.data) {
                    if (trackData && trackData.name) o.push(`${trackData.name} BY: ${trackData.artists[0].name}`)
                }
                return o
                break
            }
            case 2: {
                return `${sData.data.name} BY: ${sData.data.album.artists[0].name}`
                break
            }
            default: {
                console.log("WARNING WTF", sData)
            }
        }
    }
}

class music {
    /**
     * 
     * @param {Eris.Client} bot 
     */
    constructor(bot) {
        this.spotify = new spotifyC()
        this.bc = new BroadcastChannel("com")
        renewSpotify()
        setInterval(() => {
            renewSpotify()
        }, 120 * 1000)
        
        setInterval(async () => {
            if (!bot.ready) return
            const servers = bot.guilds
            for (var serverID of servers.keys()) {
                var vc = bot.voiceConnections.get(serverID)

                // Checks if we have songs pending OR if we are in a VC (and its ready)
                if (await dataHelper.server.song.check(serverID) || (vc && vc?.ready)) {
                    // console.log(serverID, "Has song(s) in line!")
                    // console.log(bot.guilds.get(serverID).voiceStates)
                    const songServerDB = await dataHelper.server.database.getSong(serverID)
                    const voiceChannelID = await songServerDB.get("channel")
                    // console.log("channel",voiceChannelID)
                    if (!vc) vc = await bot.joinVoiceChannel(voiceChannelID)
                    // console.log("Voice status", "Playing", vc?.playing, "Paused", vc?.paused, "Timestamp", vc?.current?.playTime)
                    if (vc && vc.ready) {
                        if (!vc.playing && !vc.paused) {
                            const song = await dataHelper.server.song.getNext(serverID)
                            var songPath = path.join(songsPath, `${song}.mp4`)
                            if (fs.existsSync(songPath)) {
                                vc.play(songPath, { inlineVolume: true })
                            } else {
                                console.log("Big error, can't find file!")
                            }
                            
                        }

                        // Web sync
                        if (vc.playing || vc.paused) {
                            this.bc.postMessage({
                                type: "webplayerSync",
                                song: await songServerDB.get("currentSong"),
                                paused: vc.paused,
                                timestamp: vc?.current?.playTime,
                                guild: serverID,
                                channel: vc.channelID
                            })
                        }

                        // console.log("Playing", song, songPath, await duration(songPath) * 1009)
                    }
                }
            }
        }, 300)
    }

    async download(url) {
        if (url) {
            // check if string or array
            if (Array.isArray(url)) {
                var outs = []
                for (var i of url) {
                    var d = await this.download(i.url)
                    outs.push(d)
                }
                return outs
            } else if (url && isValidUrl(url.url)) {
                return new Promise(async (resolve, reject) => {
                    let fileName = yt_download.getURLVideoID(url.url)
                    const outputfile = path.join(songsPath, `${fileName}.mp4`)

                    // check if the file exists
                    if (fs.existsSync(outputfile)) {
                        console.log("Using cached file")
                        return resolve({ file: fileName, action: "cache"})
                    } else {
                        var info = await yt_download.getInfo(url.url)
                        // console.log(info.formats)
                        var toSave = info.formats.filter((format) => format.hasVideo && format.hasAudio)
                        var middle = toSave[Math.floor(toSave.length / 2)] ?? { itag: "lowest" }; // default to lowest

                        const stream = yt_download(url.url, { quality: middle.itag });

                        // `./data/songs/${fileName}.mp4`

                        stream.pipe(fs.createWriteStream(outputfile));

                        stream.on('end', async () => {
                            return resolve({ file: fileName, action: "download"})
                        }).on("progress", async (chunkLength, downloaded, total) => {
                            var MB = downloaded / 1000000;
                            var MBTotal = total / 1000000;

                            var KB = downloaded / 1000;
                            var KBTotal = total / 1000;

                            var percent = (downloaded / total) * 100;
                            this.comment = `${fileName.replace("./songs/", "").replace(".mp4", "").replaceAll(".", "")}: ${percent}% - ${MB}MB of ${MBTotal}MB OR ${KB}KB of ${KBTotal}KB`
                            console.debug(this.comment);

                            if (percent == 100) {
                                resolve({ file: fileName, action: "download"})
                            }

                        }).on("error", (err) => {
                            console.log("discord song download error", err);
                            return resolve({ file: null, action: "error"})
                        })
                    }
                })
            }
        }

    }

    async lookupSong(songName) {
        var ytData = await yt_Search(songName)
        return ytData?.videos[0] ?? null
    }
    async getURL(song) {
        if (isValidUrl(song)) {
            const urlData = new URL(song)
            const urlList = urlData.searchParams.get("list")
            const urlID = urlData.searchParams.get("v")
            if (urlList) {
                var urls = []
                const videosData = await yt_Search({ listId: urlList })
                if (videosData.videos && videosData.videos.length > 0) {
                    for (var videoData of videosData.videos) {
                        urls.push({
                            url: `https://www.youtube.com/watch?v=${videoData.videoId}`,
                            title: videoData.title,
                            uploader: videoData.author.name
                        })
                    }
                }
                return urls
            } else if (urlID) {
                const videoData = await yt_Search({ videoId: urlID })
                return {
                    url: videoData.url,
                    title: videoData.title,
                    uploader: videoData.author.name
                }
            }
        } else {
            const videoData = await this.lookupSong(song)
            return {
                url: videoData.url,
                title: videoData.title,
                uploader: videoData.author.name
            }
        }
    }
    /**
     * 
     * @param {String} song
     * @param {*} guildID
     * @param {*} channelID
     * @param {Client} _bot
     * @param {Eris.CommandInteraction} _interaction
     */
    async add(song, guildID, channelID, _bot, _interaction, _shutUp = false) {
        if (song.includes("open.spotify.com")) {
            var data = await this.spotify.get(song)
            console.log("Spotify Data", data)
            if (Array.isArray(data)) {
                for (var sName of data) {
                    await this.add(sName, guildID, channelID, _bot, _interaction, true)
                }
                await _interaction.createFollowup(`Added songs from ${song}`)
                return
            } else song = data
        }
        // Song can be a URL or song name
        const urlData = await this.getURL(song)
        if (!_shutUp) await _interaction.createFollowup("Got song URL!")
        if (song) {
            var videoInfo = await this.download(urlData)
            if (Array.isArray(videoInfo)) {
                var big = ""
                for (var data of videoInfo) {
                    if (videoInfo.action == "error") continue
                    await dataHelper.server.song.add(guildID, channelID, data.file)
                }
                if (!_shutUp) await _interaction.createFollowup(`Added ${Object.keys(videoInfo).length} songs`)
                return
            } else {
                // console.log(song, urlData, videoInfo)
                if (videoInfo.action == "error" && !_shutUp) return await _interaction.createFollowup("Error downloading song!")
                if (!_shutUp) await _interaction.createFollowup(`Using ${videoInfo.action} for ${song}`)
                await dataHelper.server.song.add(guildID, channelID, videoInfo.file)
                return
            }
        }
    }
}

module.exports = music