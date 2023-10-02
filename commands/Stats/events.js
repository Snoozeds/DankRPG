const { SlashCommandBuilder } = require("discord.js");
const { events } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder().setName("events").setDescription("View active and upcoming seasonal events."),
  async execute(interaction) {
    const user = interaction.user;
    const eventEmbed = await events.embed(user); // We use "user" for the embed's color. See globals.js to see how the embed is made.
    await interaction.reply({ embeds: [eventEmbed] });
  },
};
