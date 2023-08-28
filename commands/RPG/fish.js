const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { get, cooldown, ms } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder().setName("fish").setDescription("Go fishing (requires at least a Basic Fishing Rod.)"),
  async execute(interaction) {
    const user = interaction.user;

    if (await cooldown.check(user.id, "fish")) {
      return interaction.reply({
        content: `You're on cooldown! Please wait ${ms(await cooldown.get(interaction.user.id, "fish"))} before using this command again.`,
        ephemeral: true,
      });
    }

    if ((await get(`${user.id}_fishingRodEquipped`)) == null || (await get(`${user.id}_fishingRodEquipped`)) == "none") {
      return interaction.reply({ content: "You don't have a fishing rod equipped. You can buy one from /shop and equip one using /equip.", ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle("Fishing")
      .setDescription("You go to a well known fishing spot.")
      .setFooter({ text: "Choose your next action." })
      .setColor(await get(`${user.id}_color`));

    const row = new ActionRowBuilder();
    const castButton = new ButtonBuilder().setCustomId("fishing-cast").setLabel("Cast").setStyle(ButtonStyle.Primary);
    const leaveButton = new ButtonBuilder().setCustomId("fishing-leave").setLabel("Leave").setStyle(ButtonStyle.Danger);
    const tutorialButton = new ButtonBuilder().setCustomId("fishing-tutorial").setLabel("View tutorial").setStyle(ButtonStyle.Secondary);
    row.addComponents([castButton, leaveButton, tutorialButton]);

    cooldown.set(user.id, "fishButtonTimeout", "60s");

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
