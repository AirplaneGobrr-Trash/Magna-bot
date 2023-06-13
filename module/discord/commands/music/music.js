const eris = require("eris");
const client = require("../../../helpers/clientBuilder")
const { discord: { optionsPraser } } = require("../../../helpers/utils");
const dataHelper = require("../../../helpers/dataHelper");
const path = require("path")
const progressbar = require('string-progressbar');

const Constants = eris.Constants;

module.exports = {
    alwaysUpdate: true,
    command: {
        name: "music",
        description: "All music stuff!",
        // type: Constants.ApplicationCommandTypes.CHAT_INPUT,
        options: [ //An array of Chat Input options https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure
            {
                name: "play",
                description: "Play a song!",
                type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
                options: [
                    {
                        name: "song", //The name of the option
                        description: "Song name, YouTube URL, or Spotify URL!",
                        type: Constants.ApplicationCommandOptionTypes.STRING, //This is the type of string, see the types here https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
                        required: true
                    }
                ]
            },
            {
                name: "volume",
                description: "Change volume!",
                type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
                options: [
                    {
                        name: "volume", //The name of the option
                        description: "Volume to be set to",
                        type: Constants.ApplicationCommandOptionTypes.STRING, //This is the type of string, see the types here https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
                        required: true
                    }
                ]
            },
            {
                name: "queue",
                description: "Gets the current queue!",
                type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            },
            {
                name: "skip",
                description: "Skips the current song",
                type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            },
            {
                name: "clear",
                description: "Clears the queue",
                type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            },
            {
                name: "pause",
                description: "Toggles if playing or paused for the current song",
                type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            },
            {
                name: "loop",
                description: "Toggles loop mode",
                type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
                options: [
                    {
                        name: "enabled", //The name of the option
                        description: "Weather to enable or disable loop",
                        type: Constants.ApplicationCommandOptionTypes.BOOLEAN, //This is the type of string, see the types here https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
                        required: false
                    }
                ]
            },
            {
                name: "silent",
                description: "Makes it so song names aren't shown and that the messages are hidden",
                type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
                options: [
                    {
                        name: "enabled", //The name of the option
                        description: "Weather to enable or disable silent mode",
                        type: Constants.ApplicationCommandOptionTypes.BOOLEAN, //This is the type of string, see the types here https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
                        required: false
                    }
                ]
            },
            {
                name: "textchannel",
                description: "Sets the song channel, can be set to force use with stricttextmode",
                type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
                options: [
                    {
                        name: "channel", //The name of the option
                        description: "Song channel",
                        type: Constants.ApplicationCommandOptionTypes.CHANNEL, //This is the type of string, see the types here https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
                        required: true
                    }
                ]
            },
            {
                name: "stricttextmode",
                description: "Makes it so music commands will only work in one channel",
                type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
                options: [
                    {
                        name: "enabled", //The name of the option
                        description: "Weather to enable or disable strict text mode.",
                        type: Constants.ApplicationCommandOptionTypes.BOOLEAN, //This is the type of string, see the types here https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
                        required: true
                    }
                ]
            },
            {
                name: "timeleft",
                description: "Says how much time is left for the current song",
                type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND
            },
            {
                name: "autoleave",
                description: "Should the bot leave if no members are in vc?",
                type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
                options: [
                    {
                        name: "enabled", //The name of the option
                        description: "Weather to enable or disable auto leave mode.",
                        type: Constants.ApplicationCommandOptionTypes.BOOLEAN, //This is the type of string, see the types here https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
                        required: true
                    }
                ]
            }
        ]
    },

    /**
     * 
     * @param {eris.CommandInteraction} interaction 
     * @param {client} bot 
     */
    async execute(interaction, bot) {
        const options = await optionsPraser(interaction.data.options)
        const command = Object.keys(options)[0]
        const serverDB = await dataHelper.discord.server.database.getSong(interaction.guildID)
        const channel = await serverDB.get("textChannel")
        const strict = await serverDB.get("strict")
        const isSilent = await serverDB.get("silent")

        let nonStrictCommands = ["textchannel", "stricttextmode"]

        if (strict && (!nonStrictCommands.includes(command)) && interaction.channel.id != channel) return interaction.createMessage({ flags: 64, content: `This server has strict mode on, please use <#${channel}> to do commands!`})

        // console.log("CommandOptions", command, options)
        switch (command) {
            case "queue": {
                break
            }
            case "clear": {
                let vc = bot.voiceConnections.get(interaction.guildID)
                if (vc) {
                    await serverDB.set("songs", [])
                    vc.stopPlaying()
                    await interaction.createMessage("Cleared queue!")
                    break
                }
                break
            }
            case "pause": {
                let vc = bot.voiceConnections.get(interaction.guildID)
                if (vc) {
                    if (vc.paused) {
                        vc.resume()
                        await interaction.createMessage(`Resumed`)
                    } else {
                        vc.pause()
                        await interaction.createMessage(`Paused`)
                    };
                    break
                }
                break
            }
            case "volume": {
                let vc = bot.voiceConnections.get(interaction.guildID)
                if (vc) {
                    vc.setVolume(options[command].volume)
                    await interaction.createMessage("Set volume to " + options[command].volume)
                    break
                }
                await interaction.createMessage(`Not in VC!`)

                break
            }
            case "play": {
                if (interaction.member.voiceState.channelID) {
                    await interaction.createMessage("Looking up `" + options[command].song + "`")
                    await bot.music.add(options[command].song, interaction.guildID, interaction.member.voiceState.channelID, bot, interaction)
                } else {
                    await interaction.createMessage({ content: "You need to be in a voice channel to use this command!" })
                }
                break
            }
            case "skip": {
                let vc = bot.voiceConnections.get(interaction.guildID)
                if (vc) {
                    vc.stopPlaying()
                    await interaction.createMessage("Skiped song!")
                    break
                }
                await interaction.createMessage("Not playing!")
                break
            }
            case "loop": {
                if (interaction.member.voiceState.channelID) {
                    let stat = await bot.music.enableMode(interaction.guildID, 1, options[command]?.enabled ?? null)
                    await interaction.createMessage(stat ? "Loop mode is now on!" : "Loop mode is now off.")
                    break
                }
                await interaction.createMessage("Not in VC!")
                break
            }
            case "silent": {
                let stat = await bot.music.enableMode(interaction.guildID, 2, options[command]?.enabled ?? null)
                await interaction.createMessage(stat ? "silent mode is now on!" : "silent mode is now off.")
                break
            }
            case "autoleave": {
                let stat = await bot.music.enableMode(interaction.guildID, 3, options[command]?.enabled ?? null)
                await interaction.createMessage(stat ? "auto leave mode is now on!" : "auto leave mode is now off.")
                break
            }
            case "textchannel": {
                let c = options[command].channel
                await serverDB.set("textChannel", c)
                await interaction.createMessage({ flags: 64, content: `Channel is now set to <#${c}>`})
                break
            }
            case "stricttextmode": {
                let e = options[command].enabled
                await serverDB.set("strict", e)
                await interaction.createMessage({ flags:64, content: `Strict mode is now ${e ? "on" : "off"}.`})
                break
            }
            case "timeleft": {
                let currentSong = await serverDB.get("currentSong")
                let dur = await serverDB.get("currentSongDur")
                let { title } = require(path.join(dataHelper.mainDataPath, "songs", currentSong, "data.json"))
                let vc = bot.voiceConnections.get(interaction.guildID)

                let bar = progressbar.splitBar(dur,vc.current.playTime, 20)

                await interaction.createMessage(`Playing: ${"`"}${title}${"`"}, ${bar[0]} | ${bar[1]} (${vc.current.playTime} out of ${dur})`)
            }
        }
    }
}