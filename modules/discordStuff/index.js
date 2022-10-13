const fs = require('fs')
const { Client, Intents, Collection } = require('discord.js')

async function start() {
    const eventEmitter = global.stuff.eventEmitter
    //client with intents
    const client = new Client({
        partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_INVITES,
            Intents.FLAGS.GUILD_MEMBERS,
            Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
            Intents.FLAGS.GUILD_VOICE_STATES,
            Intents.FLAGS.DIRECT_MESSAGES,
            Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
            Intents.FLAGS.DIRECT_MESSAGE_TYPING
        ]
    });

    require("./slash.js")

    client.commands_chat = new Collection();
    client.commands_slash = new Collection();
    client.cooldowns = new Collection();
    const { token } = require("../../config.json");

    const commandFolders = fs.readdirSync(__dirname + "\\commands");
    const slashFolder = fs.readdirSync(__dirname + "\\slash");
    const eventFiles = fs.readdirSync(__dirname + "\\events").filter(file => file.endsWith('.js'));

    console.log("Loading Commands");
    for (const folder of commandFolders) {
        const commandFiles = fs.readdirSync(__dirname + `\\commands/${folder}`).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(__dirname + `\\commands/${folder}/${file}`);
            client.commands_chat.set(command.name, command);
        }
    }

    console.log("Loading Slash Commands");
    for (const file of slashFolder) {
        const command = require(__dirname + `\\slash/${file}`);
        client.commands_slash.set(command.data.slash.toJSON().name, command);
    }
    
    console.log("Loading Events");
    for (const file of eventFiles) {
        const event = require(__dirname + `\\events/${file}`);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }

    console.log("All loaded");

    client.login(token);

}

module.exports = {
    start
}