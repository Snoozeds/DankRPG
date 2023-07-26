const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { get, set } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("settings")
    .setDescription("Change your own settings.")
    .addSubcommand((subcommand) => subcommand.setName("view").setDescription("View your current settings."))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("embedcolor")
        .setDescription("Changes the color of embeds.")
        .addStringOption((option) => option.setName("color").setDescription("The HEX color code you want to set.").setRequired(true))
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
    const user = interaction.user;
    if (interaction.options.getSubcommand() === "view") {
      const embed = new EmbedBuilder()
        .setTitle(`Your user settings`)
        .addFields(
          { name: "Embed color:", value: await get(`${user.id}_color`) || "Not set", inline: false },
          { name: "XP alerts:", value: (await get(`${user.id}_xp_alerts`)) === "1" ? "Enabled" : "Disabled", inline: false },
          { name: "Interactions:", value: (await get(`${user.id}_interactions`)) === "1" ? "Enabled" : "Disabled", inline: false }
        )
        .setColor(await get(`${user.id}_color`))
        .setThumbnail(user.displayAvatarURL({ dynamic: true }));
      await interaction.reply({
        embeds: [embed],
        ephemeral: false,
      });
    } else if (interaction.options.getSubcommand() === "embedcolor") {
      let response = interaction.options.getString("color");
      if (!response.startsWith("#")) {
        response = "#" + response;
      }
      try {
        const embed = new EmbedBuilder().setDescription(`Your embed color has been set to ${response}.`).setColor(response);
        await interaction.reply({
          embeds: [embed],
          ephemeral: true,
        });
        await set(`${interaction.user.id}_color`, response);
      } catch (err) {
        return interaction.reply({
          content: "There was an error setting your embed color. Most likely, the color you provided was invalid.\nOnline color picker: <https://dankrpg.xyz/color.html>",
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
