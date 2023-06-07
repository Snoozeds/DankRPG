const { SlashCommandBuilder } = require("discord.js");
const { set, get, incr } = require("../../globals.js");
require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("settings")
    .setDescription("Change your own settings.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("embedcolor")
        .setDescription("Changes the color of embeds.")
        .addStringOption((option) => option.setName("color").setDescription("The HEX color code you want to set. Add a # before the code.").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("xpalerts")
        .setDescription("Changes whether or not you get xp alerts.")
        .addBooleanOption((option) => option.setName("xpalerts").setDescription("Whether or not you want xp alerts.").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("interactions")
        .setDescription("Changes whether or not other users can use certain commands on you.")
        .addBooleanOption((option) =>
          option.setName("interactions").setDescription("Whether or not you want other users to be able to use certain commands on you.").setRequired(true)
        )
    ),
  async execute(interaction) {
    const response = interaction.options.getString("color");
    if (interaction.options.getSubcommand() === "embedcolor") {
      var reg = /^#([0-9a-f]{3}([0-9a-f]{3})?)$/i;
      if (reg.test(response) === false) {
        await interaction.reply({
          content: "That is not a valid HEX color code.\nA valid HEX color code must be a 3 or 6 digit hexadecimal number with a '#' symbol at the beginning.",
          ephemeral: true,
        });
      } else {
        await set(`${interaction.user.id}_color`, response);
        await interaction.reply({
          content: "Your embed color has been set to " + response + ".",
          ephemeral: true,
        });
      }
    } else if (interaction.options.getSubcommand() === "xpalerts") {
      let response = interaction.options.getBoolean("xpalerts");
      if (response === true) {
        await set(`${interaction.user.id}_xp_alerts`, "1");
        await interaction.reply({
          content: "You will now get xp alerts.",
          ephemeral: true,
        });
      }
      if (response === false) {
        await set(`${interaction.user.id}_xp_alerts`, "0");
        await interaction.reply({
          content: "You will no longer get xp alerts. However, you'll still be told *when* you level up.",
          ephemeral: true,
        });
      }
    } else if (interaction.options.getSubcommand() === "interactions") {
      let response = interaction.options.getBoolean("interactions");
      if (response === true) {
        await set(`${interaction.user.id}_interactions`, "1");
        await interaction.reply({
          content: "Other users can now use certain commands on you.\nThese are as follows: `marry`, `duel`.",
          ephemeral: true,
        });
      }
      if (response === false) {
        await set(`${interaction.user.id}_interactions`, "0");
        await interaction.reply({
          content: "Other users can now no longer use certain commands on you.\nThese are as follows: `marry`. `duel`.",
          ephemeral: true,
        });
      }
    }
  },
};
