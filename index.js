const eris = require("eris")
const bot = eris("NzkzMjgxNDcwNjk2NjUyODIx.Gy5mgs.zmIcUscRGurOKMFwedwknj4SUwVWAyThFG9goc")
const sokoban = require("./sokoban")
const utils = require("./utils")
const dbBuilder = require("@airplanegobrr/database")

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
        var serverDb = new dbBuilder(`./data/servers/${msg.guildID}.json`)
        var gameUUID = utils.generateUUID()
        await gaTmp.gen(0)
        let sMsg = await msg.channel.createMessage({
            embed: {
                title: `Sokoban Level ${gaTmp.level+1}`,
                description: gaTmp.gameToString().replaceAll("🧱", "🌫️"),
                fields: [
                    {
                      name: `UUID`,
                      value: gameUUID
                    }
                  ]
            }
        })
        // W A S D
        await sMsg.addReaction("⬆️")
        await sMsg.addReaction("⬅️")
        await sMsg.addReaction("⬇️")
        await sMsg.addReaction("➡️")
        await sMsg.addReaction("🔃")
        await serverDb.set(`games.sokoban.${gameUUID}`, {
            msgID: msg.id,
            userID: msg.member.id,
            gameData: gaTmp.exportGame(),
            startData: gaTmp.exportGame()
        })
    }
})

bot.on("messageReactionAdd", async (msg, emoji, user)=>{
    if (user.id == bot.user.id) return

    var gameUUID = null

    if (!msg.embeds){
        var ch = await bot.getChannel(msg.channel.id)
        var ms = await ch.getMessage(msg.id)
        if (ms.embeds) msg = ms
    }
    if (msg.embeds && msg.embeds[0] && msg.embeds[0].fields && msg.embeds[0].fields[0]) {
        gameUUID = msg.embeds[0].fields[0].value
    }

    if (gameUUID){
        var serverDb = new dbBuilder(`./data/servers/${msg.guildID}.json`)
        var gameData = await serverDb.get(`games.sokoban.${gameUUID}`)
        if (!gameData) {
            msg.removeReaction(emoji.name, user.id)
            return msg.channel.createMessage({
                content: `Can't find game for <@${user.id}> with UUID of ${"`"}${gameUUID}${"`"}`,
                messageReference: {
                    messageID: msg.id
                }
            })
        }
        if (gameData.userID != user.id) {
            msg.removeReaction(emoji.name, user.id)
            return msg.channel.createMessage({
                content: `Thats not your game! <@${user.id}>`,
                messageReference: {
                    messageID: msg.id
                }
            })
        }
        var game = new sokoban(null, null, gameData.gameData)
        switch (emoji.name) {
            case "⬆️": {
                game.movePlayerUp()
                break
            }
            case "⬅️": {
                game.movePlayerLeft()
                break
            }
            case "⬇️": {
                game.movePlayerDown()
                break
            }
            case "➡️": {
                game.movePlayerRight()
                break
            }
            case "✅": {
                if (game.checkWin()) {
                    // Create new game
                    let w = game.width + 2
                    let h = game.height + 1
                    var newGame = new sokoban(w, h)
                    await newGame.gen(game.level + 1)
                    await msg.edit({
                        content: "",
                        embed: {
                            title: `Sokoban Level ${newGame.level+1}`,
                            description: newGame.gameToString().replaceAll("🧱", "🌫️"),
                            fields: [
                                {
                                  name: `UUID`,
                                  value: gameUUID
                                }
                              ]
                        }
                    })
                    await serverDb.set(`games.sokoban.${gameUUID}.gameData`, newGame.exportGame())
                    await serverDb.set(`games.sokoban.${gameUUID}.startData`, newGame.exportGame())
                    await msg.removeReaction("✅")
                    return
                } else {
                    msg.channel.createMessage({
                        content: `Nice try <@${user.id}>. Please win first!`,
                        messageReference: {
                            messageID: msg.id
                        }
                    })
                    break
                }
                
            }
            case "🔃":{
                console.log("GAME RESET!")
                await serverDb.set(`games.sokoban.${gameUUID}.gameData`, gameData.startData)
                var tmpGame = new sokoban(null, null, gameData.startData)
                msg.removeReaction(emoji.name, user.id)
                return msg.edit({
                    content: "GAME RESET!",
                    embed: {
                        title: `Sokoban Level ${game.level+1}`,
                        description: tmpGame.gameToString().replaceAll("🧱", "🌫️"),
                        fields: [
                            {
                              name: `UUID`,
                              value: gameUUID
                            }
                          ]
                    }
                })
            }
        }
        await serverDb.set(`games.sokoban.${gameUUID}.gameData`, game.exportGame())
        msg.removeReaction(emoji.name, user.id)
        if (game.checkWin()) {
            msg.edit({
                content: "",
                embed: {
                    title: `Sokoban Level ${game.level+1}`,
                    description: `Great job <@${user.id}> you won! Click ${"`"}✅${"`"} to keep playing!`,
                    fields: [
                        {
                          name: `UUID`,
                          value: gameUUID
                        }
                      ]
                }
            })
            msg.addReaction("✅")
        } else {
            msg.edit({
                content: "",
                embed: {
                    title: `Sokoban Level ${game.level+1}`,
                    description: game.gameToString().replaceAll("🧱", "🌫️"),
                    fields: [
                        {
                          name: `UUID`,
                          value: gameUUID
                        }
                      ]
                }
            })
        }
        
        
    }
})

bot.connect()