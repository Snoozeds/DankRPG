const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { get } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Shows your/another user's avatar.")
    .addUserOption((option) => option.setName("user").setDescription("The member who's avatar you want to view").setRequired(false)),
  async execute(interaction) {
    const user = interaction.options.getUser("user") ?? interaction.user;
    const userAvatar = user.displayAvatarURL({ dynamic: true, size: 4096 });
    const member = interaction.guild.members.cache.get(user.id) ?? interaction.member;
    const memberAvatar = member.displayAvatarURL({ dynamic: true, size: 4096 });

    if (memberAvatar === userAvatar) {
      const embed = new EmbedBuilder()
        .setTitle(`${user.username}'s avatar`)
        .setImage(user.displayAvatarURL({ dynamic: true, size: 4096 }))
        .setDescription(
          `Download sizes:\n[512x512](${user.displayAvatarURL({ dynamic: true, size: 512 })}) | [1024x1024](${user.displayAvatarURL({
            dynamic: true,
            size: 1024,
          })}) | [2048x2048](${user.displayAvatarURL({ dynamic: true, size: 2048 })}) | [4096x4096](${user.displayAvatarURL({ dynamic: true, size: 4096 })})`
        )
        .setColor((await get(`${interaction.user.id}_color`)) ?? "#2b2d31");
      await interaction.reply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setTitle(`${user.username}'s avatar`)
        .setThumbnail(member.displayAvatarURL({ dynamic: true, size: 4096 }))
        .setImage(user.displayAvatarURL({ dynamic: true, size: 4096 }))
        .setDescription(
          `Server avatar:\n[512x512](${member.displayAvatarURL({ dynamic: true, size: 512 })}) | [1024x1024](${member.displayAvatarURL({
            dynamic: true,
            size: 1024,
          })})\n[2048x2048](${member.displayAvatarURL({ dynamic: true, size: 2048 })}) | [4096x4096](${member.displayAvatarURL({
            dynamic: true,
            size: 4096,
          })})\n\nUser avatar:\n[512x512](${user.displayAvatarURL({ dynamic: true, size: 512 })}) | [1024x1024](${user.displayAvatarURL({
            dynamic: true,
            size: 1024,
          })})\n[2048x2048](${user.displayAvatarURL({ dynamic: true, size: 2048 })}) | [4096x4096](${user.displayAvatarURL({ dynamic: true, size: 4096 })})`
        )
        .setColor((await get(`${interaction.user.id}_color`)) ?? "#2b2d31");
      await interaction.reply({ embeds: [embed] });
    }
  },
};
