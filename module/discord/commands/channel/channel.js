const eris = require("eris");
const client = require("../../../helpers/clientBuilder")
const { discord: { optionsPraser } } = require("../../../helpers/utils") // JS moment

const Constants = eris.Constants;

module.exports = {
    alwaysUpdate: false,
    command: {
        name: "channel",
        description: "Channel stuff",
        // type: Constants.ApplicationCommandTypes.CHAT_INPUT,
        options: [ //An array of Chat Input options https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure
            {
                name: "sync",
                description: "Sync channel with catagory",
                type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
                options: [
                    {
                        name: "channel", //The name of the option
                        description: "Channel to sync",
                        type: Constants.ApplicationCommandOptionTypes.CHANNEL, //This is the type of string, see the types here https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
                        required: false
                    }
                ]
            },
        ]
    },

    /**
     * 
     * @param {eris.CommandInteraction} interaction 
     * @param {client} bot 
     */
    async execute(interaction, bot) {
        const options = await optionsPraser(interaction.data.options)
        const command = Object.keys(options)[0]

        switch (command) {
            case "sync": {
                var channelID = options[command].channel ?? interaction.channel.id
                var channel = await bot.getChannel(channelID)
                console.log(channelID, channel)
                var catID = channel.parentID
                var cat = bot.guilds.get(interaction.guildID).channels.get(catID)
                console.log(catID)
                await interaction.createMessage({ content: "Doing", flags: 64 })
                cat.permissionOverwrites.forEach(async (value, key)=>{
                    await channel.editPermission(key, value.allow, value.deny, value.type, "Cus yea?")
                })
                await interaction.editOriginalMessage({ content: "Done.", flags: 64 })
                break
            }
        }
    }
}