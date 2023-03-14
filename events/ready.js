const eris = require("eris");
const fs = require("fs")
const utils = require("../helpers/utils")

module.exports = {
    name: "ready",
    once: true,
    /**
     * 
     * @param {eris.Client} bot 
     */
    async execute(bot) {
        // console.log(bot)

        const commandTypes = fs.readdirSync("./commands")
        let commands = null
        let loadedCommands = new Map()

        console.log("Ready!")
        bot.editStatus({
            name: "coding changes",
            type: 1,
            url: "https://twitch.tv/airplanegobrr_streams"
        })

        commands = await bot.getCommands()
        // console.log(commands)

        for (var commandType of commandTypes) {
            const commandFiles = fs.readdirSync(`./commands/${commandType}`)
            for (var commandFile of commandFiles) {
                const commandData = require(`../commands/${commandType}/${commandFile}`)
                let commandD = commandData.command

                loadedCommands.set(commandD.name, commandData)

                let foundName = commands.find(e => e.name == commandD.name)
                let foundDes = commands.find(e => e.description == commandD.description)

                let update = !foundDes || !foundName || commandData?.alwaysUpdate

                console.log(`Should update command "${commandD.name}" ${update}`)
                if (update) {
                    // console.log(`Updated "${commandD.name}"`)
                    await bot.createCommand(commandD)
                } else {
                }
            }
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