const eris = require("eris");
const client = require("../../../helpers/clientBuilder")

const Constants = eris.Constants;

module.exports = {
    alwaysUpdate: true,
    command: {
        name: "test",
        description: "play command",
        type: Constants.ApplicationCommandTypes.CHAT_INPUT,
        options: [ //An array of Chat Input options https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure
            {
                name: "song", //The name of the option
                description: "Song to add",
                type: Constants.ApplicationCommandOptionTypes.STRING, //This is the type of string, see the types here https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
                required: false
            }
        ]
    },

    /**
     * 
     * @param {eris.CommandInteraction} interaction 
     * @param {client} bot 
     */
    async execute(interaction, bot){
        // await interaction.createMessage({tts: true, content: "Test!"})
        // await interaction.createFollowup({tts: true, content: "Test!", flags: 64})
        let options = {}
        if (interaction.data.options) for (var opt of interaction.data.options) {
            options[opt.name] = opt.value ?? opt
        }

        const yt_download = require("ytdl-core")

        
        if (interaction.member.voiceState.channelID) {
            await interaction.createMessage("Mk")
        } else {
            await interaction.createMessage({content: "You need to be in a voice channel to use this command!"})
        }
    }
}