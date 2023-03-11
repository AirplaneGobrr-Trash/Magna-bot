const eris = require("eris")
const bot = eris("NzkzMjgxNDcwNjk2NjUyODIx.Gy5mgs.zmIcUscRGurOKMFwedwknj4SUwVWAyThFG9goc")
const sokoban = require("./sokoban")

bot.on("ready", ()=>{
    console.log(bot.user)
    bot.editStatus({
        name: "coding changes",
        type: 1,
        url: "https://twitch.tv/airplanegobrr_streams"
    })
})

bot.on("messageCreate", async (msg)=>{
    if (msg.content == "start") {
        var gaTmp = new sokoban()
        await gaTmp.gen(0)
        msg.channel.createMessage({
            embed: {
                title: "Sokoban",
                description: "",
                description: gaTmp.gameToString().replaceAll("🧱", "🌫️")
            }
        })
    }
})

bot.on("messageReactionAdd", (msg, emoji, user)=>{
    console.log(msg, emoji, user)
})

bot.connect()