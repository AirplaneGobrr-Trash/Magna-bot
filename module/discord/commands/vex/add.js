const eris = require("eris");
const client = require("../../../helpers/clientBuilder")
const { discord: { optionsPraser } } = require("../../../helpers/utils") // JS moment

const Constants = eris.Constants;

module.exports = {
    alwaysUpdate: true,
    command: {
        name: "vex",
        description: "Add a team to the Vex tracker",
        // type: Constants.ApplicationCommandTypes.CHAT_INPUT,
        options: [ //An array of Chat Input options https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure
            {
                name:"add",
                description: "Add a XYZ to Vex tracker",
                type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
                options: [
                    {
                        name: "team",
                        description: "Team",
                        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
                        required: false,
                        options: [
                                {
                                    name: "number", //The name of the option
                                    description: "Team number EG: 6627X, will Auto detect if number or ID",
                                    type: Constants.ApplicationCommandOptionTypes.STRING, //This is the type of string, see the types here https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
                                    required: false
                                },
                                {
                                    name: "id", //The name of the option
                                    description: "Team id EG: 93708, will Auto detect if number or ID",
                                    type: Constants.ApplicationCommandOptionTypes.NUMBER, //This is the type of string, see the types here https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
                                    required: false
                                }
                            ]   
                            
                        
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
    async execute(interaction, bot){
        // await interaction.createMessage({tts: true, content: "Test!"})
        // await interaction.createFollowup({tts: true, content: "Test!", flags: 64})
        
        console.log(await optionsPraser(interaction.data.options));

        await interaction.createMessage("WIP")
        // console.log(JSON.stringify(interaction.data.options, null, 2))
    }
}