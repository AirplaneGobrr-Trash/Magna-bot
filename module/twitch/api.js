const axios = require('axios').default;

class TwitchAPI {
    /**
     * 
     * @param {Object} options 
     * @param {String} options.clientID 
     * @param {String} options.clientSecret
     * @param {String} options.scopes
     * @param {String} options.callbackURL
     */
    constructor(options = {}) {
        this.options = options

        console.log(this.options)

        this.clientID = options.clientID
        this.clientSecret = options.clientSecret
        this.scopes = options.scopes ?? []
        this.callbackURL = options.callbackURL

        this.endpoint = "https://api.twitch.tv/helix"
    }

    refreshToken(code) {
        return new Promise((resolve, reject) => {
            axios.post('https://id.twitch.tv/oauth2/token', {
                client_id: this.clientID,
                client_secret: this.clientSecret,
                grant_type: 'refresh_token',
                refresh_token: code
            })
        })
    }
    getAccessToken(code) {
        return new Promise(async (resolve, reject) => {

            axios.post('https://id.twitch.tv/oauth2/token', {
                client_id: this.clientID,
                client_secret: this.clientSecret,
                grant_type: 'authorization_code',
                redirect_uri: this.callbackURL,
                code: code
            }).then((response) => {
                if (response.data?.expires_in) {
                    this.tokenV = response.data.access_token
                    this.refreshTokenV = response.data.refresh_token
                    resolve({
                        access_token: null,
                        refresh_token: null,
                        ...response.data
                    })
                } else {
                    reject(response)
                }
            }).catch((error) => {
                reject(error)
            })
        })
    }
    getAccessURL() {
        return `https://id.twitch.tv/oauth2/authorize?client_id=${this.clientID}&redirect_uri=${this.callbackURL}&response_type=code&scope=${this.scopes.join('%20')}`
    }
    users(token = this.tokenV, user = null) {
        return new Promise((resolve, reject) => {
            axios.get(`https://api.twitch.tv/helix/users${user ? `?login=${user}` : ""}`, {
                headers: {
                    'Client-ID': this.clientID,
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.twitchtv.v5+json'
                }
            }).then(response => {
                resolve(response.data)
            }).catch((error) => {
                reject(error)
            })
        })
    }
    getFollowers(token = this.tokenV, user = null) {
        return new Promise((resolve, reject) => {
            axios.get(`https://api.twitch.tv/helix/channels/followers?broadcaster_id=${user}&first=100`, {
                headers: {
                    'Client-ID': this.clientID,
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.twitchtv.v5+json'
                }
            }).then(response => {
                resolve(response.data)
            }).catch((error) => {
                reject(error)
            })
        })
    }
}

class ScopeBuilder {
    constructor(options = {}) {
    }
}

TwitchAPI.ScopeBuilder = ScopeBuilder

module.exports = TwitchAPI;