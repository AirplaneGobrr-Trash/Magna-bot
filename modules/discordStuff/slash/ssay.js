const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu } = require('discord.js');

module.exports = {
	data: {
        slash: new SlashCommandBuilder()
		    .setName('say')
            .setDescription('Say something with the bot')
            .addStringOption(option =>
				option.setName('tosay')
					.setDescription('what the bot should say')
					.setRequired(true)),
        type: [],
		name: "say"
    },
	async execute(interaction, client) {
        const channel = await client.channels.cache.get(interaction.channel.id)
        console.log(channel)
        if (interaction?.options?.real?.tosay && channel) {
            await channel.send(interaction.options.real.tosay)
            await interaction.editReply({ content:"Message sent",ephemeral: true });
        } else {
            await interaction.editReply({ content:"Failed to send message!",ephemeral: true });
        }
	},
};