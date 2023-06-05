const eris = require("eris");
const client = require("../../../helpers/clientBuilder")
const { discord: { optionsPraser } } = require("../../../helpers/utils");
const dataHelper = require("../../../helpers/dataHelper");

const Constants = eris.Constants;

module.exports = {
    alwaysUpdate: true,
    command: {
        name: "Play this",
        type: Constants.ApplicationCommandTypes.MESSAGE
    },
    /**
     * 
     * @param {eris.CommandInteraction} interaction 
     * @param {client} bot 
     */
    async execute(interaction, bot) {
        var msg = interaction.data.resolved.messages.get(interaction.data.target_id)
        var content = msg.content

        if (interaction.member.voiceState.channelID) {
            await interaction.createMessage("Looking up `" + content + "`")
            await bot.music.add(content, interaction.guildID, interaction.member.voiceState.channelID, bot, interaction)
        } else {
            await interaction.createMessage({ content: "You need to be in a voice channel to use this command!" })
        }
    }
}