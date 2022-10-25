module.exports = {
    name: 'help',
    description: 'help command.',
    long_description: 'Help command.... what else??',
    permissions: [],
    args: ['command'],
    usage: 'help <command>',
    type: 'member',
    execute(client, Discord, message, guild) {
        //Go through each command in client.commands and put them in an embed with there description
        var x = message.content.split(" ").slice(1).join(" ")
        var y = message.content.split(" ")
        message.channel.send("This is a WIP bot!")
    }
};