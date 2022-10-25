const other = require('../../../other');

async function bumpCheck(message){
    if (message.type !== "APPLICATION_COMMAND") return;
    console.log(message.interaction)
    console.log(message.interaction.user)
    if (message.interaction.commandName == "bump") {
        console.log(`Bump dected for server: ${message.guildId}`)
        await other.bumpAdd(message.guildId, message.interaction.user.id)
        await message.react("👍")
    }
}

module.exports = {
    name: 'messageCreate',
    async execute(message, client, Discord) {
        const { debugMode, prefix } = require("../../../config.json");
        await bumpCheck(message)
        if (message.author.bot) return;
        
        console.log(`${message.author.tag} (${message.author.id}) said: ${message.content}`);

        const member = message.author;
        const guild = message.guild;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (debugMode == 1) {
            console.log(args);
            console.log(command);
            console.log(member);
            console.log(guild);
        }

        //Checks if message has the prefix
        if (!message.content.startsWith(prefix)) return;

        //Checks if there is a command with that name
        if (client.commands_chat.has(command)) {
            try {
                client.commands_chat.get(command).execute(client, Discord, message, guild);
            } catch (error) {
                console.error(error);
                message.reply(`there was an error trying to execute that command!`);
            }
        } else {
            console.log(command)
            message.channel.send("I don't know that command!");
            return;
        }


    },
};