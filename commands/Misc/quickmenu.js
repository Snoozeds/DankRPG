const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { set, get } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder().setName("qm").setDescription("Quickly access menus and commands."),
  async execute(interaction) {
    const user = interaction.user;
    const hasSeen = await get(`${user.id}_qmSeen`);
    if (!hasSeen) {
      const embed = new EmbedBuilder()
        .setTitle("Quick Menu")
        .setDescription(
          `**This is the first time you have ran this command, so you are being shown the tutorial.**
          
\`/qm\` is an easy way to access menus and commands, without having to type out the full command.
You can click on the buttons below to access the different menus, and after that, the ⬅️ button will take you back to all the options.`
        )
        .setColor((await get(`${user.id}_color`)) ?? "#2b2d31");

      let row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("qm_commands").setLabel("Commands").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("qm_profile").setLabel("Profile").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("qm_inventory").setLabel("Inventory").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("qm_cooldowns").setLabel("Cooldowns").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("qm_quests").setLabel("Quests").setStyle(ButtonStyle.Primary)
      );

      let row2; // Discord only allows 5 buttons per row, so we need to make a second row if the user has a pet equipped.

      if ((await get(`${user.id}_petEquipped`)) != "" || (await get(`${user.id}_petEquipped`)) != null) {
        row2 = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("qm_petStatus").setLabel("Pet Status").setStyle(ButtonStyle.Primary));
      }

      if (!row2) {
        await interaction.reply({ embeds: [embed], components: [row] });
      } else {
        await interaction.reply({ embeds: [embed], components: [row, row2] });
      }
      await set(`${user.id}_qmSeen`, true);
    } else {
      // Show the user the quick menu.

      const embed = new EmbedBuilder()
        .setTitle("Quick Menu")
        .setDescription("**Select an option below.**")
        .setColor((await get(`${user.id}_color`)) ?? "#2b2d31");

      let row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("qm_commands").setLabel("Commands").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("qm_profile").setLabel("Profile").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("qm_inventory").setLabel("Inventory").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("qm_cooldowns").setLabel("Cooldowns").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("qm_quests").setLabel("Quests").setStyle(ButtonStyle.Primary)
      );

      let row2; // Discord only allows 5 buttons per row, so we need to make a second row if the user has a pet equipped.

      if ((await get(`${user.id}_petEquipped`)) != "" || (await get(`${user.id}_petEquipped`)) != null) {
        row2 = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("qm_petStatus").setLabel("Pet Status").setStyle(ButtonStyle.Primary));
      }

      if (!row2) {
        await interaction.reply({ embeds: [embed], components: [row] });
      } else {
        await interaction.reply({ embeds: [embed], components: [row, row2] });
      }
    }
  },
};
