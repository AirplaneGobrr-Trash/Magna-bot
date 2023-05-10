const axios = require('axios').default;
const { twitch: config } = require("../../config.json")

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

        // console.log(this.options)

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

TwitchAPI.bases = {
    streamerAPI: new TwitchAPI({
        clientID: config.clientID,
        clientSecret: config.clientSecret,
        callbackURL: config.callbackURL,
        scopes: [
            "analytics:read:extensions",
            "analytics:read:games",
            "bits:read",
            "channel:edit:commercial",
            "channel:manage:broadcast",
            "channel:read:charity",
            "channel:manage:extensions",
            "channel:manage:moderators",
            "channel:manage:polls",
            "channel:manage:predictions",
            // "channel:manage:raids",
            "channel:manage:redemptions",
            "channel:manage:schedule",
            "channel:manage:videos",
            "channel:read:editors",
            "channel:read:goals",
            "channel:read:hype_train",
            "channel:read:polls",
            "channel:read:predictions",
            "channel:read:redemptions",
            // "channel:read:stream_key",
            "channel:read:subscriptions",
            "channel:read:vips",
            "channel:manage:vips",
            "clips:edit",
            // "moderation:read",
            // "moderator:manage:announcements",
            // "moderator:manage:automod",
            // "moderator:read:automod_settings",
            // "moderator:manage:automod_settings",
            // "moderator:manage:banned_users",
            // "moderator:read:blocked_terms",
            // "moderator:manage:blocked_terms",
            // "moderator:manage:chat_messages",
            // "moderator:read:chat_settings",
            // "moderator:manage:chat_settings",
            // "moderator:read:chatters",
            // "moderator:read:followers",
            // "moderator:read:shield_mode",
            // "moderator:manage:shield_mode",
            // "moderator:read:shoutouts",
            // "moderator:manage:shoutouts",
            // "user:edit",
            // "user:edit:follows",
            // "user:manage:blocked_users",
            // "user:read:blocked_users",
            "user:read:broadcast",
            "user:manage:chat_color",
            "user:read:email",
            "user:read:follows",
            "user:read:subscriptions",
            "user:manage:whispers",
            "channel:moderate",
            "chat:edit",
            "chat:read",
            // "whispers:read",
            // "whispers:edit"
        ]
    }),
    baseAPI: new TwitchAPI({
        clientID: config.clientID,
        clientSecret: config.clientSecret,
        callbackURL: config.callbackURL,
        scopes: [
            "user:read:email"
        ]
    })
}





module.exports = TwitchAPI;