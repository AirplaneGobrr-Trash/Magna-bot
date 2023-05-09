const { Worker } = require("worker_threads");

const path = require("path");
const fs = require("fs");

const modulePath = path.join(__dirname, "module");
const discordWorker = new Worker(path.join(modulePath,"discord"));
// const twitchWorker = new Worker(path.join(modulePath, "twitch"));
const webWorker = new Worker(path.join(modulePath, "web"));

process.on("uncaughtException", (err) => {
    console.log(err);
})