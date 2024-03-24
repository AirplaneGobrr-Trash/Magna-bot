const eris = require("eris");
const path = require("path");
const fs = require("fs")
const utils = require("../../helpers/utils")
const client = require("../../helpers/clientBuilder");
const dataHelper = require("../../helpers/dataHelper");

module.exports = {
    name: "ready",
    once: true,
    /**
     * 
     * @param {client} bot 
     */
    async execute(bot) {
        // console.log(bot)
        // bot.on("voiceChannelJoin", (member, channel)=>{})
        // bot.on("voiceChannelLeave", (member, channel)=>{})

        const commandTypes = fs.readdirSync(path.join(__dirname, "..", "commands"))
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
            const commandFiles = fs.readdirSync(path.join(__dirname, "..", "commands", commandType)) 
            for (var commandFile of commandFiles) {
                const commandData = require(`../commands/${commandType}/${commandFile}`)
                let commandD = commandData.command
                try {
                    if (typeof(commandD) === "function") commandD = await commandD()
                } catch (e){
                    console.log(`Error running "${commandFile}"`)
                }

                loadedCommands.set(commandD.name, commandData)

                let foundName = commands.find(e => e.name == commandD.name)
                let foundDes = commands.find(e => e.description == commandD.description)

                let update = !foundDes || !foundName || commandData?.alwaysUpdate

                console.log(`Should update command "${commandD.name}" ${update}`)
                if (update) {
                    console.log(`Updated "${commandD.name}"`)
                    await bot.createCommand(commandD)
                } else {
                }
            }
        } 

        bot.loadedCommands = loadedCommands
        var botCommands = []
        for (var command of commands) {
            botCommands.push(command.name)
        }

        let difference = botCommands.filter(x => !loadedCommands.has(x));
        if (difference.length > 0) {
            
            for (var commandName of difference){
                var commandData = commands.find(e => e.name == commandName)
                await bot.deleteCommand(commandData.id)
            }
            
        }
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