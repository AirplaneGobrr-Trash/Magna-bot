const dbClass = require("@airplanegobrr/database")
const path = require("path")
const progressbar = require('string-progressbar');
const chalk = require('chalk')
const fs = require("fs")

const types = [
    "Main", //0
    "Express", //1
    "Socket.io", //2
    "Discord" //3
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

async function checkFolders(){
    var dataExist = fs.existsSync(__dirname+"/data")
    var serversExist = fs.existsSync(__dirname+"/servers")
    var usersExist = fs.existsSync(__dirname+"/users")
}

async function checkServer(serverID){
    await checkFolders()
    var serverPath = path.join(__dirname, "data", "servers", `${serverID}.json`)
    const serverDB = new dbClass(serverPath)
    if (!await serverDB.has("bumpInfo")) serverDB.set("bumpInfo", {
        lastBump: 0,
        bumpReminder: 0,
        nextBump: 0,
        nextBumpReminder: 0,
        bumpChannel: null,
        bumpRole: null
    })

    if (!await serverDB.has("users")) serverDB.set("users", {}) // Eco ball, eco inv, uuid of family tree
    if (!await serverDB.has("economy")) serverDB.set("economy", {}) //Shops, buyables, tec
    if (!await serverDB.has("marry")) serverDB.set("marry", {}) // random UUID for family tree, family info of tree 

    if (!await serverDB.has("settings")) serverDB.set("settings", {
        marry: true,
        economy: true,
        alts: true,
        prefix: null,
        logChannel: null,
    })
}

async function checkServerUser(serverID, userID){
    await checkServer(serverID)
    var serverPath = path.join(__dirname, "data", "servers", `${serverID}.json`)
    const serverDB = new dbClass(serverPath)
    if (!await serverDB.has(`users.${userID}`)) serverDB.set(`users.${userID}`, {
        bal: 0,
        familyTree: null
    })
}

async function bumpAdd(serverID, userID){
    await checkServer(serverID)
    await checkServerUser(serverID, userID)
    var serverPath = path.join(__dirname, "data", "servers", `${serverID}.json`)
    const serverDB = new dbClass(serverPath)
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

    await serverDB.set(`bumpInfo.lastBump`, time)
    await serverDB.set(`bumpInfo.nextBump`, time+7200000)
    await serverDB.set(`bumpInfo.nextBumpReminder`, time+7200000)
    // 2 hours 7200000
}

async function checkUser(userID){
    await checkFolders()
    var userPath = path.join(__dirname, "data", "users", `${userID}.json`)
    const userDB = new dbClass(userPath)
    if (!await userDB.has("economy")) userDB.set("economy", {})
    if (!await userDB.has("marry")) userDB.set("marry", {})
    if (!await userDB.has("alts")) userDB.set("alts", {}) //Alt support from saddness bot?
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