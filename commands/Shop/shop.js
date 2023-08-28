const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType, SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { emoji } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder().setName("shop").setDescription("Buy items from the shop."),
  async execute(interaction) {
    const user = interaction.user;

    // We have to defer the reply. Discord gets mad otherwise.
    await interaction.deferReply();

    const select = new StringSelectMenuBuilder()
      .setCustomId("shop")
      .setPlaceholder("Select an item category.")
      .addOptions(
        new StringSelectMenuOptionBuilder().setLabel("Health items").setDescription("Items that restore your health.").setValue("health").setEmoji(emoji.hp),
        new StringSelectMenuOptionBuilder().setLabel("Armor").setDescription("Items that increase your armor.").setValue("armor").setEmoji(emoji.armor),
        new StringSelectMenuOptionBuilder().setLabel("Weapons").setDescription("Items that increase your attack.").setValue("weapons").setEmoji(emoji.attack),
        new StringSelectMenuOptionBuilder().setLabel("Fishing").setDescription("Items used in fishing.").setValue("fishing").setEmoji(emoji.bestFishingRod)
      );

    const row = new ActionRowBuilder().addComponents(select);

    await interaction.editReply({
      content: "Select a category to view items.",
      components: [row],
    });
  },
};
