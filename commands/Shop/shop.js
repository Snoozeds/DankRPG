const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType, SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const {
  get,
  coinEmoji,
  stoneRingEmoji,
  lifesaverEmoji,
  hpEmoji,
  armorEmoji,
  celestialArmorEmoji,
  sunforgedArmorEmoji,
  glacialArmorEmoji,
  abyssalArmorEmoji,
  verdantArmorEmoji,
  sylvanArmorEmoji,
  topazineArmorEmoji,
  attackEmoji,
  attackUpEmoji,
  critUpEmoji,
  bladeOfTheDeadEmoji,
  divineWrathEmoji,
  umbralEclipseEmoji,
  azurebladeEmoji,
  zephyrsBreezeEmoji,
  squiresHonorEmoji,
  crimsonDaggerEmoji,
  shopImage,
  descriptionEmoji,
  armorUpEmoji,
} = require("../../globals.js");

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
        new StringSelectMenuOptionBuilder().setLabel("Health items").setDescription("Items that restore your health.").setValue("health").setEmoji(hpEmoji),
        new StringSelectMenuOptionBuilder().setLabel("Armor").setDescription("Items that increase your armor.").setValue("armor").setEmoji(armorEmoji),
        new StringSelectMenuOptionBuilder().setLabel("Weapons").setDescription("Items that increase your attack.").setValue("weapons").setEmoji(attackEmoji)
      );

    const row = new ActionRowBuilder().addComponents(select);

    await interaction.editReply({
      content: "Select a category to view items.",
      components: [row],
    });
  },
};
