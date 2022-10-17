const eventEmitter = require('./eventManger/index.js')

const express = require('express')
const app = express()
const socketio = require('socket.io')
const http = require('http')
const server = http.createServer(app)
const io = socketio(server)

const fs = require("fs")
const other = require("./other")

global.stuff = { express, app, server, io, eventEmitter, other }

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

const modules = fs.readdirSync("modules")
for (var file of modules){
    require(`./modules/${file}`).start()
}


eventEmitter.emit("ready")