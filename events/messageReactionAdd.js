const eris = require("eris");
const sokoban = require("../helpers/games/sokoban")
const dataHelper = require("../helpers/dataHelper")

module.exports = {
    name: "messageReactionAdd",
    /**
     * 
     * @param {eris.Message} msg 
     * @param {eris.Emoji} emoji 
     * @param {eris.User} user 
     * @param {eris.Client} bot 
     */
    async execute(msg, emoji, user, bot) {
        if (user.id == bot.user.id) return

        var gameUUID = null

        if (!msg.embeds) {
            var ch = await bot.getChannel(msg.channel.id)
            var ms = await ch.getMessage(msg.id)
            if (ms.embeds) msg = ms
        }
        if (msg.embeds && msg.embeds[0] && msg.embeds[0].fields && msg.embeds[0].fields[0]) {
            gameUUID = msg.embeds[0].fields[0].value
        }

        if (gameUUID) {
            var serverDB = await dataHelper.server.database.getSokoban(msg.guildID)
            var gameData = await serverDB.get(`data.${gameUUID}`)
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
                                title: `Sokoban Level ${newGame.level + 1}`,
                                description: newGame.gameToString().replaceAll("🧱", "🌫️"),
                                fields: [
                                    {
                                        name: `UUID`,
                                        value: gameUUID
                                    }
                                ]
                            }
                        })
                        await serverDB.set(`data.${gameUUID}.gameData`, newGame.exportGame())
                        await serverDB.set(`data.${gameUUID}.startData`, newGame.exportGame())
                        // await msg.removeReaction("✅")
                        await msg.removeReactionEmoji("✅")
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
                case "🔃": {
                    console.log("GAME RESET!")
                    await serverDB.set(`data.${gameUUID}.gameData`, gameData.startData)
                    var tmpGame = new sokoban(null, null, gameData.startData)
                    msg.removeReaction(emoji.name, user.id)
                    return msg.edit({
                        content: "GAME RESET!",
                        embed: {
                            title: `Sokoban Level ${game.level + 1}`,
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
            await serverDB.set(`data.${gameUUID}.gameData`, game.exportGame())
            msg.removeReaction(emoji.name, user.id)
            if (game.checkWin()) {
                msg.edit({
                    content: "",
                    embed: {
                        title: `Sokoban Level ${game.level + 1}`,
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
                        title: `Sokoban Level ${game.level + 1}`,
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
    }
}