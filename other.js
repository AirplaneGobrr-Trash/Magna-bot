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

module.exports = {
    log,
    debug,
    bar
}