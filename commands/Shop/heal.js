const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { get, incr, decr, coinEmoji, hpEmoji } = require('../../globals.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('heal')
        .setDescription('Heal yourself for 1Coins/1HP.')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Amount of HP to heal.')
                .setRequired(true)),
    async execute(interaction) {
        const id = interaction.user.id;
        const hp = await get(`${id}_hp`);
        const max_hp = await get(`${id}_max_hp`);
        const user = interaction.user;

        if (hp == max_hp) {
            return interaction.reply({ content: `You are already at full health!`, ephemeral: true });
        } else {
            const amount = interaction.options.getInteger('amount');
            const coins = await get(`${id}_coins`);
            const cost = amount * 1;

            if (coins < cost) {
                return interaction.reply({ content: `You don't have enough coins to heal yourself for ${amount}HP! (${coinEmoji}${amount * 1})`, ephemeral: true });
            } else {
            if (Number(hp) + Number(amount) > Number(max_hp)) {
                return interaction.reply({ content: `You can't heal yourself for more than your max HP!`, ephemeral: true });
            } else {
                await decr(id, 'coins', cost);
                await incr(id, 'hp', amount);
                await incr(id, 'commands_used', 1);
                const new_hp = await get(`${id}_hp`);
                const new_coins = await get(`${id}_coins`);
                const embed = new EmbedBuilder()
                    .setTitle('Heal')
                    .setDescription(`You healed yourself for ${amount}HP!`)
                    .setFields([
                    { name: 'Coins', value: `**${coinEmoji} ${new_coins}**`, inline: true },
                    { name: 'HP', value: `**${hpEmoji} ${new_hp}**`, inline: true }])
                    .setColor(await get(`${user.id}_color`))
                    .setTimestamp()
                return interaction.reply({ embeds: [embed] });
            }
        }
    }
}};
