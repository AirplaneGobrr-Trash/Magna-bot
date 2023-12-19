const dysnomia = require("@projectdysnomia/dysnomia");;
const utils = require("../../helpers/utils")
const client = require("../../helpers/clientBuilder")

module.exports = {
    name: "voiceChannelLeave",
    /**
     * 
     * @param {dysnomia.Member} member
     * @param {dysnomia.VoiceChannel} channel
     * @param {dysnomia.Client} bot
     */
    async execute(member, channel, bot){
        utils.discord.checkIfBitrateChange(member, channel, bot)
    }
}