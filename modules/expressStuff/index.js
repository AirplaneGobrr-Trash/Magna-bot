async function start(){
    var app = global.stuff.app
    var server = global.stuff.server

    var eventEmitter = global.stuff.eventEmitter

    //set views
    app.set('views', `${__dirname}/views`)
    //ejs
    app.set('view engine', 'ejs')

    app.get('/', (req, res) => {
        res.send('Hello World!')
    })
    server.listen(3050, () => {
        console.log('Listening on port 3000')
        eventEmitter.emit("ready")
    })
}

module.exports = {
    start
}
