const discord = require("discord.js");

module.exports = {
    name: discord.Events.InteractionCreate,
    /**
     * 
     * @param {discord.Interaction} interaction
     * @param {discord.Client} bot 
     */
    async execute(interaction, bot){
        console.log(interaction)
        if (interaction instanceof discord.CommandInteraction) {
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