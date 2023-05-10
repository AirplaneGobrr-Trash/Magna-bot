const { Worker, BroadcastChannel } = require("worker_threads");

const path = require("path");
const fs = require("fs");

let modulePath = path.join(__dirname, "module");
let discordWorker = new Worker(path.join(modulePath, "discord"));
// let twitchWorker = new Worker(path.join(modulePath, "twitch"));
let webWorker = new Worker(path.join(modulePath, "web"));

const workers = {
    discord: discordWorker,
    web: webWorker,
    // twitch: twitchWorker
};

process.on("uncaughtException", (err) => {
    console.log("head error", err);
})

const express = require("express");
const app = express();
const bc = new BroadcastChannel("update");
const { adminToken: password } = require("./config.json")

const data = {}

bc.onmessage = (event) => {
    const eData = event.data
    if (!data[eData.service]) data[eData.service] = {}
    data[eData.service].lastUpdated = new Date()
    data[eData.service][eData.type] = eData
}

app.use((req, res, next) => {
    if (req.query.pass == password) return next(); else return res.redirect("https://magna.airplanegobrr.xyz")
})

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "admin.html"))
})

app.get('/data', (_, res) => {
    const currentTime = new Date().getTime();
  
    for (let service in data) {
      const lastUpdatedTime = data[service].lastUpdated.getTime();
      const timeDifferenceInSeconds = (currentTime - lastUpdatedTime) / 1000;
  
      if (timeDifferenceInSeconds < 1) {
        data[service].status = "OK"
      } else {
        data[service].status = "DEAD"
      }
    }
  
    res.json(data)
  });
  
  

// discordWorker

app.get("/start/:service", async (req, res) => {
    await workers[req.params.service].terminate()
    workers[req.params.service] = new Worker(path.join(modulePath, req.params.service));
    res.send("ok")
})
app.get("/stop/:service", async (req, res) => {
    await workers[req.params.service].terminate()
    res.send("ok")
})

app.get("/restart/:service", async (req, res) => {
    await workers[req.params.service].terminate()
    workers[req.params.service] = new Worker(path.join(modulePath, req.params.service));
    res.send("ok")
})


app.listen(3055)