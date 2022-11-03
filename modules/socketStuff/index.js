const cookie = require("cookie")

async function start(){
    var eventEmitter = global.stuff.eventEmitter
    eventEmitter.emit("ready")

    var io = global.stuff.io

    eventEmitter.on("checked", (data)=>{
        io.emit("checked", data)
    })

    io.on('connection', (socket) => {
        var cookief = socket.handshake.headers.cookie; 
        var cookies = cookie.parse(socket.handshake.headers.cookie); 
        console.log(cookief, cookies)
        console.log('a user connected');
        socket.on("getCheck", (cb)=>{
            cb(global.data)
        })
      });
}

module.exports = {
    start
}