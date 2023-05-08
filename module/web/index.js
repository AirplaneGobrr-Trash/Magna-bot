const { app, express, http, io, server } = require('./web')
const apiB = require('../twitch/api');
const utils = require('../helpers/utils')

const path = require('path')

const dbBuilder = require("@airplanegobrr/database")
const db = new dbBuilder()

const { parentPort, BroadcastChannel } = require("worker_threads")

const bc = new BroadcastChannel("com")

const streamerAPI = new apiB({
    clientID: "y32z2hefjjijzxcpv3md5x4ee4ngvu",
    clientSecret: "vc564cqo3q8co44nm22z355rmhlour",
    callbackURL: "https://magna.airplanegobrr.xyz/auth/twitch/callback",
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
});

const baseAPI = new apiB({
    clientID: "y32z2hefjjijzxcpv3md5x4ee4ngvu",
    clientSecret: "vc564cqo3q8co44nm22z355rmhlour",
    callbackURL: "https://magna.airplanegobrr.xyz/auth/twitch/callback",
    scopes: [
        "user:read:email"
    ]
})

async function authMake(oldToken = null){
    if (oldToken && await db.has(`users.${oldToken}`)) await db.delete(`users.${oldToken}`)
    
    var uuid = utils.generateUUID()
    await db.set(`users.${uuid}`, {})
    return uuid
}

async function authCheck(req, res, next) {
    var token = req.cookies.token
    if (token) {
        if (await db.has(`users.${token}`)) {
            console.log("Vaild token")
            req.token = token
            req.twitch = null
            // check for twitch data
            const twitchData = await db.get(`users.${token}.twitch.auth`)
            if (twitchData?.access_token) {
                // check if vaild
                baseAPI.users(twitchData.access_token).then(user => {
                    req.twitch = user.data[0]
                    return next()
                }).catch(err => {
                    // Get status code of error
                    console.log(err.response)
                    return next()
                })
            } else return next()
            
        } else {
            console.log("Invalid token")
            // delete cookie and redirect
            res.cookie("token", null)
            var uuid = await authMake()
            res.cookie("token", uuid)
            return next()
        }
    } else {
        console.log("No token")
        var uuid = await authMake()
        res.cookie("token", uuid)
        return next()
    }
}

app.get('/', authCheck, async (req, res) => {
    console.log(req.twitch)
    var twitchMessage = ""
    if (req.twitch){
        twitchMessage = `Twitch: ${req.twitch.display_name}, `
    } else {
        twitchMessage = "You currently are not logged in, login <a href='/auth/twitch'>here</a>"
    }
    res.send(`Hello ${req.token}, ${twitchMessage}`)
});

app.get("/streamScript", (req, res) => {
    res.sendFile(path.join(__dirname,"..", "extension", "stream.js"))
})

app.get('/auth/twitch', authCheck, (req, res) => {
    if (req.query.streamer) return res.redirect(streamerAPI.getAccessURL())
    res.redirect(baseAPI.getAccessURL()) 
});

app.get('/twitch', authCheck, async (req, res) => {
    res.send(`Looks like you are logged in as ${req?.twitch?.display_name}, You should see a message in your twitch chat!`)
})
app.get("/twitch/user", authCheck, async (req, res) => {
    try {
        const tokenData = await db.get(`users.${req.token}.twitch.auth`)
        const user = await baseAPI.users(tokenData.access_token, req.query.user)
        res.json(user)
    } catch (error) {
        console.log(error)
        res.send("Error")
    }
})

app.get('/auth/twitch/callback', authCheck, async (req, res) => {
    try {
        var tk = await baseAPI.getAccessToken(req.query.code)
        if (tk) {
            const token = req.cookies.token
            const user = (await baseAPI.users(tk.access_token)).data[0]
            // console.log(user, tk)
            await db.set(`users.${token}.twitch.auth`, tk)
            if (user) {
                await db.set(`users.${token}.twitch.user`, user)
                await db.set(`twitch.${user.login}.webID`, token)
                bc.postMessage({type: "sendMessage", message: "Linked!", channel: user.login})
            }

            res.redirect("/twitch")
        } else {
            res.status(500).send('error')
        }
    } catch (err) {
        console.log(err)
        // res.redirect('/auth/twitch')
    }
})

io.on('connection', (socket) => {
    console.log('a user connected');
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});