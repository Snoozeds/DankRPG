const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("time")
    .setDescription("Get the current time for a timezone.")
    .addStringOption((option) =>
      option
        .setName("timezone")
        .setDescription("The timezone to get the time for.")
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      // toUpperCase() isn't necessary, but it does make the reply look nicer ;)
      const timezone = interaction.options.getString("timezone").toUpperCase();
      const options = {
        timeZone: timezone,
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      };
      const time = new Date().toLocaleString("en-US", options);
      await interaction.reply(`**${timezone}**: ${time}`);
    } catch {
      await interaction.reply({
        content:
          "Invalid timezone.\nSee: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List.",
        ephemeral: true,
      });
    }
  },
};
