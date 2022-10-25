const fs = require("fs")
const path = require("path")
const dbClass = require("@airplanegobrr/database")

async function check(){
    var disClient = global.stuff.discordClient
    var isReady = false
    if (disClient.isReady()) isReady = true
    
    var serversPath = path.join(global.stuff.startDir, "data", "servers")
    var serversFiles = fs.readdirSync(serversPath)
    for (var serverID of serversFiles){
        console.log(`Checking server: ${serverID}`)
        var serverFilePath = path.join(serversPath, serverID)
        var serverDB = new dbClass(serverFilePath)
        if (await serverDB.has("bumpInfo")) {
            console.log("Found bump info!")
            var currentTime = new Date().valueOf()
            var nextBump = await serverDB.get("bumpInfo.nextBump")
            var lastBump = await serverDB.get("bumpInfo.lastBump")
            if (currentTime >= nextBump) {
                console.log("Ready to bump!")
                //Reminder to bump server!
                if (isReady){
                    console.log("Client is logged in!")
                    var guildID = serverID.replace(".json", "")
                    var bumpChannelID = await serverDB.get("bumpInfo.bumpChannel")
                    var bumpRoleID = await serverDB.get("bumpInfo.bumpRole")
                    if (!bumpRoleID) bumpRoleID = ""
                    var bumpChannel = await disClient.channels.cache.get(bumpChannelID);
                    bumpChannel.send(`Bump the server!`)
                }
            }
        }
    }
}

async function start(){
    setTimeout(async () =>{
        await check()
    }, 100)
    setInterval(async ()=>{
        await check()
    }, 60*1000)
}

module.exports = {
    start
}