const config = require("./config.json")
const discord = require("discord.js")
const bot = new discord.Client({
    intents: new discord.IntentsBitField(3276799)

})
const fs = require("fs")

const eventsDir = fs.readdirSync("./events").filter(e => e.endsWith(".js"))
for (var eventFName of eventsDir) {
    const event = require(`./events/${eventFName}`)
    if (event.once) {
        bot.once(event.name, (...args) => event.execute(...args, bot));
    } else {
        bot.on(event.name, (...args) => event.execute(...args, bot));
    }
}


bot.login(config.token)