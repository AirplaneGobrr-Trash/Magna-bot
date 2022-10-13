const eventEmitter = require('../eventManger/index.js')

var readyModels = 0;

eventEmitter.on("ready", () => {
    readyModels++;
    console.log(readyModels)
})