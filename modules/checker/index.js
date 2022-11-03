const fs = require("fs")
const path = require("path")
const dbClass = require("@airplanegobrr/database")
const other = require("../../other.js")

const { QuickDB, MySQLDriver } = require("quick.db");
const mysqlDriver = new MySQLDriver({
    host: "192.168.4.121",
    user: "magna_bot",
    password: "muqZHbE#*xDScq91%Y^9ey1^vsRNvk25YVif6&wa$B3FXzD^fB",
    database: "magna",
});

async function check() {
    await mysqlDriver.connect();
    var disClient = global.stuff.discordClient
    var isReady = false
    if (disClient.isReady()) isReady = true

    var allServerData = {}

    // Servers check
    var serversPath = path.join(global.stuff.startDir, "data", "servers")
    var serversFiles = fs.readdirSync(serversPath)
    for (var serverID of serversFiles) {
        other.log(4, `Checking server: ${serverID}`)
        var serverFilePath = path.join(serversPath, serverID)
        var serverDB = new QuickDB({ driver: mysqlDriver, table: `servers${serverID.replace(".json", "")}` });
        if (await serverDB.has("bumpInfo")) {
            other.log(4, "Found bump info!")
            var currentTime = new Date().valueOf()
            var nextBump = await serverDB.get("bumpInfo.nextBump")
            var nextBumpReminder = await serverDB.get("bumpInfo.nextBumpReminder")
            var guildID = serverID.replace(".json", "")
            allServerData[guildID] = { canBump: false }
            if (currentTime >= nextBump) {
                if (currentTime >= nextBumpReminder) {
                    other.log(4, `Ready to bump!`)
                    allServerData[guildID].canBump = true
                    //Reminder to bump server!
                    if (isReady) {
                        other.log(4, "Client is logged in!")
                        
                        var bumpChannelID = await serverDB.get("bumpInfo.bumpChannel")
                        var bumpRoleID = await serverDB.get("bumpInfo.bumpRole")
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
                            await serverDB.set(`bumpInfo.nextBumpReminder`, currentTime + 900000)
                            await serverDB.add(`bumpInfo.bumpReminder`, 1)
                        }
                    }
                }
            }
        }
    }


    // Users
    var usersPath = path.join(global.stuff.startDir, "data", "users")
    var usersFiles = fs.readdirSync(usersPath)

    for (var userID of usersFiles) {
        other.log(4, `Checking user: ${userID}`)
        var userFilePath = path.join(usersPath, userID)
        var userDB = new QuickDB({ driver: mysqlDriver, table: `users${userID.replace(".json", "")}` });
        if (await userDB.has("bumpInfo")) {
            other.log(4, "Found bump info!")
            var currentTime = new Date().valueOf()
            var nextBump = await userDB.get("bumpInfo.nextAvailableBump")
            var shouldRemind = await userDB.get(`bumpInfo.remind`)
            var alreadyReminded = await userDB.get(`bumpInfo.reminded`)
            var userServers = await userDB.get(`bumpInfo.servers`)
            var realUserID = userID.replace(".json", "")

            if (!shouldRemind) return other.log(4, `User: ${realUserID}, does not want bump reminder!`)
            if (alreadyReminded) return other.log(4, `Already reminded user: ${realUserID} to bump!`)

            if (currentTime >= nextBump) {
                    other.log(4, `Ready to bump!`)
                    //Reminder to bump server!
                    if (isReady) {
                        other.log(4, "Client is logged in!")

                        var user = disClient.users.cache.find(user => user.id === realUserID)

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
                            await userDB.set(`bumpInfo.reminded`, true)
                        }
                    }
                }
        }
    }
}

async function checkNew() {

}

async function start() {
    // setTimeout(async () => {
    //     await check()
    // }, 100)
    // setInterval(async () => {
    //     await check()
    // }, 60 * 1000)
}

module.exports = {
    start
}