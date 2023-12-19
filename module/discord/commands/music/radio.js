const dysnomia = require("@projectdysnomia/dysnomia");;
const client = require("../../../helpers/clientBuilder")
const { discord: { optionsPraser } } = require("../../../helpers/utils");
const dataHelper = require("../../../helpers/dataHelper");

const Constants = dysnomia.Constants;

module.exports = {
    alwaysUpdate: true,
    command: {
        name: "radio",
        description: "All radio stuff!",
        // type: Constants.ApplicationCommandTypes.CHAT_INPUT,
        options: [ //An array of Chat Input options https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure
            {
                name: "play",
                description: "Play a radio station!",
                type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
                options: [
                    {
                        name: "url", //The name of the option
                        description: "URL from radio garden EG http://radio.garden/listen/thegoosh-radio-deep-house/WiT8Tr9E",
                        type: Constants.ApplicationCommandOptionTypes.STRING, //This is the type of string, see the types here https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
                        required: false
                    },
                    {
                        name: "randomcountry", //The name of the option
                        description: "Takes a country (FULL NAME, EG: United States) ",
                        type: Constants.ApplicationCommandOptionTypes.STRING, //This is the type of string, see the types here https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
                        required: false
                    },
                    {
                        name: "randomcity", //The name of the option
                        description: "Takes a City + Country (EG: Los Angeles CA, United States)(copy from radio garden)",
                        type: Constants.ApplicationCommandOptionTypes.STRING, //This is the type of string, see the types here https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
                        required: false
                    }
                ]
            }
        ]
    },
    /**
     * 
     * @param {dysnomia.CommandInteraction} interaction 
     * @param {client} bot 
     */
    async execute(interaction, bot) {
        const options = await optionsPraser(interaction.data.options)
        const command = Object.keys(options)[0]
        const serverDB = await dataHelper.discord.server.database.getSong(interaction.guildID)
        
        console.log(command, options)

        switch(command){
            case "play": {
                // thegoosh-radio-deep-house/WiT8Tr9E
                var url = options[command].url
                url = url.split("/")
                var songID = url.pop()
                var songName = url.pop()
                await dataHelper.discord.server.song.add(interaction.guildID, interaction.member.voiceState.channelID, `rg/${songID}`)
                await interaction.createMessage(`Playing ${songName}`)
            }
        }
    }
}