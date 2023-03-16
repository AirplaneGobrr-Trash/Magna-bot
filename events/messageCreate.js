const discord = require("discord.js");
const utils = require("../helpers/utils")

module.exports = {
    name: discord.Events.MessageCreate,
    /**
     * 
     * @param {discord.Message} msg
     * @param {discord.Client} bot 
     */
    async execute(msg, bot){
        // eris.Constants.MessageTypes.CHAT_INPUT_COMMAND
        if (msg.type == 20) {
            if (msg.interaction.commandName == "bump" || (msg.interaction.commandName == "about" && msg.interaction.user.id == "250029754076495874")) {
                await utils.bump.add(msg.guildId, null, msg.interaction.user.id)
                msg.reply({
                    content: `Thank you for bumping our server!`
                })
            }
        }
    }
}