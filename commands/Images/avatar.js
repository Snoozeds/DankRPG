const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { get } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Shows your/another user's avatar.")
    .addUserOption((option) => option.setName("user").setDescription("The member who's avatar you want to view").setRequired(false)),
  async execute(interaction) {
    const user = interaction.options.getUser("user") ?? interaction.user;
    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s avatar`)
      .setImage(user.displayAvatarURL({ dynamic: true, size: 4096 }))
      .setDescription(
        `Download sizes:\n[512x512](${user.displayAvatarURL({ dynamic: true, size: 512 })}) | [1024x1024](${user.displayAvatarURL({
          dynamic: true,
          size: 1024,
        })}) | [2048x2048](${user.displayAvatarURL({ dynamic: true, size: 2048 })}) | [4096x4096](${user.displayAvatarURL({ dynamic: true, size: 4096 })})`
      )
      .setColor(await get(`${interaction.user.id}_color`));
    await interaction.reply({ embeds: [embed] });
  },
};
