const { BroadcastChannel } = require("worker_threads");
const bc = new BroadcastChannel("update")
const v8 = require('v8');


function getFile() {
    let raw = require.main.filename
    raw = raw.replace("index.js","").replaceAll("\\", "/").split("/")
    raw.pop()


    return raw.pop();
}
const me = getFile()
const startTime = new Date()

setInterval(() => {
    const currentTime = new Date();
    const elapsedTime = (currentTime - startTime) / 1000;

    bc.postMessage({
        service: me,
        type: "update",
        processData: {
            cpuUsage: process.cpuUsage(),
            memory: v8.getHeapStatistics(),
            uptime: elapsedTime
        }
    })
}, 100);

process.on("beforeExit", () => {
    bc.postMessage({ service: me, type: "exit" })
})

process.on("uncaughtExceptionMonitor", (err, origin) => {
    bc.postMessage({ service: me, type: "error", origin: origin, info: { name: err.name, message: err.message, stack: err?.stack   } })
})