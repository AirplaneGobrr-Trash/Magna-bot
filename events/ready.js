const discord = require("discord.js");
const fs = require("fs")
const utils = require("../helpers/utils")
const config = require("../config.json")

module.exports = {
    name: discord.Events.ClientReady,
    once: true,
    /**
     * 
     * @param {discord.Client} bot 
     */
    async execute(bot) {
        // console.log(bot)

        const commandTypes = fs.readdirSync("./commands")
        let commands = null
        let loadedCommands = new Map()

        console.log("Ready!")
        bot.user.setActivity({
            name: "coding changes",
            type: 1,
            url: "https://twitch.tv/airplanegobrr_streams"
        })

        commands = await bot.application.commands.fetch()
        // console.log(commands)

        var commandsUpdate = []
        for (var commandType of commandTypes) {
            const commandFiles = fs.readdirSync(`./commands/${commandType}`)
            for (var commandFile of commandFiles) {
                const commandData = require(`../commands/${commandType}/${commandFile}`)
                let commandD = commandData.command

                loadedCommands.set(commandD.name, commandData)

                commandsUpdate.push(commandD)
            }
        }
        const rest = new discord.REST({ version: '10' }).setToken(config.token);

        try {
            console.log(`Started refreshing ${commands.length} application (/) commands.`);
    
            // The put method is used to fully refresh all commands in the guild with the current set
            const data = await rest.put(
                discord.Routes.applicationCommands(bot.user.id),
                { body: commandsUpdate },
            );
    
            console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
            // And of course, make sure you catch and log any errors!
            console.error(error);
        }


        bot.loadedCommands = loadedCommands
        var pause = false
        setInterval(async ()=>{
            if (!pause) {
                pause = true
                await utils.bump.check(bot)
                pause = false
            }
        }, 30 * 1000)
    }
}