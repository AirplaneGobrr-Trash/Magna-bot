const eris = require("eris");
const utils = require("../../helpers/utils")
const client = require("../../helpers/clientBuilder")

module.exports = {
    name: "voiceChannelJoin",
    /**
     * 
     * @param {eris.Member} member
     * @param {eris.VoiceChannel} channel
     * @param {eris.Client} bot
     */
    async execute(member, channel, bot){
        utils.discord.checkIfBitrateChange(member, channel, bot)
    }
}