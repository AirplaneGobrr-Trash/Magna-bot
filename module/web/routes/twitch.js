const express = require("express")
const route = express.Router()

app.get('/2', authCheck, async (req, res) => {
    console.log(req.twitch)
    var twitchMessage = ""
    if (req.twitch){
        twitchMessage = `Twitch: ${req.twitch.display_name}, `
    } else {
        twitchMessage = "You currently are not logged in, login <a href='/auth/twitch'>here</a>"
    }
    res.send(`Hello ${req.token}, ${twitchMessage}`)
});



app.get('/auth/twitch', authCheck, (req, res) => {
    if (req.query.streamer) return res.redirect(streamerAPI.getAccessURL())
    res.redirect(baseAPI.getAccessURL()) 
});

app.get('/twitch', authCheck, async (req, res) => {
    res.send(`Looks like you are logged in as ${req?.twitch?.display_name}, You should see a message in your twitch chat!`)
})
app.get("/twitch/user", authCheck, async (req, res) => {
    try {
        const tokenData = await db.get(`users.${req.token}.twitch.auth`)
        const user = await baseAPI.users(tokenData.access_token, req.query.user)
        res.json(user)
    } catch (error) {
        console.log(error)
        res.send("Error")
    }
})

app.get('/auth/twitch/callback', authCheck, async (req, res) => {
    try {
        var tk = await baseAPI.getAccessToken(req.query.code)
        if (tk) {
            const token = req.cookies.token
            const user = (await baseAPI.users(tk.access_token)).data[0]
            // console.log(user, tk)
            await db.set(`users.${token}.twitch.auth`, tk)
            if (user) {
                await db.set(`users.${token}.twitch.user`, user)
                await db.set(`twitch.${user.login}.webID`, token)
                bc.postMessage({type: "sendMessage", message: "Linked!", channel: user.login})
            }

            res.redirect("/twitch")
        } else {
            res.status(500).send('error')
        }
    } catch (err) {
        console.log(err)
        // res.redirect('/auth/twitch')
    }
})

module.exports = route