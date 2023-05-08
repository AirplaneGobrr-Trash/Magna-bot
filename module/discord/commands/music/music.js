const eris = require("eris");
const client = require("../../../helpers/clientBuilder")
const { discord: { optionsPraser } } = require("../../../helpers/utils")

const Constants = eris.Constants;

module.exports = {
    alwaysUpdate: true,
    command: {
        name: "music",
        description: "All music stuff!",
        // type: Constants.ApplicationCommandTypes.CHAT_INPUT,
        options: [ //An array of Chat Input options https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure
            {
                name: "add",
                description: "Add a song!",
                type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
                options: [
                    {
                        name: "song", //The name of the option
                        description: "Song name, YouTube URL, or Spotify URL!",
                        type: Constants.ApplicationCommandOptionTypes.STRING, //This is the type of string, see the types here https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
                        required: false
                    }
                ]
            },
            {
                name: "queue",
                description: "Gets the current queue!",
                type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            }
        ]
    },

    /**
     * 
     * @param {eris.CommandInteraction} interaction 
     * @param {client} bot 
     */
    async execute(interaction, bot) {
        // await interaction.createMessage({tts: true, content: "Test!"})
        // await interaction.createFollowup({tts: true, content: "Test!", flags: 64})
        // let options = {}
        // if (interaction.data.options) for (var opt of interaction.data.options) {
        //     options[opt.name] = opt.value ?? opt
        // }
        const options = await optionsPraser(interaction.data.options)
        const command = Object.keys(options)[0]
        console.log("CommandOptions", command, options)
        switch (command) {
            case "queue": {
                break
            }
            case "add": {
                if (interaction.member.voiceState.channelID) {
                    await interaction.createMessage("Mk")
                    console.log("add song")
                    bot.music.add(options[command].song, interaction.guildID, interaction.member.voiceState.channelID)
                } else {
                    await interaction.createMessage({ content: "You need to be in a voice channel to use this command!" })
                }
            }
        }
    }
}