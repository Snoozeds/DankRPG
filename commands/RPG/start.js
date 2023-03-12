// This command basically exists just to ensure that the user has the default variables.
// Read variables-list.txt for defaults.

const { SlashCommandBuilder } = require('discord.js');
const { get, set } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("start")
    .setDescription("Start your DankRPG journey."),
  async execute(interaction) {
    if ((await get(`${interaction.user.id}_hasStarted`)) === "1") {
      await interaction.reply({
        content: "You have already started!",
        ephemeral: true,
      });
    } else {
      await set(`${interaction.user.id}_coins`, "0");
      await set(`${interaction.user.id}_hp`, "100");
      await set(`${interaction.user.id}_max_hp`, "100");
      await set(`${interaction.user.id}_armor`, "0");
      await set(`${interaction.user.id}_damage`, "5");
      await set(`${interaction.user.id}_xp`, "0");
      await set(`${interaction.user.id}_xp_needed`, "100");
      await set(`${interaction.user.id}_level_xp`, "100");
      await set(`${interaction.user.id}_next_level`, 2);
      await set(`${interaction.user.id}_level`, "1");
      await set(`${interaction.user.id}_hasStarted`, "1");
      await set(`${interaction.user.id}_color`, "#FFE302");
      await set(`${interaction.user.id}_xp_alerts`, "1");
      await set(`${interaction.user.id}_commandsUsed`, "1");
      await interaction.reply({
        content: "You start your RPG adventure.",
        ephemeral: true,
      });
    }
  },
};
