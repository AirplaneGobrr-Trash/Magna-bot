const expressLoginClass = require("@airplanegobrr/express-login")
const cookie = require("cookie")

const loginChecker = new expressLoginClass({}, "STUPID", "JWT_Token")

const { QuickDB } = require("quick.db");


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

        socket.on("admin/user/update", async (userID, userData, cb)=>{
            const userDB = new QuickDB({ driver: global.mysqlDriver, table: `users` });
            await userDB.set(userID, userData)
            cb(userData)
        })

        socket.on("admin/server/update", async (serverID, serverData, cb)=>{
            const serverDB = new QuickDB({ driver: global.mysqlDriver, table: `servers` });
            await serverDB.set(serverID, serverData)
            cb(serverData)
        })
    });
}

module.exports = {
    start
}