const { SlashCommandBuilder } = require ('discord.js');
const { get, incr, decr, coinEmoji } = require ('../../globals.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buy')
        .setDescription('Buy an item from the shop.')
        .addStringOption (
            option => option.setName('item')
                .setDescription('The item you want to buy.')
                .setRequired(true),
        ),
    async execute(interaction) {
        const item = interaction.options.getString('item').toLowerCase();
        const user = interaction.user;
        const coins = await get(`${user.id}_coins`);

        if (item == 'lifesaver') {
            if (coins < 500) {
                return interaction.reply({ content: 'You don\'t have enough coins for this item!', ephemeral: true });
            }
            if (await get(`${user.id}_lifesaver`) == 1) {
                return interaction.reply({ content: 'You can only have 1 lifesaver.', ephemeral: true });
            }
            await incr(`${user.id}`, 'lifesavers', 1);
            await decr(`${user.id}`, 'coins', 500);
            return interaction.reply({ content: `You bought a lifesaver for ${coinEmoji}500.`, ephemeral: true });
        }
}};