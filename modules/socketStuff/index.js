async function start(){
    var eventEmitter = global.stuff.eventEmitter
    eventEmitter.emit("ready")
}

module.exports = {
    start
}