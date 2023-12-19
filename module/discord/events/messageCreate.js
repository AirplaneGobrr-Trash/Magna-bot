const dysnomia = require("@projectdysnomia/dysnomia");;
const utils = require("../../helpers/utils")
const client = require("../../helpers/clientBuilder")

module.exports = {
    name: "messageCreate",
    /**
     * 
     * @param {dysnomia.Message} msg
     * @param {dysnomia.Client} bot 
     */
    async execute(msg, bot){
        if (msg.type === dysnomia.Constants.MessageTypes.CHAT_INPUT_COMMAND) {
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