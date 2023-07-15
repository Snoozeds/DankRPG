const { SlashCommandBuilder } = require("discord.js");
const { incr } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("banner")
    .setDescription("Gets your/another user's banner")
    .addUserOption((option) => option.setName("user").setDescription("The user to get the banner of").setRequired(false)),
  async execute(interaction) {
    const user = interaction.options.getUser("user") ?? interaction.user;
    const fuser = await user.fetch({ force: true });
    if (fuser.banner === null) {
      const message = user.id === interaction.user.id ? "You have no banner" : "This user has no banner";
      await interaction.reply({
        content: `${message}. The accent color is ${fuser.hexAccentColor}`,
        ephemeral: false,
      });
    } else {
      await interaction.reply(`${fuser.bannerURL({ dynamic: true, size: 4096 })}`);
    }
  },
};
