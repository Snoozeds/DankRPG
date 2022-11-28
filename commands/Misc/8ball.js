const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { get } = require('../../globals.js');
const chance = require('chance').Chance();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Asks the magic 8ball a question.')
        .addStringOption(option => option.setName('question').setDescription('The question to ask the magic 8ball.').setRequired(true)),
    async execute(interaction) {
        const responses = ["Surely", "Certainly", "Outlook good", "Probably", "Maybe", "Maybe soon", "Maybe later", "Outlook not so good", "Probably not", "Surely not", "Certainly not", "Don't count on it"]
        const embed = new EmbedBuilder()
        .setTitle('You ask the magic 8ball a question.')
        .setDescription(`**Question:** ${interaction.options.getString('question')}\n**Answer:** ${chance.pickset(responses, 1)}.`)
        .setColor(await get(`${interaction.user.id}_color`))
        .setThumbnail('https://assets.dankrpg.xyz/Images/8ball.png')
        await interaction.reply({ embeds: [embed] });
    },
};
