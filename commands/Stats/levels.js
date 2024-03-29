const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { get } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("levels")
    .setDescription("Check your or another user's level.")
    .addUserOption((option) => option.setName("user").setDescription("The member whose level you want to view").setRequired(false)),
  async execute(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;
    const Embed = new EmbedBuilder()
      .setTitle(`${user.username}'s level`)
      .setDescription(
        `**Level:** ${await get(`${user.id}_level`)}\n**XP:** ${await get(`${user.id}_xp`)}\n**XP to next level:** ${await get(`${user.id}_xp_needed`)} ${
          parseInt(await get(`${user.id}_xp_needed`)) !== parseInt(await get(`${user.id}_level`)) * 100 ? `(${parseInt(await get(`${user.id}_level`)) * 100} total)` : ""
        }`
      )
      .setThumbnail(user.displayAvatarURL({ format: "jpg", size: 4096 }))
      .setColor((await get(`${interaction.user.id}_color`)) ?? "#2b2d31");
    await interaction.reply({ embeds: [Embed] });
  },
};
