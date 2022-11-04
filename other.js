const dbClass = require("@airplanegobrr/database")
const path = require("path")
const progressbar = require('string-progressbar');
const chalk = require('chalk')
const fs = require("fs")

const { QuickDB } = require("quick.db");

const types = [
    "Main", // 0
    "Express", // 1
    "Socket.io", // 2
    "Discord", // 3
    "Bump", // 4
    "Events" // 5
]

async function log(type, ...args){
    var time = new Date().valueOf()
    console.log(`[${chalk.blue(time)}] [${chalk.green(types[type])}]:`, ...args)
}

async function debug(type, ...args){
    if (process.env.debug){
        var time = new Date().valueOf()
        console.log(`[${chalk.blue(time)}] [${chalk.green(types[type])}]:`, ...args)
    }
}

async function bar(value){
    // Assaign values to total and current values
    var total = 100;
    var current = value;
    // First two arguments are mandatory
    var out = progressbar.splitBar(total, current, 10);
    return `[${out[0]}] ${out[1]}%`
}

async function alwaysRun(){
    return //unused
}

async function checkServer(serverID){
    await alwaysRun()
    const serverDB = new QuickDB({ driver: global.mysqlDriver, table: `servers` });
    if (!await serverDB.has(`${serverID}`)) await serverDB.set(`${serverID}`, {
        bumpInfo: {
            lastBump: 0,
            bumpReminder: 0,
            nextBump: 0,
            nextBumpReminder: 0,
            bumpChannel: null,
            bumpRole: null
        },
        users: {},
        economy: {},
        marry: {},
        settings: {
            marry: true,
            economy: true,
            alts: true,
            prefix: null,
            logChannel: null,
        }
    })
}

async function checkServerUser(serverID, userID){
    await alwaysRun()
    const serverDB = new QuickDB({ driver: global.mysqlDriver, table: `servers` });
    if (!await serverDB.has(`${serverID}.users.${userID}`)) serverDB.set(`${serverID}.users.${userID}`, {
        bal: 0,
        familyTree: null
    })
}

async function checkUser(userID){
    await alwaysRun()
    const userDB = new QuickDB({ driver: global.mysqlDriver, table: `users` });
    if (!await userDB.has(`${userID}`)) await userDB.set(`${userID}`, {
        alts: {},
        marry: {},
        economy: {},
        bumpInfo: {
            servers: [],
            lastBump: null,
            nextAvailableBump: null,
            totalBumps: 0,
            reminded: false,
            remind: true // Weather to DM the user after 30 minuetes
        }
    })
}

async function bumpAdd(serverID, userID){
    await alwaysRun()
    await checkServer(serverID)
    await checkServerUser(serverID, userID)
    await checkUser(userID)

    const serverDB = new QuickDB({ driver: global.mysqlDriver, table: `servers` });
    const userDB = new QuickDB({ driver: global.mysqlDriver, table: `users` });

    //var time = new Date().toLocaleString('en-US', {
    //    hour12: false,
    //    year: 'numeric',
    //    month: '2-digit',
    //    day: '2-digit',
    //    hour: '2-digit',
    //    minute: '2-digit',
    //    second: '2-digit',
    //  })

    var time = new Date().valueOf()

    await serverDB.set(`${serverID}.bumpInfo.lastBump`, time)
    await serverDB.set(`${serverID}.bumpInfo.nextBump`, time+7200000)
    await serverDB.set(`${serverID}.bumpInfo.nextBumpReminder`, time+7200000)

    await userDB.set(`${userID}.bumpInfo.lastBump`, time)
    await userDB.set(`${userID}.bumpInfo.nextAvailableBump`, time+1800000)
    await userDB.add(`${userID}.bumpInfo.totalBumps`, 1)
    await userDB.set(`${userID}.bumpInfo.reminded`, false)

    var userServers = await userDB.get(`${userID}.bumpInfo.servers`)
    if (!userServers.includes(serverID)) await userDB.push(`${userID}.bumpInfo.servers`, serverID)


    // 2 hours 7200000
    // 30 min 1800000
}

module.exports = {
    log,
    debug,
    bar,
    checkServer,
    checkUser,
    checkServerUser,
    bumpAdd
}