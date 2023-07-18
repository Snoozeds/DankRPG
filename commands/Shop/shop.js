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

    const select = new StringSelectMenuBuilder().setCustomId("shop").setPlaceholder("Select an item category.").addOptions(
      new StringSelectMenuOptionBuilder().setLabel("Health items").setDescription("Items that restore your health.").setValue("health").setEmoji(hpEmoji),

      new StringSelectMenuOptionBuilder().setLabel("Equipment").setDescription("Items that increase your stats.").setValue("equipment").setEmoji(armorEmoji)
    );

    const row = new ActionRowBuilder().addComponents(select);

    const reply = await interaction.editReply({
      content: "Select a category to view items.",
      components: [row],
    });

    const filter = (i) => i.user.id === user.id;
    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      filter: filter,
      time: 3_600_000, // the collector will remain active for 1 hour (3600000 ms.)
    });

    // interaction.editReply will edit the embed correctly but Discord will say the select menu interaction failed.
    // as such, we must use i.update.
    collector.on("collect", async (i) => {
      if (i.customId === "shop") {
        if (i.values[0] === "health") {
          const embed = new EmbedBuilder()
            .setTitle("Health items")
            .setDescription(`"Welcome to my shop!"\nYour balance: **${coinEmoji}${await get(`${user.id}_coins`)}**`)
            .addFields({
              name: `${lifesaverEmoji} Lifesaver (Owned: ${(await get(`${user.id}_lifesaver`)) || 0})`,
              value: `**Cost: ${coinEmoji}500**\nSaves you from death. Used automatically.\nid: lifesaver`,
            })
            .setFooter({ text: "Use /buy <id> to buy an item." })
            .setColor(await get(`${user.id}_color`))
            .setThumbnail(shopImage);
          await i.update({
            content: "",
            embeds: [embed],
            components: [row],
          });
        } else if (i.values[0] === "equipment") {
          const embed = new EmbedBuilder()
            .setTitle("Equipment")
            .setDescription(
              `"Welcome to my shop!"\nYour balance: **${coinEmoji}${await get(`${user.id}_coins`)}**

${celestialArmorEmoji} Celestial Armor (**celestial**)
${descriptionEmoji} Armor of immense strength, said to have been forged by the gods themselves.
${coinEmoji} **35,000**
${armorUpEmoji} **+50**
\-
${sunforgedArmorEmoji} Sunforged Armor (**sunforged**)
${descriptionEmoji} Extremely rare and formidable armor, forged in the heat of the sun.
${coinEmoji} **22,500**
${armorUpEmoji} **+35**
\-
${glacialArmorEmoji} Glacial Armor (**glacial**)
${descriptionEmoji} Very rare and robust armor, meticulously forged in the coldest of glaciers.
${coinEmoji} **17,500**
${armorUpEmoji} **+30**
\-
${abyssalArmorEmoji} Abyssal Armor (**abyssal**)
${descriptionEmoji} Rare and powerful armor, imbued with the essence of the deep sea.
${coinEmoji} **13,500**
${armorUpEmoji} **+25**
\-
${verdantArmorEmoji} Verdant Armor (**verdant**)
${descriptionEmoji} Strong and sought-after armor, adorned with the essence of lush greenery.
${coinEmoji} **10,500**
${armorUpEmoji} **+20**
\-
${sylvanArmorEmoji} Sylvan Armor (**sylvan**)
${descriptionEmoji} Highly coveted and rare armor, emanating the magic of ancient forests.
${coinEmoji} **7,500**
${armorUpEmoji} **+10**
\-
${topazineArmorEmoji} Topazine Armor (**topazine**)
${descriptionEmoji} Relatively common armor, imbued with the essence of the earth.
${coinEmoji} **4,500**
${armorUpEmoji} **+2**
\-
${stoneRingEmoji} Stone Ring (Owned: ${(await get(`${user.id}_stoneRing`)) || 0}) (**stonering**)
${descriptionEmoji} A small ring crafted from stone. Automatically equips itself when bought. Cannot be unequipped.
${coinEmoji} **2,000**
${armorUpEmoji} **+1**`
            )
            .setFooter({ text: "Use /buy <id> to buy an item and /equip to equip an item. You can only equip one armor item at once." })
            .setColor(await get(`${user.id}_color`))
            .setThumbnail(shopImage);
          await i.update({
            content: "",
            embeds: [embed],
            components: [row],
          });
        }
      }
    });
  },
};
