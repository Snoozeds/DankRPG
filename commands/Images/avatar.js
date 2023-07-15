const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const { incr } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Shows your/another user's avatar.")
    .addUserOption((option) => option.setName("user").setDescription("The member who's avatar you want to view").setRequired(false)),
  async execute(interaction) {
    const user = interaction.options.getUser("user") ?? interaction.user;
    const attachment = new AttachmentBuilder(user.displayAvatarURL({ dynamic: true, size: 4096 })).setName("avatar.png");
    await interaction.reply({
      files: [attachment],
    });
  },
};
