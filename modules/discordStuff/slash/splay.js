const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu } = require('discord.js');

module.exports = {
	data: {
        slash: new SlashCommandBuilder()
		    .setName('play')
            .setDescription('Play music'),
        type: [],
		name: "play"
    },
	async execute(interaction, client) {
		await interaction.editReply({ content:"Hi",ephemeral: true });
	},
};