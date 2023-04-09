const { getVideoDurationInSeconds: duration } = require('get-video-duration')
const SpotifyWebApi = require('spotify-web-api-node');
const sanitize = require("sanitize-filename");
const yt_download = require("ytdl-core")
const yt_Search = require("yt-search")
const path = require("path")
const fs = require("fs")
const dbClass = require("@airplanegobrr/database")

const { spotify } = require("../config.json");
const Eris = require('eris');

const spotifyApi = new SpotifyWebApi({
    clientId: spotify.clientID,
    clientSecret: spotify.clientSecret
});

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

    async lookupSong(songName) {
        var ytData = await yt_Search(songName)
        return ytData?.videos[0] ?? null
    }
    async add(song) {
        // Song can be a URL or song name
        
        if (isValidUrl(song)) {
            const urlData = new URL(song)
            const urlList = urlData.searchParams.get("list")
            const urlID = urlData.searchParams.get("v")
            if (urlList) {
                const videosData = await yt_Search({ listId: urlList })
                console.log("Playlist", videosData)

            } else if (urlID) {
                const videoData = await yt_Search({ videoId: urlID })
                console.log(videoData)
            }
        }

        const ytData = await this.lookupSong(song)

        if (ytData) {
            console.log(ytData)
        }
    }
}

module.exports = music