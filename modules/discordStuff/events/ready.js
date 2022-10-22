async function update(client) {
    const botGuilds = client.guilds.cache
    client.user.setPresence({
        activities: [{ name: `${botGuilds.size} guilds!`, type: 3 }]
    });
}

module.exports = {
    name: 'ready',
    async execute(client) {
        console.log(`Logged in as ${client.user.tag}!`);
        update(client)
        setInterval(async ()=>{
            await update(client)
        }, 5 * 60 * 1000)
    },
};

