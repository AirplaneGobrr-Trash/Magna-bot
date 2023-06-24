require("../helpers/processUpdater")

const { app, express, http, io, server } = require('./web')
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
    const filePath = path.join(__dirname, "..", "..", "data", "songs", req.params.song)
    const videoPath = path.join(filePath, "video.mp4")
    const audioPath = path.join(filePath, "audio.mp3")
    // check for file
    if (!fs.existsSync(videoPath) && !fs.existsSync(audioPath)){
        res.send("Not Found!")
    }

    if (req.query.audio) {
        res.sendFile(audioPath)
    } else {
        res.sendFile(videoPath)
    }
    
})

app.get("/streamScript", (req, res) => {
    res.sendFile(path.join(__dirname,"..", "extension", "stream.js"))
})

// app.use("/", require("./routes/twitch"))

io.on('connection', (socket) => {
    console.log('a user connected', socket.handshake.auth);
    if (socket.handshake.auth.server) {
        console.log("Sending to server", socket.handshake.auth.server)
        socket.join(socket.handshake.auth.server.toString())
    }
});

server.listen(3050, () => {
    console.log('listening on *:3050');
});