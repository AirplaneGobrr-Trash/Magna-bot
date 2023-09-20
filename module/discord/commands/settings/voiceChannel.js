const eris = require("eris");
const client = require("../../../helpers/clientBuilder")
const { discord: { optionsPraser } } = require("../../../helpers/utils"); // JS moment
const dataHelper = require("../../../helpers/dataHelper");

const Constants = eris.Constants;

module.exports = {
    alwaysUpdate: true,
    command: {
        name: "voicesettings",
        description: "Channel stuff",
        options: [
            {
                name: "autobitrate",
                description: "Auto change the bit rate when no one is in VC!",
                type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
                options: [
                    {
                        name: "enabled",
                        description: "Should auto bitrate be enabled? (Default: False)",
                        type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
                        required: true
                    },
                    {
                        name: "bitrate",
                        description: "Bite rate to be set to (Default: 64)",
                        type: Constants.ApplicationCommandOptionTypes.INTEGER,
                        required: false,
                        min_value: 8,
                        max_value: 128
                    },
                    {
                        name: "announce",
                        description: "Announce when the bot is changing the bitrate (WIP) (Default: False)",
                        type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
                        required: false
                    },
                    {
                        name: "botscount",
                        description: "Do bots effect if the bitrate is changed? (Default: True)",
                        type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
                        required: false
                    },
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
            case "autobitrate": {
                let info = options[command]

                const db = await dataHelper.discord.server.database.getExtra(interaction.guildID)

                if (info.botscount != undefined) await db.set("autoBitrate.botsCount", info.botscount)
                if (info.enabled != undefined) await db.set("autoBitrate.enabled", info.enabled)
                if (info.bitrate != undefined) await db.set("autoBitrate.bitrate", info.bitrate)

                interaction.createMessage("Updated autobitrate settings!")
                break
            }
        }
    }
}