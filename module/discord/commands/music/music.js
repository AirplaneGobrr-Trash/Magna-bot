const eris = require("eris");
const client = require("../../../helpers/clientBuilder")
const { discord: { optionsPraser } } = require("../../../helpers/utils");
const dataHelper = require("../../../helpers/dataHelper");

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
        // console.log("CommandOptions", command, options)
        switch (command) {
            case "queue": {
                break
            }
            case "clear": {
                let vc = bot.voiceConnections.get(interaction.guildID)
                if (vc) {
                    let serverDB = await dataHelper.discord.server.database.getSong(interaction.guildID)
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
                let vc = bot.voiceConnections.get(interaction.guildID)
                if (vc) {
                    vc.stopPlaying()
                    bot.music.enableMode()
                    await interaction.createMessage("Skiped song!")
                    break
                }
                await interaction.createMessage("Not playing!")
                break
            }
        }
    }
}