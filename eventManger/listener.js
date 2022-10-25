const eventEmitter = require('../eventManger/index.js')

var readyModels = 0;

eventEmitter.on("ready", () => {
    readyModels++;
    if (readyModels == 4) {
        console.log("Project started!")
    }
})