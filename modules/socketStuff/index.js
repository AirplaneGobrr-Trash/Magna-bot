async function start(){
    var eventEmitter = global.stuff.eventEmitter
    eventEmitter.emit("ready")

    var io = global.stuff.io

    eventEmitter.on("checked", (data)=>{
        io.emit("checked", data)
    })

    io.on('connection', (socket) => {
        console.log('a user connected');
      });
}

module.exports = {
    start
}