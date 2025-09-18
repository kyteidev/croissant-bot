const { SlashCommandBuilder } = require('discord.js');
const { Croissants } = require('../../index.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bought')
        .setDescription('You bought a croissant today!'),
    async execute(interaction) {
        try {
            const username = interaction.user.username;

            let user = await Croissants.findOne({ where: { username: username } });

            if (user) {
                // Update the existing entry
                console.log('Updating existing user entry for', username);
                await user.update({ croissant_count: user.croissant_count + 1, last_bought: new Date() });
                return interaction.reply(`Thanks for buying a croissant, ${username}! You have bought ${user.croissant_count} croissants in total.`);
            } else {
                // Create a new entry
                console.log('Creating new user entry for', username);
                await Croissants.create({
                    username: username,
                    croissant_count: 1,
                    last_bought: new Date(),
                });
                return interaction.reply(`Thanks for starting to buy croissants, ${username}! You now have bought 1 croissant.`);
            }
        }
        catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return interaction.reply('That entry already exists.');
            }
            return interaction.reply('Something went wrong: ' + error.message);
        }
    },
};