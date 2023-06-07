const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("time")
    .setDescription("Get the current time for a timezone.")
    .addStringOption((option) => option.setName("timezone").setDescription("The timezone to get the time for. (e.g, 'Europe/London')").setRequired(true))
    .addStringOption((option) => option.setName("format").setDescription("The format string for the time. (e.g, 'DD/MM/YYYY HH:mm:ss')").setRequired(false)),
  async execute(interaction) {
    try {
      // Get the timezone.
      const timezone = interaction.options.getString("timezone").toUpperCase();

      // Get the format string. Default to "MM/DD/YYYY HH:mm:ss".
      const format = interaction.options.getString("format") ?? "MM/DD/YYYY HH:mm:ss";

      const validRegex = /^((YYYY|MM|DD|HH|mm|ss|[/:.\-\s])+)$/u;
      if (!validRegex.test(format)) {
        await interaction.reply({
          content: `Invalid format string. Please only use the following characters: \`YYYY\`, \`MM\`, \`DD\`, \`HH\`, \`mm\`, \`ss\`, and any punctuation.`,
          ephemeral: true,
        });
      }

      // Create the options for the formatter.
      const options = {
        timeZone: timezone,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };

      // Format the time.
      const formatter = new Intl.DateTimeFormat("en-US", options);
      const time = formatter.format(new Date());

      // Split the time string into parts.
      const timeParts = time.split(/(?:[^\d])+/);
      const formattedTime = format
        .replace(/DD/g, timeParts[1])
        .replace(/MM/g, timeParts[0])
        .replace(/YYYY/g, timeParts[2])
        .replace(/HH/g, timeParts[3])
        .replace(/mm/g, timeParts[4])
        .replace(/ss/g, timeParts[5]);

      await interaction.reply(`**${timezone}**: ${formattedTime}`);
    } catch {
      await interaction.reply({
        content: "Invalid timezone.\nSee: https://wikipedia.org/wiki/List_of_tz_database_time_zones#List.",
        ephemeral: true,
      });
    }
  },
};
