const eris = require("eris");
const client = require("../../helpers/clientBuilder")

module.exports = {
    name: "interactionCreate",
    /**
     * 
     * @param {eris.Interaction} interaction
     * @param {client} bot 
     */
    async execute(interaction, bot){
        if (!bot.loadedCommands) return interaction.createMessage({ content: "Bot starting...", flags: 64 })
        // console.log(interaction)
        if (interaction instanceof eris.CommandInteraction) {
            let commandName = interaction.data.name
            let command = bot.loadedCommands.get(commandName)
            if (command) {
                try { command.execute(interaction, bot) } catch (e) {
                    console.log("discord int error", e)
                    if (!interaction.acknowledged) await interaction.createMessage({ tts: true, content: "Error trying to execute", flags: 64 })
                }
            } else {
                console.log(interaction)
            }
        }
    }
}