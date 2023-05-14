const { SlashCommandBuilder } = require("discord.js");
const { incr } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("banner")
    .setDescription("Gets your/another user's banner")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to get the banner of")
        .setRequired(false)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("user") ?? interaction.user;
    const fuser = await user.fetch({ force: true });
    if (fuser.banner === null) {
      await interaction.reply({
        content: `This user has no banner. Their accent color is ${fuser.hexAccentColor}`,
        ephemeral: false,
      });
    } else {
      await interaction.reply(
        `${fuser.bannerURL({ dynamic: true, size: 4096 })}`
      );
      await incr(`${interaction.user.id}`, "commandsUsed", 1);
    }
  },
};
