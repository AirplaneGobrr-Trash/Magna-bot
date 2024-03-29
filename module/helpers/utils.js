const { discord: dataHelper } = require("./dataHelper")
const client = require("./clientBuilder")
const eris = require("eris")
const path = require("path")
const fs = require("fs")

function generateUUID() {
    let d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        d += performance.now();
    }
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}

/**
 * 
 * @param {Number} serverID ID Guild
 * @param {Number} bumpID ID bump bot
 * @param {Number} userID ID user
 */
async function bAdd(serverID, bumpID, userID) {
    const serverDB = await dataHelper.server.database.get(serverID)
    const userDB = await dataHelper.user.database.get(userID)

    var time = new Date().valueOf()

    // 2 hours 7200000
    // 30 min 1800000

    await serverDB.set(`bumpInfo.lastBump`, time)
    await serverDB.set(`bumpInfo.nextBump`, time + 7_200_000)
    await serverDB.set(`bumpInfo.nextBumpReminder`, time + 7_200_000)

    await userDB.set(`bumpInfo.lastBump`, time)
    await userDB.set(`bumpInfo.nextAvailableBump`, time + 1_800_000)
    await userDB.add(`bumpInfo.totalBumps`, 1)
    await userDB.set(`bumpInfo.reminded`, false)

    var userServers = await userDB.get(`bumpInfo.servers`)
    if (userServers && !userServers.includes(serverID)) await userDB.push(`bumpInfo.servers`, serverID)
    if (!userServers) await userDB.set(`bumpInfo.servers`, [serverID])
}

/**
 * 
 * @param {client} client 
 */
async function bCheck(client) {
    if (!client.ready) return
    // console.log("Running bump check!")
    var allServerData = {}
    var currentTime = new Date().valueOf()

    const serverFiles = fs.readdirSync(dataHelper.paths.serverDataPath)

    for (var serverID of serverFiles) {
        const serverDB = await dataHelper.server.database.get(serverID.replace(".json", ""))
        const bumpInfo = await serverDB.get("bumpInfo")

        allServerData[serverID] = { canBump: false }

        if (currentTime >= bumpInfo?.nextBump) {
            if (currentTime >= bumpInfo?.nextBumpReminder) {
                allServerData[serverID].canBump = true 
                // bumpChannel
                // bumpRole
                var bumpRoleID = ""
                if (bumpInfo?.bumpRole) bumpRoleID = `<@&${bumpInfo?.bumpRole}>`; else bumpRoleID = "No Bump role set!"
                if (bumpInfo?.bumpChannel) var bumpChannel = client.getChannel(bumpInfo?.bumpChannel)
                // console.log(bumpInfo?.bumpChannel)
                if (!bumpChannel) continue
                bumpChannel.createMessage({
                    embed: {
                        title: "It's time to bump!",
                        description: 'Bump our server by typing /bump! Or tap/click: </bump:947088344167366698>',
                        timestamp: new Date().toISOString(),
                        footer: {
                            text: 'By: AirplaneGobrr',
                            icon_url: client.users.get("250029754076495874").avatarURL,
                        },
                    },
                    content: `${bumpRoleID}`
                })
                await serverDB.set(`bumpInfo.nextBumpReminder`, currentTime + 900000)
                await serverDB.add(`bumpInfo.bumpReminder`, 1)
            }
        }
    }

    const userFiles = fs.readdirSync(dataHelper.paths.userDataPath)
    for (var userID of userFiles) {
        const userDB = await dataHelper.user.database.get(userID.replace(".json", ""))
        const bumpInfo = await userDB.get("bumpInfo")

        if (bumpInfo?.shouldRemind) continue
        if (bumpInfo?.alreadyReminded) continue
        if (bumpInfo?.reminded) continue

        // var nextBump = await userDB.get(`${userID}.bumpInfo.nextAvailableBump`)
        // var shouldRemind = await userDB.get(`${userID}.bumpInfo.remind`)
        // var alreadyReminded = await userDB.get(`${userID}.bumpInfo.reminded`)
        // var userServers = await userDB.get(`${userID}.bumpInfo.servers`)

        if (!bumpInfo.nextAvailableBump) bumpInfo.nextAvailableBump = 0

        if (currentTime >= bumpInfo?.nextAvailableBump) {
            var user = client.users.get(userID.replace(".json", ""))
            
            if (!user) continue
            var bumpMessage = ``

            for (var serverID of bumpInfo?.servers) {
                if (allServerData && allServerData[serverID]) {
                    var serverData = allServerData[serverID]
                    var serverInfo = client.guilds.get(serverID)
                    if (serverInfo) {
                        bumpMessage += `\n[${serverInfo.name}](https://discord.com/channels/${serverID}): ${serverData.canBump}`
                    } else {
                        bumpMessage += `\n[${serverID}](https://discord.com/channels/${serverID}): ${serverData.canBump} (Can't find this server!)`
                    }
                }
            }
            var userDM = await user.getDMChannel()
            userDM.createMessage({
                embed: {
                    title: "You can now bump a server again!",
                    description: `Servers: ${bumpMessage}`,
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: 'By: AirplaneGobrr',
                        icon_url: client.users.get("250029754076495874").avatarURL,
                    },
                }
            })
            await userDB.set(`bumpInfo.reminded`, true)
        }
    }
    return
}

/**
 * 
 * @param {import("eris").InteractionDataOptions} interactionData 
 * @returns 
 */
async function optionsPraser(interactionData){
    let options = {}
    // console.log("run",interactionData)
    for (var option of interactionData) {
        // options[opt.name] = opt.value ?? opt
        if (option.type === eris.Constants.ApplicationCommandOptionTypes.SUB_COMMAND_GROUP) {
            // console.log("subGroup", __bName, option.name, option.options)
            options[option.name] = await optionsPraser(option.options)

        } else if (option.type === eris.Constants.ApplicationCommandOptionTypes.SUB_COMMAND) {
            // console.log("sub command", __bName, option.name, option.options)
            options[option.name] = await optionsPraser(option.options)

        } else {
            options[option.name] = option.value
        }
    }
    return options
}

async function sleep(ms){
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, ms);
    })
}

/**
 * 
 * @param {eris.Member} member
 * @param {eris.VoiceChannel} channel
 * @param {eris.Client} bot
 */
async function checkIfBitrateChange(member, channel, bot) {
    const nonBots = channel?.voiceMembers?.filter(mem => mem.bot == false).length
    const totalCount = channel?.voiceMembers.filter(mem => true).length
    const db = await dataHelper.server.database.getExtra(channel.guild.id)

    if (!await db.has("autoBitrate")) return

    const botCheck = await db.get("autoBitrate.botsCount")
    const isEnabled = await db.get("autoBitrate.enabled")
    const defaultBitrate = await db.get("autoBitrate.bitrate") ?? 64

    if (isEnabled && ((botCheck && totalCount < 2) || (nonBots < 2))) {
        console.log("Don't need bitrate!")
        await channel.edit({
            bitrate: 8 * 1000
        })

    } else if (isEnabled) {
        console.log("Need bitrate!")
        await channel.edit({
            bitrate: defaultBitrate * 1000
        })
    }
    // channel.edit({
    //     bitrate: 0
    // })
}

module.exports = {
    generateUUID,
    sleep,
    bump: {
        add: bAdd,
        check: bCheck
    },
    discord: {
        optionsPraser,
        checkIfBitrateChange
    }
}