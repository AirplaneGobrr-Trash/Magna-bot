require("../helpers/processUpdater")

const { discord: config } = require("../../config.json")
const Client = require("../helpers/clientBuilder")
// const { Client } = require("eris")
const bot = new Client(config.token, {
    intents: ["all"]
})

const path = require("path")
const fs = require("fs")

const eventsDir = fs.readdirSync(path.join(__dirname, "events")).filter(e => e.endsWith(".js"))
for (var eventFName of eventsDir) {
    const event = require(`./events/${eventFName}`)
    if (event.once) {
        bot.once(event.name, (...args) => event.execute(...args, bot));
    } else {
        bot.on(event.name, (...args) => event.execute(...args, bot));
    }
}

bot.on("error", (err)=>{
    console.log("DISCORD BOT ERROR!!!!")
    console.log(err)
})

bot.on("disconnect", ()=>{
    bot.connect()
})

bot.on("warn", (warn)=>{
    console.log("DISCORD BOT WARN!!!!")
    console.log(warn)
})

process.on("uncaughtException", (err)=>{
    if (err?.message.includes("1006")) bot.connect(); else console.log(err)
})

bot.connect()