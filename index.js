const eris = require("eris")
const bot = eris("NzkzMjgxNDcwNjk2NjUyODIx.Gy5mgs.zmIcUscRGurOKMFwedwknj4SUwVWAyThFG9goc")
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

bot.connect()