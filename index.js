const eventEmitter = require('./eventManger/index.js')

const express = require('express')
const app = express()
const socketio = require('socket.io')
const http = require('http')
const server = http.createServer(app)
const io = socketio(server)

global.stuff = { express, app, server, io, eventEmitter }

const expressMod = require("./modules/expressStuff/index.js")
const socketMod =  require("./modules/socketStuff/index.js")
const discordMod = require("./modules/discordStuff/index.js")

//expressMod.start(express, app, server, io, eventEmitter)
//socketMod.start(express, app, server, io, eventEmitter)

expressMod.start()
socketMod.start()
discordMod.start()

eventEmitter.emit("ready")