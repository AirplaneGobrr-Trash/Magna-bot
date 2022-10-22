const dbClass = require("@airplanegobrr/database")
const path = require("path")
const progressbar = require('string-progressbar');
const chalk = require('chalk')

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

async function checkServer(serverID){
    var serverPath = path.join(__dirname, "data", "servers", `${serverID}.json`)
    const serverDB = new dbClass(serverPath)
    if (!await serverDB.has("lastbump")) serverDB.set("lastbump", 0)

    if (!await serverDB.has("users")) serverDB.set("users", {})
    if (!await serverDB.has("economy")) serverDB.set("economy", {})
    if (!await serverDB.has("marry")) serverDB.set("marry", {})

    if (!await serverDB.has("settings")) serverDB.set("settings", {
        marry: true,
        economy: true,
        alts: true,
        prefix: null,
        logChannel: null
    })
}

async function checkUser(userID){
    var userPath = path.join(__dirname, "data", "servers", `${userID}.json`)
    const userDB = new dbClass(userPath)
    if (!await serverDB.has("economy")) serverDB.set("economy", {})
    if (!await serverDB.has("marry")) serverDB.set("marry", {})
    if (!await serverDB.has("alts")) serverDB.set("alts", {}) //Alt support from saddness bot?
}

module.exports = {
    log,
    debug,
    bar,
    checkServer,
    checkUser
}