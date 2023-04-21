const eris = require("eris");
const utils = require("../../helpers/utils")
const client = require("../../helpers/clientBuilder")

module.exports = {
    name: "messageCreate",
    /**
     * 
     * @param {eris.Message} msg
     * @param {eris.Client} bot 
     */
    async execute(msg, bot){
        if (msg.type === eris.Constants.MessageTypes.CHAT_INPUT_COMMAND) {
            if (msg.interaction.name == "bump" || msg.interaction.name == "about") {
                await utils.bump.add(msg.guildID, null, msg.interaction.user.id)
                msg.channel.createMessage({
                    messageReference: {
                        messageID: msg.id
                    },
                    content: `Thank you for bumping our server!`
                })
            }
        }
    }
}