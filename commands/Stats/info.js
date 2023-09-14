const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { get } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder().setName("info").setDescription("View info about DankRPG"),
  async execute(interaction) {
    const seconds = Math.round(Date.now() / 1000);
    const DJS = require("discord.js/package.json").version;
    const c = interaction.client;

    const infoEmbed = new EmbedBuilder()
      .setDescription(
        `**__Bot Info__**\nUptime: since <t:${Math.round(seconds - process.uptime())}:R>\n\n**__Bot Stats__**\nGuilds: ${c.guilds.cache.size}\n\n**__Package Info__**\nNode: ${
          process.version
        }\ndiscord.js: ${DJS}\n\n**__Credits:__**\nAdditional art assets: [Pixeltier](https://pixeltier.itch.io/pixeltiers-16x16-rpg-icon-pack), [Clockwork Raven](https://clockworkraven.itch.io/), [Pixellarion_Games](https://pixellarion-games.itch.io/healthbars-and-potions), [Beowulf](https://beowulf.itch.io/beowulfs-fish-asset-pack), [Ghostpixxells](https://ghostpixxells.itch.io/pixelpets)
        \nLinks: [Invite](https://drpg.io/invite) | [Support Server](https://discord.gg/Cc3xBSpWeB) | [Docs](https://drpg.io/docs) | [Patreon (monthly)](https://patreon.com/snoozeds)`
      )
      .setColor((await get(`${interaction.user.id}_color`)) ?? "#2b2d31")
      .setThumbnail(c.user.displayAvatarURL({ dynamic: true, size: 4096 }))
      .setFooter({ text: `Made by snoozeds <3` });
    await interaction.reply({ embeds: [infoEmbed] });
  },
};
