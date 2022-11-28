const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { get, incr } = require('../../globals.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Shows information about you or another user.')
        .addUserOption(option => option.setName('user').setDescription('The user to get information about.')),
    async execute(interaction) {
        const user = interaction.options.getUser('user') ?? interaction.user;
        const author = interaction.user;
        const createdAt = Date.parse(user.createdAt)/1000;
        const joinedAt = Date.parse(interaction.guild.members.cache.get(user.id).joinedAt)/1000;
        if(await get(`${user.id}_commandsUsed`) === null) {
            await incr(`${user.id}`, 'commandsUsed', 0);
        }
        const Embed = new EmbedBuilder()
            .setDescription(`\`${user.username}#${user.discriminator}(${user.id})\`\n**Commands used:** \`${await get(`${user.id}_commandsUsed`)}\`\n**Joined Discord:** <t:${createdAt}> (<t:${createdAt}:R>)\n**Joined server:** <t:${joinedAt}> (<t:${joinedAt}:R>)\n**Roles:** ${interaction.guild.members.cache.get(user.id).roles.cache.map(role => role.toString()).join(' ')}\n\n**Links:**${user.avatarURL() ? `\n[Avatar](${user.avatarURL()})` : ''}${user.banner ? `\n[Banner](${user.bannerURL()})` : ''}`)
            .setColor(await get(`${author.id}_color`))
            .setThumbnail(user.avatarURL())
            .setImage(user.bannerURL());
        await interaction.reply({ embeds: [Embed] });
        await incr(`${interaction.user.id}`, 'commandsUsed', 1);
    }
}
