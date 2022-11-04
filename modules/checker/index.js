const fs = require("fs")
const path = require("path")
const dbClass = require("@airplanegobrr/database")
const other = require("../../other.js")

const { QuickDB } = require("quick.db");

async function checkNew() {
    
    var disClient = global.stuff.discordClient
    var isReady = false
    if (disClient.isReady()) isReady = true

    var allServerData = {}

    const serverDB = new QuickDB({ driver: global.mysqlDriver, table: `servers` });

    var allServers = await serverDB.all()
    var allServersSend = {}

    for (var serverInfo of allServers) {
        allServersSend[serverInfo.id] = serverInfo.value
        const serverID = serverInfo.id
        other.log(4, `Checking server: ${serverID}`)

        if (await serverDB.has(`${serverID}.bumpInfo`)) {
            other.log(4, "Found bump info!")
            var currentTime = new Date().valueOf()
            var nextBump = await serverDB.get(`${serverID}.bumpInfo.nextBump`)
            var nextBumpReminder = await serverDB.get(`${serverID}.bumpInfo.nextBumpReminder`)

            if (isReady) {
                var server = await disClient.guilds.cache.get(serverID)
                await serverDB.set(`${serverID}.name`, server.name)
            }

            allServerData[serverID] = { canBump: false }
            if (currentTime >= nextBump) {
                if (currentTime >= nextBumpReminder) {
                    other.log(4, `Ready to bump!`)
                    allServerData[serverID].canBump = true
                    //Reminder to bump server!
                    if (isReady) {
                        other.log(4, "Client is logged in!")
                        
                        var bumpChannelID = await serverDB.get(`${serverID}.bumpInfo.bumpChannel`)
                        var bumpRoleID = await serverDB.get(`${serverID}.bumpInfo.bumpRole`)
                        if (bumpRoleID != null) bumpRoleID = `<@&${bumpRoleID}>`; else bumpRoleID = "No Bump role set!"
                        var bumpChannel = await disClient.channels.cache.get(bumpChannelID);
                        if (bumpChannel) {
                            //await bumpChannel.send(`Bump the server! ${bumpRoleID}`)
                            const exampleEmbed = {
                                color: "8A2CE2",
                                title: "It's time to bump!",
                                description: 'Bump our server by typing /bump!',
                                timestamp: new Date().toISOString(),
                                footer: {
                                    text: 'By: AirplaneGobrr',
                                    icon_url: 'https://cdn.discordapp.com/avatars/250029754076495874/d3d522482f97c0c69f826206d04070b1.webp?size=40',
                                },
                            }

                            await bumpChannel.send({ embeds: [exampleEmbed], content: `${bumpRoleID}` })
                            await serverDB.set(`${serverID}.bumpInfo.nextBumpReminder`, currentTime + 900000)
                            await serverDB.add(`${serverID}.bumpInfo.bumpReminder`, 1)
                        }
                    }
                }
            }
        }
    }


    const userDB = new QuickDB({ driver: global.mysqlDriver, table: `users` });

    var allUsers = await userDB.all()
    var allUsersSend = {}


    for (var userData of allUsers) {
        allUsersSend[userData.id] = userData.value
        var userID = userData.id
        other.log(4, `Checking user: ${userID}`)

        if (isReady) {
            var user = await disClient.users.cache.get(userID)
            await userDB.set(`${userID}.name`, user.username)
        }

        if (await userDB.has(`${userID}.bumpInfo`)) {
            other.log(4, "Found bump info!")
            var currentTime = new Date().valueOf()
            var nextBump = await userDB.get(`${userID}.bumpInfo.nextAvailableBump`)
            var shouldRemind = await userDB.get(`${userID}.bumpInfo.remind`)
            var alreadyReminded = await userDB.get(`${userID}.bumpInfo.reminded`)
            var userServers = await userDB.get(`${userID}.bumpInfo.servers`)

            if (!shouldRemind) {
                other.log(4, `User: ${userID}, does not want bump reminder!`)
                continue
            } 
            if (alreadyReminded) {
                other.log(4, `Already reminded user: ${userID} to bump!`)
                continue
            }

            if (currentTime >= nextBump) {
                    other.log(4, `Ready to bump!`)
                    //Reminder to bump server!
                    if (isReady) {
                        other.log(4, "Client is logged in!")

                        var user = disClient.users.cache.find(user => user.id === userID)

                        if (user) {
                            //await bumpChannel.send(`Bump the server! ${bumpRoleID}`)
                            
                            var bumpMessage = ``

                            for (var serverID of userServers){
                                if (allServerData && allServerData[serverID]){
                                    var serverData = allServerData[serverID]
                                    var serverInfo = disClient.guilds.cache.get(serverID)
                                    if (serverInfo) {
                                        bumpMessage += `\n${serverInfo.name}: ${serverData.canBump}`
                                    } else {
                                        bumpMessage += `\n${serverID}: ${serverData.canBump} (Can't find this server!)`
                                    }
                                    
                                }
                            }

                            const exampleEmbed = {
                                color: "8A2CE2",
                                title: "You can now bump a server again!",
                                description: `Servers: ${bumpMessage}`,
                                timestamp: new Date().toISOString(),
                                footer: {
                                    text: 'By: AirplaneGobrr',
                                    icon_url: 'https://cdn.discordapp.com/avatars/250029754076495874/d3d522482f97c0c69f826206d04070b1.webp?size=40',
                                },
                            }

                            await user.send({ embeds: [exampleEmbed] })
                            await userDB.set(`${userID}.bumpInfo.reminded`, true)
                        }
                    }
                }
        }
    }
    global.data.allUsers = allUsersSend
    global.data.allServers = allServersSend

    const eventEmitter = global.stuff.eventEmitter
    eventEmitter.emit("checked", global.data)
}

async function start() {
    setTimeout(async () => {
        await checkNew()
    }, 100)
    setInterval(async () => {
        await checkNew()
    }, 60 * 1000)
    // setInterval(async () => {
    //     await check()
    // }, 60 * 1000)
}

module.exports = {
    start
}