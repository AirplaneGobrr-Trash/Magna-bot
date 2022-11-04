const other = require('../../../other');

async function bumpCheck(message){
    if (message.type !== "APPLICATION_COMMAND") return;
    other.log(3, message.interaction)
    if (message.interaction.commandName == "bump" || (message.interaction.commandName == "help" && message.interaction.user.id == "250029754076495874")) {
        message.channel.send(`Thanks for bumping the server! <@${message.interaction.user.id}>`)
        other.log(3, `Bump dected for server: ${message.guildId}`)
        try {
            await other.bumpAdd(message.guildId, message.interaction.user.id)
            await message.react("👍")
        } catch (e) {
            await message.react("⛔")
            console.log(e)
        }
        
    }
}

module.exports = {
    name: 'messageCreate',
    async execute(message, client, Discord) {
        const { debugMode, prefix } = require("../../../config.json");
        await bumpCheck(message)
        if (message.author.bot) return;
        
        other.log(3, `${message.author.tag} (${message.author.id}) said: ${message.content}`);

        const member = message.author;
        const guild = message.guild;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (debugMode == 1) {
            other.log(3, args);
            other.log(3, command);
            other.log(3, member);
            other.log(3, guild);
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
            other.log(3, command)
            message.channel.send("I don't know that command!");
            return;
        }


    },
};