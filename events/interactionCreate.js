const eris = require("eris");

module.exports = {
    name: "interactionCreate",
    /**
     * 
     * @param {eris.Interaction} interaction
     * @param {eris.Client} bot 
     */
    async execute(interaction, bot){
        console.log(interaction)
        if (interaction instanceof eris.CommandInteraction) {
            let commandName = interaction.data.name
            let command = bot.loadedCommands.get(commandName)
            if (command) {
                try { command.execute(interaction, bot) } catch (e) {
                    console.log(e)
                    if (!interaction.acknowledged) await interaction.createMessage({ tts: true, content: "Error trying to execute", flags: 64 })
                }
            } else {
                console.log(interaction)
            }
        }
    }
}