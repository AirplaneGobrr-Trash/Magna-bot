const eventEmitter = require('./eventManger/index.js')

const express = require('express')
const app = express()
const socketio = require('socket.io')
const http = require('http')
const server = http.createServer(app)
const io = socketio(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    maxHttpBufferSize: 1e8 // 100 MB
});

const fs = require("fs")
const other = require("./other")

global.stuff = { express, app, server, io, eventEmitter, other, startDir: __dirname }
global.data = {}

//global.stuff.eventEmitter
// const expressMod = require("./modules/expressStuff/index.js")
// const socketMod =  require("./modules/socketStuff/index.js")
// const discordMod = require("./modules/discordStuff/index.js")
// 
// //expressMod.start(express, app, server, io, eventEmitter)
// //socketMod.start(express, app, server, io, eventEmitter)
// 
// expressMod.start()
// socketMod.start()
// discordMod.start()

const { MySQLDriver } = require("quick.db");
const mysqlDriver = new MySQLDriver({
    host: "192.168.4.121",
    user: "magna_bot",
    password: "muqZHbE#*xDScq91%Y^9ey1^vsRNvk25YVif6&wa$B3FXzD^fB",
    database: "magna",
});

async function start() {
    await mysqlDriver.connect();
    global.mysqlDriver = mysqlDriver
    const modules = fs.readdirSync("modules")
    for (var file of modules){
        require(`./modules/${file}`).start()
    }
}
start()



eventEmitter.emit("ready")