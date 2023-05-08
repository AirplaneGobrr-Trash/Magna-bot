const { getVideoDurationInSeconds: duration } = require('get-video-duration')
const SpotifyWebApi = require('spotify-web-api-node');
const yt_download = require("ytdl-core")
const yt_Search = require("yt-search")
const path = require("path")
const fs = require("fs")
const { discord: dataHelper } = require("./dataHelper")

const { spotify } = require("../config.json");
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
    async #get(url) {
        let sData = await this.data(url)
        switch (sData.type) {
            case "playlist": {
                for (var trackData of sData.data) {
                    return `${trackData.track.name} BY: ${trackData.track.artists[0].name}`
                }
                break
            }
            case "album": {
                for (var trackData of sData.data) {
                    return `${trackData.name} BY: ${trackData.artists[0].name}`
                }
                break
            }
            case "track": {
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
        // this.#spotify = new spotifyC()
    }

    async download(url){
        if (url && isValidUrl(url)) {
            // check if string or array
            if (Array.isArray(url)) {
                for (var url of url) {
                    await this.download(url[i])
                }
            } else {
                return new Promise((resolve, reject) => {
                    const stream = yt_download(songURL, { quality: "highestaudio" });
                    let fileName = yt_download.getURLVideoID(songURL)
                    stream.pipe(fs.createWriteStream(`./data/songs/${fileName}.mp4`));
        
                    stream.on('end', async () => {
                        resolve(outputfile)
                    }).on("progress", async (chunkLength, downloaded, total) => {
                        var MB = downloaded / 1000000;
                        var MBTotal = total / 1000000;
        
                        var KB = downloaded / 1000;
                        var KBTotal = total / 1000;
        
                        var percent = (downloaded / total) * 100;
                        this.comment = `${outputfile.replace("./songs/", "").replace(".mp4", "").replaceAll(".", "")}: ${percent}% - ${MB}MB of ${MBTotal}MB OR ${KB}KB of ${KBTotal}KB`
                        console.debug(this.comment);
        
                        if (percent == 100) {
                            resolve(outputfile)
                            stream.emit("end")
                        }
        
                    }).on("error", (err) => {
                        console.log(err);
                        resolve(null)
                    })
                })
            }
        }
        
    }

    async lookupSong(songName) {
        var ytData = await yt_Search(songName)
        return ytData?.videos[0] ?? null
    }
    async getURL(song){
        if (isValidUrl(song)) {
            const urlData = new URL(song)
            const urlList = urlData.searchParams.get("list")
            const urlID = urlData.searchParams.get("v")
            if (urlList) {
                var urls = null
                const videosData = await yt_Search({ listId: urlList })
                if (videosData.videos && videosData.videos.length > 0) {
                    // if its only one video then just return it
                    urls = videosData.videos.map(obj => obj.url);
                }
                return urls
            } else if (urlID) {
                const videoData = await yt_Search({ videoId: urlID })
                return videoData?.url ?? null
            }
        } else {
            const ytData = await this.lookupSong(song)
            return ytData?.url ?? null
        }
    }
    async add(song) {
        // Song can be a URL or song name
        const url = await this.getURL(song)
        const str = await this.download(url)
        
    }
}

module.exports = music