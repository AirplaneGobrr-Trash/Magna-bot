const dBuilder = require("@airplanegobrr/database")
const db = new dBuilder()
const tmi = require('tmi.js');

const { parentPort, BroadcastChannel } = require("worker_threads")

const bc = new BroadcastChannel("com")

// Define configuration options
const opts = {
    identity: {
        username: 'not_a_bot_lol_airplane',
        password: 'oauth:5ac0v92483bnan736e12ukec3no1dx'
    },
    channels: [
        "thundercrazydog",
        "airplanegobrr_streams"
    ]
};

// Create a client with our options
const client = new tmi.client(opts);

bc.onmessage = async (event) => {
    const eventData = event.data;
    if (eventData.type == "sendMessage") {
        await client.join(eventData.channel)
        client.say(eventData.channel, eventData.message);
    }
}

// This function will return the object and the index
function findObjectValueInArray(array, key, value) {
    console.log(array, key, value)
    for (var objIndex in array) {
        console.log(objIndex, array[objIndex], array[objIndex][key])
        if (array[objIndex][key] == value) {
            return {
                obj: array[objIndex],
                index: objIndex,
                found: true
            }
        }
    }
    return { found: false };
}

var commands = {
    async join(channel, userstate, message, self, args) {
        var q = await db.get(`twitch.${channel}.queue`) ?? []

        const f = findObjectValueInArray(q, "twitchUser", userstate.username)

        if (f.found) {
            client.say(channel, `You're already in the queue. You are in ${Number(f.index)+1} in the queue.`);
            return;
        } else {
            q.push({twitchUser: userstate.username, message: args.join(' ')})
            await db.set(`twitch.${channel}.queue`, q)
            client.say(channel, `${userstate.username} has joined the queue. You are in ${q.length} in the queue.`);
        }
    },
    async gueue(channel, userstate, message, self) {
        var q = await db.get(`twitch.${channel}.queue`) ?? []

        const fUser = findObjectValueInArray(q, "twitchUser", userstate.username)
        var baseMessage = ""
        for (var uIndex in q) {
            baseMessage += `${Number(uIndex) + 1}. ${q[uIndex].twitchUser}\n`
        }

        if (fUser.found) {
            var msg = `You (${userstate.username}) are ${fUser.index} in the queue.\n${baseMessage}`
            client.say(channel, msg);
        } else {
            client.say(channel, baseMessage);
        }
    },
    async getnext(channel, userstate, message, self){
        // console.log(userstate)
        if (userstate.badges?.broadcaster || userstate.mod) {
            var q = await db.get(`twitch.${channel}.queue`) ?? []

            const user = q.shift()
            if (!user) { return client.say(channel, "There are no more people in the queue.") }
            await db.set(`twitch.${channel}.queue`, q)
            if (user.message) {
                client.say(channel, `Next: (${user.twitchUser}) ${user.message}`);
            } else client.say(channel, `${user.twitchUser} is next in the queue!`)
        } else {
            client.say(channel, `Haha, nice try... (ERR, NO MOD)`);
        }
    },
    async addcommand(channel, userstate, message, self, args){
        const commandName = args.shift()
        const commandArgs = args.join(' ');
        if (userstate.badges.broadcaster || userstate.mod) {
            await db.set(`twitch.${channel}.commands.${commandName}`, commandArgs)
            client.say(channel, `Command ${commandName} added.`);
        } else {
            client.say(channel, `Haha, nice try... (ERR, NO MOD)`);
        }
    },
}
commands.next = commands.getnext

// Register our event handlers (defined below)
client.on('message', async (channel, userstate, message, self) =>{
    channel = channel.replace('#', '')
    if (self) {
        return
    }
    if (message.startsWith("!")) {
        const args = message.split(' ');
        const command = args.shift().slice(1).toLocaleLowerCase()
        if (commands[command]) {
            return commands[command](channel, userstate, message, self, args);
        } else {
            const twitch = await db.get(`twitch.${channel}.commands`) ?? {}
            if (twitch[command]) {
                return client.say(channel, twitch[command]);
            }
            client.say(channel, `Sorry, I don't know how to do that.`);
        }
        return;
    }
});

client.on('connected', async (addr, port)=>{
    console.log(`* Connected to ${addr}:${port}`);
    for (var channel of opts.channels) {
        channel = channel.replace('#', '')
        if (!await db.has(`twitch.${channel}.webID`)) {
            console.log(`* ${channel} no web link!`);
            client.say(channel, "Hey! It looks like you're not paired with our website. Please pair using this link: https://thundercrazydog.airplanegobrr.xyz/auth/twitch?streamer=true")                
        }
    }
});

// Connect to Twitch:
client.connect();