const eris = require("eris");
const sokoban = require("../../helpers/games/sokoban")
const utils = require("../../helpers/utils")
const dbBuilder = require("@airplanegobrr/database")

const Constants = eris.Constants;

module.exports = {
    alwaysUpdate: false,
    command: {
        name: "sokoban",
        description: "Play sokoban!",
        type: Constants.ApplicationCommandTypes.CHAT_INPUT,
        options: [ //An array of Chat Input options https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure
            {
                name: "action", //The name of the option
                description: "Action to do",
                type: Constants.ApplicationCommandOptionTypes.STRING, //This is the type of string, see the types here https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
                required: false,
                choices: [
                    {
                        name: "Info",
                        value: "info"
                    },
                ]
            }
        ]
    },

    /**
     * 
     * @param {eris.CommandInteraction} interaction 
     * @param {eris.Client} bot 
     */
    async execute(interaction, bot){
        // await interaction.createMessage({tts: true, content: "Test!"})
        // await interaction.createFollowup({tts: true, content: "Test!", flags: 64})
        let options = {}
        if (interaction.data.options) for (var opt of interaction.data.options) {
            options[opt.name] = opt.value ?? opt
        }

        var gaTmp = new sokoban()
        var serverDb = new dbBuilder({filename: `./data/servers/${interaction.guildID}.json`})
        var gameUUID = utils.generateUUID()
        await gaTmp.gen(0)
        await interaction.createMessage({
            embed: {
                title: `Sokoban Level ${gaTmp.level+1}`,
                description: gaTmp.gameToString().replaceAll("🧱", "🌫️"),
                fields: [
                    {
                      name: `UUID`,
                      value: gameUUID
                    }
                  ]
            }
        })
        let sMsg = await interaction.getOriginalMessage()
        // W A S D
        await sMsg.addReaction("⬆️")
        await sMsg.addReaction("⬅️")
        await sMsg.addReaction("⬇️")
        await sMsg.addReaction("➡️")
        await sMsg.addReaction("🔃")
        await serverDb.set(`games.sokoban.${gameUUID}`, {
            msgID: sMsg.id,
            userID: interaction.member.id,
            gameData: gaTmp.exportGame(),
            startData: gaTmp.exportGame()
        })
    }
}