// const client = require("./helpers/clientBuilder")
const { Client } = require("eris")
const bot = new Client("NzkzMjgxNDcwNjk2NjUyODIx.Gy5mgs.zmIcUscRGurOKMFwedwknj4SUwVWAyThFG9goc", {
    intents: ["all", "allPrivileged", "allNonPrivileged", "guilds"]
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

bot.connect()