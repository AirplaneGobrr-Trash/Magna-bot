async function start(){
    const expressLoginClass = require('@airplanegobrr/express-login')
    var app = global.stuff.app
    var server = global.stuff.server

    var eventEmitter = global.stuff.eventEmitter

    const login = new expressLoginClass({
        title: "Login",
        discord: {
            discordURL: "https://discord.com/api/oauth2/authorize?client_id=793281470696652821&redirect_uri=http://magna.airplanegobrr.xyz/discordAuth&response_type=code&scope=identify", // email connections guilds
            secret: "GvgtQ4R3IOd9XvNStf2tMjnv8Dj4PZEK",
            id: "793281470696652821",
            redirect: "http://magna.airplanegobrr.xyz/discordAuth"
        }
    }, "STUPID", "JWT_Token")

    //set views
    app.set('views', `${__dirname}/views`)
    //ejs
    app.set('view engine', 'ejs')
    app.use(global.stuff.express.json());
    app.use(login.runner)

    app.get('/', (req, res) => {
        res.send('Hello World!')
    })

    app.get("/userinfo", (req, res) => {
        if (req.auth) {
            // res.send(`<h1>Welcome back ${req.authInfo.user || req.authInfo.username}!</h1>`)
            res.json(req.authInfo)
        } else {
            res
            .status(401)
            .json({ message: "You need to be logged in to access this resource" });
        }
    });

    server.listen(3050, () => {
        console.log('Listening on port 3050')
        eventEmitter.emit("ready")
    })
}

module.exports = {
    start
}
