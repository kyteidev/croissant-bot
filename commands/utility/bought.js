const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bought')
		.setDescription('You bought a croissant today!'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};
