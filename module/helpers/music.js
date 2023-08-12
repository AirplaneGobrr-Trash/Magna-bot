const axios = require('axios').default;
const SpotifyWebApi = require('spotify-web-api-node');
const progressbar = require('string-progressbar');
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
        this.counter = 0
        this.loopRunning = false
        this.bot = bot
        renewSpotify()
        setInterval(() => {
            renewSpotify()
        }, 5 * 60 * 1000)
        setInterval(async () => {
            if (this.loopRunning) return
            this.loopRunning = true
            await this.loop()
            this.loopRunning = false
        }, 300)
    }

    async loop() {
        try {
            var bot = this.bot
            if (!bot.ready) return
            this.counter++
            const servers = bot.guilds
            for (var serverID of servers.keys()) {
                var vc = bot.voiceConnections.get(serverID)

                // Checks if we have songs pending OR if we are in a VC (and its ready)
                if (await dataHelper.server.song.check(serverID) || (vc && vc?.ready)) {
                    // console.log(bot.voiceConnections)
                    // console.log(serverID, "Has song(s) in line!")
                    // console.log(bot.guilds.get(serverID).voiceStates)
                    const songServerDB = await dataHelper.server.database.getSong(serverID)
                    const voiceChannelID = await songServerDB.get("channel")
                    const textChannelID = await songServerDB.get("textChannel")
                    const autoLeave = await songServerDB.get("autoLeave")

                    const vcTextChannel = bot.guilds.get(serverID).channels.get(textChannelID)
                    // console.log("channel",voiceChannelID)
                    if (!vc) {
                        console.log("Need to join VC!", vc)
                        vc = await bot.joinVoiceChannel(voiceChannelID.toString())
                        console.log("Joinned VC!")
                    }
                    const voiceChannel = bot.getChannel(vc.channelID)
                    // console.log("Voice status", "Playing", vc?.playing, "Paused", vc?.paused, "Timestamp", vc?.current?.playTime)
                    if (vc.ready) {
                        if (!vc.playing && !vc.paused) {
                            const song = await dataHelper.server.song.getNext(serverID)
                            if (!song) {
                                if (autoLeave && voiceChannel.voiceMembers.size == 1 && voiceChannel.voiceMembers.get(bot.user.id)) {
                                    // the only person in vc is the bot
                                    vc.disconnect()
                                    await bot.createMessage(textChannelID, `Leaving VC as no one is here! :sob:`)
                                }
                                return
                            }
                            var songPath = path.join(songsPath, song)
                            // if (song.startsWith("rg/"))

                            if (song.startsWith("rg/")) {
                                // Radio garden
                                var so = song.split("/").pop()
                                console.log("Radio garden", so)
                                const controller = new AbortController();
                                axios.get(`http://radio.garden/api/ara/content/listen/${so}/channel.mp3`, {
                                    timeout: 2000,
                                    signal: controller.signal,
                                    validateStatus: () => true,
                                }).then(async (response) => {

                                }).catch(async (error) => {
                                    console.log(error.config, error.code)
                                    if (error?.code == "ERR_CANCELED") {
                                        console.log(error.request._currentUrl)
                                        vc.play(error.request._currentUrl, {
                                            voiceDataTimeout: -1,
                                            inlineVolume: true
                                        })
                                        await bot.createMessage(textChannelID, `Now playing ${"`"}${so}${"`"}`)
                                    } else {
                                        console.log(error)
                                    }
                                })

                                setTimeout(() => {
                                    controller.abort()
                                }, 5 * 1000);

                            } else if (fs.existsSync(songPath)) {
                                console.log("Starting to play", songPath, song)
                                vc.play(path.join(songPath, "audio.mp3"), { inlineVolume: true })

                                var { title } = require(path.join(songPath, "data.json"))
                                await bot.createMessage(textChannelID, `Now playing ${"`"}${title}${"`"}`)
                            } else {
                                console.log("Can't find file!")
                                await bot.createMessage(textChannelID, `Can't find song file`)
                            }

                            if (await songServerDB.get("loop")) dataHelper.server.song.add(serverID, voiceChannelID, song)
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

                        if (false && this.counter >= 50 && vcTextChannel) {
                            this.counter = 0
                            console.log("Topic update")
                            var currentSong = await songServerDB.get("currentSong")
                            var dur = await songServerDB.get("currentSongDur")
                            var { title } = require(path.join(songsPath, currentSong, "data.json"))

                            var bar = progressbar.splitBar(dur, vc.current.playTime, 20)

                            // vcTextChannel.createMessage(`Playing: ${"`"}${title}${"`"}, ${bar[0]} | ${bar[0]}`)
                            console.log("Edit go!")
                            // vcTextChannel.edit({ topic: `Playing: ${"`"}${title}${"`"}, ${bar[0]} | ${bar[1]}` })
                            console.log("Done")
                        }
                    }

                    // console.log("Playing", song, songPath, await duration(songPath) * 1009)
                }
            }
        } catch (e) {
            console.log("ERROR", e)
            return null
        }
        return null
    }


    async download(url) {
        if (url) {
            // check if string or array
            if (Array.isArray(url)) {
                var outs = []
                for (var i of url) {
                    var d = await this.download({ url: i.url })
                    console.log(d)
                    outs.push(d)
                }
                return outs
            } else if (isValidUrl(url.url)) {
                return new Promise(async (resolve, _reject) => {
                    let videoInfo = await yt_download.getBasicInfo(url.url)
                    delete videoInfo.videoDetails.storyboards
                    delete videoInfo.videoDetails.thumbnails
                    console.log(videoInfo.videoDetails)

                    let videoID = videoInfo.videoDetails.videoId ?? yt_download.getURLVideoID(url.url)

                    const outputFolder = path.join(songsPath, videoID)
                    const output_video = path.join(outputFolder, "video.mp4")
                    const output_audio = path.join(outputFolder, "audio.mp3")
                    const output_data = path.join(outputFolder, "data.json")

                    // check if the file exists
                    if (fs.existsSync(output_video) && fs.existsSync(output_audio)) {
                        fs.writeFileSync(output_data, JSON.stringify(videoInfo.videoDetails))
                        console.log("Using cached file")
                        return resolve({ file: videoID, action: "cache" })
                    } else {
                        fs.mkdirSync(outputFolder, { recursive: true })
                        fs.writeFileSync(output_data, JSON.stringify(videoInfo.videoDetails))
                        const audioStream = yt_download(url.url, { quality: "highestaudio" });
                        const videoStream = yt_download(url.url, { quality: "highestvideo" });

                        // `./data/songs/${videoID}/video.mp4`

                        const videoDLData = { error: false, done: false, process: null }
                        const audioDLData = { error: false, done: false, process: null }

                        var inter = setInterval(async () => {
                            if (videoDLData.error && audioDLData.error) return resolve({ file: null, action: "error" })
                            if (videoDLData.done && audioDLData.done) {
                                clearInterval(inter)
                                return resolve({ file: videoID, action: "download" })
                            }
                        }, 100)

                        videoStream.pipe(fs.createWriteStream(output_video));

                        videoStream.on('end', async () => {
                            videoDLData.done = true
                        }).on("progress", async (chunkLength, downloaded, total) => {
                            var MB = downloaded / 1000000;
                            var MBTotal = total / 1000000;

                            // var KB = downloaded / 1000; var KBTotal = total / 1000;

                            var percent = (downloaded / total) * 100;
                            this.comment = `${videoID} VIDEO: ${percent}% - ${MB}MB of ${MBTotal}MB`
                            console.debug(this.comment);

                            if (percent == 100) {
                                videoDLData.done = true
                            }
                            videoDLData.process = percent

                        }).on("error", (err) => {
                            console.log("discord VIDEO download error", err);
                            videoDLData.error = true
                        })

                        audioStream.pipe(fs.createWriteStream(output_audio));

                        audioStream.on('end', async () => {
                            audioDLData.done = true
                        }).on("progress", async (chunkLength, downloaded, total) => {
                            var MB = downloaded / 1000000;
                            var MBTotal = total / 1000000;

                            // var KB = downloaded / 1000; var KBTotal = total / 1000;

                            var percent = (downloaded / total) * 100;
                            this.comment = `${videoID} AUDIO: ${percent}% - ${MB}MB of ${MBTotal}MB`
                            console.debug(this.comment);

                            if (percent == 100) {
                                audioDLData.done = true
                            }
                            audioDLData.process = percent

                        }).on("error", (err) => {
                            console.log("discord AUDIO download error", err);
                            audioDLData.error = true
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
                await _interaction.editOriginalMessage(`Added songs from ${song}`)
                return
            } else song = data
        } else if (song.startsWith("https://youtube.com/watch/") || song.startsWith("https://youtu.be/")) {
            const url = new URL(song)
            song = `https://www.youtube.com/watch?v=${url.pathname.split("/").pop()}`

        }
        // Song can be a URL or song name
        const urlData = await this.getURL(song)
        if (!_shutUp) await _interaction.editOriginalMessage("Got song URL!")
        if (song) {
            var videoInfo = await this.download(urlData)
            if (Array.isArray(videoInfo)) {
                var big = ""
                for (var data of videoInfo) {
                    console.log(data, videoInfo)
                    if (videoInfo.action == "error") continue
                    await dataHelper.server.song.add(guildID, channelID, data.file)
                }
                if (!_shutUp) await _interaction.editOriginalMessage(`Added ${Object.keys(videoInfo).length} songs`)
                return
            } else {
                // console.log(song, urlData, videoInfo)
                if (videoInfo.action == "error" && !_shutUp) return await _interaction.editOriginalMessage("Error downloading song!")
                if (!_shutUp) await _interaction.editOriginalMessage(`Using ${videoInfo.action} for ${song}`)
                await dataHelper.server.song.add(guildID, channelID, videoInfo.file)
                return
            }
        }
    }
    async enableMode(guildID, mode, value = null) {
        var db = await dataHelper.server.database.getSong(guildID)
        switch (mode) {
            case 1: { // Loop mode
                if (value == null) {
                    if (await db.has("loop")) value = !(await db.get("loop")); else value = true
                }
                await db.set("loop", value)
                return value
            }
            case 2: {
                if (value == null) {
                    if (await db.has("silent")) value = !(await db.get("silent")); else value = true
                }
                await db.set("silent", value)
                return value
            }
            case 3: {
                if (value == null) {
                    if (await db.has("autoLeave")) value = !(await db.get("autoLeave")); else value = true
                }
                await db.set("autoLeave", value)
                return value
            }
        }
    }
}

module.exports = music