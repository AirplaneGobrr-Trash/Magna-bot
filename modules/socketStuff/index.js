const cookie = require("cookie")

async function start(){
    var eventEmitter = global.stuff.eventEmitter
    eventEmitter.emit("ready")

    var io = global.stuff.io

    eventEmitter.on("checked", (data)=>{
        io.emit("checked", data)
    })

    io.on('connection', async (socket) => {
        console.log('a new user connected');
        var cookies = cookie.parse(socket.handshake.headers.cookie)
        console.log(cookies)
        socket.on("getCheck", ()=>{
            socket.emit("checked", global.data)
        })
    });
}

module.exports = {
    start
}