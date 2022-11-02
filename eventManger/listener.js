const eventEmitter = require('../eventManger/index.js')
const other = require("../other")

var readyModels = 0;

eventEmitter.on("ready", () => {
    readyModels++;
    if (readyModels == 4) {
        other.log(5, "Project started!")
    }
})