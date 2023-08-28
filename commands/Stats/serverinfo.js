const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { get } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder().setName("serverinfo").setDescription("Get info about the current server."),
  async execute(interaction) {
    const server = interaction.guild;
    const serverIcon = server.iconURL();
    const serverBanner = server.bannerURL();

    const embed = new EmbedBuilder()
      .setColor((await get(`${interaction.user.id}_color`)) ?? "#2b2d31")
      .setThumbnail(server.iconURL())
      .setImage(server.bannerURL());
    let description = `\`${server.name} (${server.id})\`\n**Owner:** ${await server.fetchOwner()}\n**Created:** <t:${Math.floor(
      server.createdAt.getTime() / 1000
    )}> (<t:${Math.floor(server.createdAt.getTime() / 1000)}:R>)\n**Members:** ${server.memberCount}${
      server.emojis.cache.size > 0 ? `\n**Emojis:** ${server.emojis.cache.size}` : ``
    }${server.premiumSubscriptionCount > 0 ? `\n**Boosts:** ${server.premiumSubscriptionCount}` : ``}${
      server.premiumTier > 0 ? `\n**Boost Level:** ${server.premiumTier}` : ``
    }`;

    if (serverIcon || serverBanner) {
      let links = "\n\n**Links:**";
      if (serverIcon) links += `\n[Icon](${serverIcon})`;
      if (serverBanner) links += `\n[Banner](${serverBanner})`;
      description += links;
    }

    embed.setDescription(description);

    await interaction.reply({ embeds: [embed] });
  },
};
