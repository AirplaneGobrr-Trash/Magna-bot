const eris = require("eris")
const bot = eris("NzkzMjgxNDcwNjk2NjUyODIx.Gy5mgs.zmIcUscRGurOKMFwedwknj4SUwVWAyThFG9goc")

bot.on("ready", ()=>{
    console.log(bot.user)
    bot.editStatus({
        name: "coding changes",
        type: 1,
        url: "https://twitch.tv/airplanegobrr_streams"
    })
})

bot.connect()