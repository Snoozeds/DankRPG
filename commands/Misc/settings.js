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
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("hpdisplay")
        .setDescription("Changes how your HP is displayed to you in /profile.")
        .addStringOption((option) =>
          option
            .setName("display")
            .setDescription("The type of display you want.")
            .setRequired(true)
            .addChoices(
              { name: "HP", value: "hp" },
              { name: "HP/Max HP", value: "hp/maxhp" },
              { name: "HP/Max HP (Percentage)", value: "hp/maxhp%" },
              { name: "HP (Percentage)", value: "hp%" },
              { name: "HP/Max HP (Bar)", value: "hp/maxhpbar" }
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("leveldisplay")
        .setDescription("Changes how your level is displayed to you in /profile.")
        .addStringOption((option) =>
          option
            .setName("display")
            .setDescription("The type of display you want.")
            .setRequired(true)
            .addChoices(
              { name: "Level", value: "level" },
              { name: "Level | XP", value: "level/xp" },
              { name: "Level | XP (XP left to next level)", value: "level/xpnext" },
              { name: "Level (XP left to next level) (Bar)", value: "level/xpnextbar" }
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("reset")
        .setDescription("Resets settings to default.")
        .addStringOption((option) =>
          option
            .setName("setting")
            .setDescription("The setting you want to reset.")
            .setRequired(true)
            .addChoices(
              { name: "Embed color", value: "embedcolor" },
              { name: "XP alerts", value: "xpalerts" },
              { name: "Interactions", value: "interactions" },
              { name: "HP display", value: "hpdisplay" },
              { name: "Level display", value: "leveldisplay" },
              { name: "Buy confirmations", value: "buyconfirmation" },
              { name: "Sell confirmations", value: "sellconfirmation" },
              { name: "All", value: "all" }
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("confirmations")
        .setDescription("Change whether you get confirmations for certain actions, such as buying and selling.")
        .addStringOption((option) =>
          option
            .setName("type")
            .setDescription("The type of confirmation(s) you want to change.")
            .setRequired(true)
            .addChoices({ name: "Buying", value: "buying" }, { name: "Selling", value: "selling" }, { name: "All", value: "all" })
        )
    ),
  async execute(interaction) {
    const user = interaction.user;
    if (interaction.options.getSubcommand() === "view") {
      const embed = new EmbedBuilder()
        .setTitle(`Your user settings`)
        .addFields(
          { name: "Embed color:", value: (await get(`${user.id}_color`)) || "Not set", inline: false },
          { name: "XP alerts:", value: (await get(`${user.id}_xp_alerts`)) === "1" ? "Enabled" : "Disabled", inline: false },
          { name: "Interactions:", value: (await get(`${user.id}_interactions`)) === "1" ? "Enabled" : "Disabled", inline: false },
          { name: "HP display:", value: (await get(`${user.id}_hp_display`)) || "Not set", inline: false },
          { name: "Level display:", value: (await get(`${user.id}_level_display`)) || "Not set", inline: false },
          { name: "Buy confirmations:", value: (await get(`${user.id}_buyConfirmation`)) === "1" ? "Enabled" : "Disabled", inline: false },
          { name: "Sell confirmations:", value: (await get(`${user.id}_sellConfirmation`)) === "1" ? "Enabled" : "Disabled", inline: false }
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
    } else if (interaction.options.getSubcommand() === "hpdisplay") {
      let response = interaction.options.getString("display");
      if (response === "hp") {
        await set(`${interaction.user.id}_hp_display`, "hp");
        await interaction.reply({
          content: "Your HP display has been set to `HP`.",
          ephemeral: true,
        });
      }
      if (response === "hp/maxhp") {
        await set(`${interaction.user.id}_hp_display`, "hp/maxhp");
        await interaction.reply({
          content: "Your HP display has been set to `HP/Max HP`.",
          ephemeral: true,
        });
      }
      if (response === "hp/maxhp%") {
        await set(`${interaction.user.id}_hp_display`, "hp/maxhp%");
        await interaction.reply({
          content: "Your HP display has been set to `HP/Max HP (Percentage)`.",
          ephemeral: true,
        });
      }
      if (response === "hp%") {
        await set(`${interaction.user.id}_hp_display`, "hp%");
        await interaction.reply({
          content: "Your HP display has been set to `HP (Percentage)`.",
          ephemeral: true,
        });
      }
      if (response === "hp/maxhpbar") {
        await set(`${interaction.user.id}_hp_display`, "hp/maxhpbar");
        await interaction.reply({
          content: "Your HP display has been set to `HP/Max HP (Bar)`.",
          ephemeral: true,
        });
      }
    } else if (interaction.options.getSubcommand() === "leveldisplay") {
      let response = interaction.options.getString("display");
      if (response === "level") {
        await set(`${interaction.user.id}_level_display`, "level");
        await interaction.reply({
          content: "Your level display has been set to `Level`.",
          ephemeral: true,
        });
      }
      if (response === "level/xp") {
        await set(`${interaction.user.id}_level_display`, "level/xp");
        await interaction.reply({
          content: "Your level display has been set to `Level | XP`.",
          ephemeral: true,
        });
      }
      if (response === "level/xpnext") {
        await set(`${interaction.user.id}_level_display`, "level/xpnext");
        await interaction.reply({
          content: "Your level display has been set to `Level | XP (XP left to next level)`.",
          ephemeral: true,
        });
      }
      if (response === "level/xpnextbar") {
        await set(`${interaction.user.id}_level_display`, "level/xpnextbar");
        await interaction.reply({
          content: "Your level display has been set to `Level (XP left to next level) (Bar)`.",
          ephemeral: true,
        });
      }
    } else if (interaction.options.getSubcommand() === "reset") {
      let response = interaction.options.getString("setting");
      if (response === "embedcolor") {
        await set(`${interaction.user.id}_color`, "#ffe302");
        await interaction.reply({
          content: "Your embed color has been reset to default. (#ffe302)",
          ephemeral: true,
        });
      }
      if (response === "xpalerts") {
        await set(`${interaction.user.id}_xp_alerts`, "1");
        await interaction.reply({
          content: "Your xp alerts setting has been reset to default. (Enabled)",
          ephemeral: true,
        });
      }
      if (response === "interactions") {
        await set(`${interaction.user.id}_interactions`, "1");
        await interaction.reply({
          content: "Your interactions setting has been reset to default. (Enabled)",
          ephemeral: true,
        });
      }
      if (response === "hpdisplay") {
        await set(`${interaction.user.id}_hp_display`, "hp");
        await interaction.reply({
          content: "Your HP display setting has been reset to default. (HP)",
          ephemeral: true,
        });
      }
      if (response === "leveldisplay") {
        await set(`${interaction.user.id}_level_display`, "level/xp");
        await interaction.reply({
          content: "Your level display setting has been reset to default. (Level | XP)",
          ephemeral: true,
        });
      }
      if (response === "buyconfirmation") {
        await set(`${interaction.user.id}_buyConfirmation`, "1");
        await interaction.reply({
          content: "Your buy confirmation setting has been reset to default. (Enabled)",
          ephemeral: true,
        });
      }
      if (response === "sellconfirmation") {
        await set(`${interaction.user.id}_sellConfirmation`, "1");
        await interaction.reply({
          content: "Your sell confirmation setting has been reset to default. (Enabled)",
          ephemeral: true,
        });
      }
      if (response === "all") {
        await set(`${interaction.user.id}_color`, "ffe302");
        await set(`${interaction.user.id}_xp_alerts`, "1");
        await set(`${interaction.user.id}_interactions`, "1");
        await set(`${interaction.user.id}_hp_display`, "hp");
        await set(`${interaction.user.id}_level_display`, "level/xp");
        await set(`${interaction.user.id}_buyConfirmation`, "1");
        await set(`${interaction.user.id}_sellConfirmation`, "1");
        await interaction.reply({
          content: "All your settings have been reset to their defaults.",
          ephemeral: true,
        });
      }
    } else if (interaction.options.getSubcommand() === "confirmations") {
      const buyConfirmation = await get(`${user.id}_buyConfirmation`);
      const sellConfirmation = await get(`${user.id}_sellConfirmation`);
      const response = interaction.options.getString("type");

      if (response === "buying") {
        const newValue = buyConfirmation === "0" ? "1" : "0";
        await set(`${user.id}_buyConfirmation`, newValue);
        await interaction.reply({
          content: `You will ${newValue === "1" ? "now" : "no longer"} get confirmations when buying items.`,
          ephemeral: true,
        });
      }

      if (response === "selling") {
        const newValue = sellConfirmation === "0" ? "1" : "0";
        await set(`${user.id}_sellConfirmation`, newValue);
        await interaction.reply({
          content: `You will ${newValue === "1" ? "now" : "no longer"} get confirmations when selling items.`,
          ephemeral: true,
        });
      }

      if (response === "all") {
        const newValue = buyConfirmation === "0" || sellConfirmation === "0" ? "1" : "0";
        await set(`${user.id}_buyConfirmation`, newValue);
        await set(`${user.id}_sellConfirmation`, newValue);
        await interaction.reply({
          content: `You will ${newValue === "1" ? "now" : "no longer"} get confirmations for all actions.`,
          ephemeral: true,
        });
      }
    }
  },
};
