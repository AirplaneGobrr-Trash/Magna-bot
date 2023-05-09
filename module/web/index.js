const { app, express, http, io, server } = require('./web')
const apiB = require('../twitch/api');
const utils = require('../helpers/utils')

const path = require('path')
const fs = require("fs")

const dbBuilder = require("@airplanegobrr/database")
const db = new dbBuilder()

const { parentPort, BroadcastChannel } = require("worker_threads")

const bc = new BroadcastChannel("com")

bc.onmessage = (event) => {
    const data = event.data
    if (data.type == "webplayerSync") {
        // console.log("sending message: ", data)
        io.to(data.guild.toString()).emit("webplayerSync", data)
    }
}

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

app.use("/login", (require("./routes/login")))

app.get("/", (req, res)=>{
    // res.render("t")
    res.send("Not done, This will act as a config system as well as a video player for the songs")
})

app.get("/room/:id", (req, res)=>{
    res.render("room", {
        serverID: req.params.id
    })
})

app.get("/song/:song", (req, res)=>{
    const filePath = path.join(__dirname, "..", "..", "data", "songs", `${req.params.song}.mp4`)
    // check for file
    if (fs.existsSync(filePath)){
        res.sendFile(filePath)
    } else {
        res.send("Not Found!")
    }
})

app.get("/streamScript", (req, res) => {
    res.sendFile(path.join(__dirname,"..", "extension", "stream.js"))
})

io.on('connection', (socket) => {
    console.log('a user connected', socket.handshake.auth);
    if (socket.handshake.auth.server) {
        console.log("Sending to server", socket.handshake.auth.server)
        socket.join(socket.handshake.auth.server.toString())
    }
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});