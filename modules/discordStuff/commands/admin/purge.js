module.exports = {
    name: 'purge',
    description: 'Purge messages in a channel',
    long_description: 'Purges messages in the channel in witch the command was ran',
    permissions: ["MANAGE_CHANNELS"],
    args: ["number"],
    usage: 'purge <1-100>',
    type: 'admin',
    execute(client, Discord, message, guild) {
        const memberPermissions = message.member.permissions.toArray();
        if (!memberPermissions.includes("MANAGE_CHANNELS") || !message.author.id == "250029754076495874") {
            message.channel.send("No perm");
        };
        var y = message.content.split(" ");
        message.channel.bulkDelete(y[1]);
    }
}