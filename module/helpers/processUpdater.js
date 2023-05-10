const { BroadcastChannel } = require("worker_threads");
const bc = new BroadcastChannel("update")

function getFile() {
    let raw = require.main.filename
    raw = raw.replace("index.js","").replaceAll("\\", "/").split("/")
    raw.pop()


    return raw.pop();
}
const me = getFile()

setInterval(() => {
    bc.postMessage({
        service: me,
        type: "update",
        
        processData: {
            cpuUsage: process.cpuUsage(),
            memory: process.memoryUsage(),
            uptime: process.uptime()
        }
    })
}, 100);

process.on("beforeExit", () => {
    bc.postMessage({ service: me, type: "exit" })
})

process.on("uncaughtExceptionMonitor", (err, origin) => {
    bc.postMessage({ service: me, type: "error", origin: origin, info: { name: err.name, message: err.message, stack: err?.stack   } })
})