const express = require("express")
const route = express.Router()

route.get("/", (req, res)=>{
    res.render("login")
})

route.get("/discord", (req, res)=>{
    res.send("Discord")
})

route.get("/twitch", (req, res)=>{
    res.send("Twitch")
})

module.exports = route