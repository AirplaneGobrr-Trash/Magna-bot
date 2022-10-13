const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu } = require('discord.js');

module.exports = {
	data: {
        slash: new SlashCommandBuilder()
		    .setName('help')
            .setDescription('Replies with help'),
        type: [],
		name: "help"
    },
	async execute(interaction, client) {
		await interaction.editReply({ content:"Hi",ephemeral: true });
	},
};