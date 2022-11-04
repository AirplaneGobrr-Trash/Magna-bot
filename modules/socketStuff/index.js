const expressLoginClass = require("@airplanegobrr/express-login")
const cookie = require("cookie")

const loginChecker = new expressLoginClass({}, "STUPID", "JWT_Token")

// Change to MySQL ?
const superAdmins = [
    "250029754076495874"
]

async function start(){
    var eventEmitter = global.stuff.eventEmitter
    eventEmitter.emit("ready")

    var io = global.stuff.io

    eventEmitter.on("checked", (data)=>{
        io.to("admins").emit("checked", data)
    })

    io.on('connection', async (socket) => {
        console.log('a new user connected');
        var cookies = cookie.parse(socket.handshake.headers.cookie)
        var check = await loginChecker.checkAuth(cookies.auth)
        check.superAdmin = false
        if (superAdmins.includes(check.authInfo?.id)){
            check.superAdmin = true
        }

        if (check.auth) {
            socket.join("admins");
        }

        socket.on("getCheck", ()=>{
            if (check.auth) socket.emit("checked", { data:global.data, userdata: check }); else { socket.emit("checked", "INVAILD LOGIN!")}
        })
    });
}

module.exports = {
    start
}