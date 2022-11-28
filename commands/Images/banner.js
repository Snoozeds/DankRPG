const { SlashCommandBuilder } = require('discord.js');
const { incr } = require('../../globals.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banner')
        .setDescription('Gets your/another user\'s banner'),
    async execute(interaction) {
        let user = interaction.user || interaction.options.getUser('user');
        let fuser = await user.fetch({ force: true });
        if (user.banner === null) {
            await interaction.reply({ content: `This user has no banner. Their accent color is ${fuser.hexAccentColor}`, ephemeral: false });
        }
        else {
        await interaction.reply(`${fuser.bannerURL({ dynamic: true, size: 4096 })}`);
        await incr(`${interaction.user.id}`, 'commandsUsed', 1);
        }
    },
};
