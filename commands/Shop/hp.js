const { SlashCommandBuilder } = require('discord.js');
const { get, incr, coinEmoji } = require('../../globals.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hp')
        .setDescription('Checks how much it costs to heal to MaxHP.'),
    async execute(interaction) {
        const user = interaction.user;
        const hp = await get(`${user.id}_hp`);
        const maxhp = await get(`${user.id}_max_hp`);
        await interaction.reply(`It costs ${coinEmoji}**${maxhp - hp}** to heal to MaxHP.`);
        await incr(`${interaction.user.id}`, 'commandsUsed', 1);
    }
};