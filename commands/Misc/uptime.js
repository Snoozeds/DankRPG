const { SlashCommandBuilder } = require('@discordjs/builders');
const { incr } = require('../../globals.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Responds with DankRPG\'s uptime.'),
    async execute(interaction) {
        const seconds = Math.round(Date.now() / 1000)
        await interaction.reply(`DankRPG has been up since <t:${Math.round(seconds - process.uptime())}:R>`);
        await incr(`${interaction.user.id}`, 'commandsUsed', 1);
    },
};