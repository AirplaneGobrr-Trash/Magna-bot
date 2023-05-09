const { Worker } = require("worker_threads");

const path = require("path");
const fs = require("fs");

var modulePath = path.join(__dirname, "module");
var discordWorker = new Worker(path.join(modulePath,"discord"));
// var twitchWorker = new Worker(path.join(modulePath, "twitch"));
var webWorker = new Worker(path.join(modulePath, "web"));

process.on("uncaughtException", (err) => {
    console.log(err);
})

const express = require("express");
const app = express();

app.get("/", (req, res)=>{
    res.send("")
})

app.listen(3055)