const { ButtonBuilder, ButtonStyle, SlashCommandBuilder, ActionRowBuilder } = require('discord.js');
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
                const confirm = new ButtonBuilder()
                    .setCustomId('confirm')
                    .setLabel('I swear')
                    .setStyle(ButtonStyle.Success);

                const cancel = new ButtonBuilder()
                    .setCustomId('cancel')
                    .setLabel('Nuh uh')
                    .setStyle(ButtonStyle.Danger);

                const buttons = new ActionRowBuilder()
                    .addComponents(confirm, cancel);

                console.log("Asking for confirmation");
                const response = await interaction.reply({
                    content: `Do you swear you will only execute this command if you actually bought a croissant, ${username}?`,
                    components: [buttons],
                    withResponse: true,
                });

                const collectorFilter = i => i.user.id === interaction.user.id;

                try {
                    const confirmation = await response.resource.message.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

                    if (confirmation.customId === 'confirm') {
                        // Create a new entry
                        console.log('Creating new user entry for', username);
                        await Croissants.create({
                            username: username,
                            croissant_count: 1,
                            last_bought: new Date(),
                        });

                        return interaction.editReply({
                            content: `Thanks for starting to buy croissants, ${username}! You now have bought 1 croissant.`,
                            components: [],
                        });
                    } else if (confirmation.customId === 'cancel') {
                        return interaction.editReply({
                            content: `Thought so. No croissants for you, ${username}.`,
                            components: [],
                        });
                    };   
                } catch {
                    await interaction.editReply({ content: 'Why did you ghost me :(', components: [] });
                }
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