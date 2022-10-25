const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu } = require('discord.js');

module.exports = {
	data: {
        slash: new SlashCommandBuilder()
		    .setName('ideas')
            .setDescription('Replies with ideas that we are gonna work into the bot'),
        type: [],
		name: "help"
    },
	async execute(interaction, client) {
        const embed = new EmbedBuilder()
            .setTitle("Ideas")
            .setDescription("Few ideas we have for the bot")
            .addFields(
                { name:"Global ecom", value:`A global ecom!\nProgress:\n${await global.stuff.other.bar(0)}` },
                { name:"Server ecom", value:`A server basiced ecom!\nProgress:\n${await global.stuff.other.bar(0)}` },
                { name:"Marry", value:`Marry people!\nProgress:\n${await global.stuff.other.bar(0)}` },
                { name:"Mod bot", value:`Adv mod bot\nProgress:\n${await global.stuff.other.bar(0)}` },
                { name:"Website", value:`Website to change configs\nProgress:\n${await global.stuff.other.bar(1)}` }
            )
		await interaction.editReply({ content:"Here are the ideas for the bot!",embeds:[embed.data]});
	},
};