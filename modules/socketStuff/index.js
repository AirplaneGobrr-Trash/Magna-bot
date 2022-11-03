const expressLoginClass = require("@airplanegobrr/express-login")
const cookie = require("cookie")

const loginChecker = new expressLoginClass({}, "STUPID", "JWT_Token")

async function start(){
    var eventEmitter = global.stuff.eventEmitter
    eventEmitter.emit("ready")

    var io = global.stuff.io

    eventEmitter.on("checked", (data)=>{
        console.log("Got data!")
        io.emit("checked", data)
    })

    io.on('connection', async (socket) => {
        console.log('a new user connected');
        var cookies = cookie.parse(socket.handshake.headers.cookie)
        console.log(cookies)
        var check = await loginChecker.checkAuth(cookies.auth)
        console.log(check)

        socket.on("getCheck", ()=>{
            socket.emit("checked", global.data)
        })
    });
}

module.exports = {
    start
}