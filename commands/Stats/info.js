const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { get, incr } = require('../../globals.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('View info about DankRPG'),
    async execute(interaction) {
        const seconds = Math.round(Date.now() / 1000);
        const DJS = require('discord.js/package.json').version;
        const c = interaction.client;
        
        const infoEmbed = new EmbedBuilder()
        .setDescription(`**__Bot Info__**\nUptime: since <t:${Math.round(seconds - process.uptime())}:R>\n\n**__Bot Stats__**\nGuilds: ${c.guilds.cache.size}\nUsers: ${c.users.cache.size}\n\n**__Package Info__**\nNode: ${process.version}\ndiscord.js: ${DJS}\n\nLinks: [Invite](https://discord.com/api/oauth2/authorize?client_id=855479925863481345&permissions=2147601408&scope=bot%20applications.commands) | [Support Server](https://discord.gg/Cc3xBSpWeB) | [Docs](https://docs.dankrpg.xyz)`)
        .setColor(await get(`${interaction.user.id}_color`))
        .setFooter({ text: `Made by Snoozeds#0802 <3` })
        await interaction.reply({ embeds: [infoEmbed] });
        await incr(`${interaction.user.id}`, 'commandsUsed', 1);
    },

};