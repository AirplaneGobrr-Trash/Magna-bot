const workerManger = require("worker_threads");

const path = require("path");
const fs = require("fs");

const modulePath = path.join(__dirname, "module");
const discordWorker = new workerManger.Worker(path.join(modulePath,"discord"));
const twitchWorker = new workerManger.Worker(path.join(modulePath, "twitch"));
const webWorker = new workerManger.Worker(path.join(modulePath, "web"));

process.on("uncaughtException", (err) => {
    console.log(err);
})