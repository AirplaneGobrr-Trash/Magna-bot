module.exports = {
    name: 'voiceStateUpdate',
    execute(oldMember, newMember, client, Discord) {
        console.log(oldMember)
        console.log(newMember)
        console.log(client)
    },
};

