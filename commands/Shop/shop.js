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
              value: `**Cost: ${coinEmoji}1000**\nSaves you from death. Used automatically.\nid: lifesaver`,
            })
            .setFooter({ text: "Use /buy <id> to buy an item." })
            .setColor(await get(`${user.id}_color`))
            .setThumbnail(shopImage);
          await i.update({
            content: "",
            embeds: [embed],
            components: [row],
          });
        } else if (i.values[0] === "armor") {
          const embed = new EmbedBuilder()
            .setTitle("Armor")
            .setDescription(
              `"Welcome to my shop!"\nYour balance: **${coinEmoji}${await get(`${user.id}_coins`)}**

${celestialArmorEmoji} Celestial Armor (**celestial**) ${(await get(`${user.id}_celestialArmor`)) === "1" ? "(owned)" : ""}
${descriptionEmoji} Armor of immense strength, said to have been forged by the gods themselves.
${coinEmoji} **30,000**
${armorUpEmoji} **+50**
\-
${sunforgedArmorEmoji} Sunforged Armor (**sunforged**) ${(await get(`${user.id}_sunforgedArmor`)) === "1" ? "(owned)" : ""}
${descriptionEmoji} Extremely rare and formidable armor, forged in the heat of the sun.
${coinEmoji} **22,500**
${armorUpEmoji} **+35**
\-
${glacialArmorEmoji} Glacial Armor (**glacial**) ${(await get(`${user.id}_glacialArmor`)) === "1" ? "(owned)" : ""}
${descriptionEmoji} Very rare and robust armor, meticulously forged in the coldest of glaciers.
${coinEmoji} **17,500**
${armorUpEmoji} **+30**
\-
${abyssalArmorEmoji} Abyssal Armor (**abyssal**) ${(await get(`${user.id}_abyssalArmor`)) === "1" ? "(owned)" : ""}
${descriptionEmoji} Rare and powerful armor, imbued with the essence of the deep sea.
${coinEmoji} **13,500**
${armorUpEmoji} **+25**
\-
${verdantArmorEmoji} Verdant Armor (**verdant**) ${(await get(`${user.id}_verdantArmor`)) === "1" ? "(owned)" : ""}
${descriptionEmoji} Strong and sought-after armor, adorned with the essence of lush greenery.
${coinEmoji} **10,500**
${armorUpEmoji} **+20**
\-
${sylvanArmorEmoji} Sylvan Armor (**sylvan**) ${(await get(`${user.id}_sylvanArmor`)) === "1" ? "(owned)" : ""}
${descriptionEmoji} Highly coveted and rare armor, emanating the magic of ancient forests.
${coinEmoji} **7,500**
${armorUpEmoji} **+10**
\-
${topazineArmorEmoji} Topazine Armor (**topazine**) ${(await get(`${user.id}_topazineArmor`)) === "1" ? "(owned)" : ""}
${descriptionEmoji} Relatively common armor, imbued with the essence of the earth.
${coinEmoji} **4,500**
${armorUpEmoji} **+5**
\-
${stoneRingEmoji} Stone Ring (**stonering**) ${(await get(`${user.id}_stoneRing`)) === "1" ? "(owned)" : ""}
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
        } else if (i.values[0] === "weapons") {
          const embed = new EmbedBuilder()
            .setTitle("Weapons")
            .setDescription(
              `"Welcome to my shop!"\nYour balance: **${coinEmoji}${await get(`${user.id}_coins`)}**

${bladeOfTheDeadEmoji} Blade of the Dead (**blade**/**botd**) ${(await get(`${user.id}_bladeOfTheDead`)) === "1" ? "(owned)" : ""}
${descriptionEmoji} The Blade of the Dead strikes fear into the hearts of enemies. Its malevolent aura grants the wielder the power to drain life from foes, leaving devastation in their wake.
${coinEmoji} **37,000**
${attackUpEmoji} **+60**
${critUpEmoji} **+60%**
-
${divineWrathEmoji} Divine Wrath (**divine**/**dw**) ${(await get(`${user.id}_divineWrath`)) === "1" ? "(owned)" : ""}
${descriptionEmoji} Carved from a single shard of a fallen comet, the Celestial Edge is a legendary blade imbued with the very essence of the gods.
${coinEmoji} **30,000**
${attackUpEmoji} **+40**
${critUpEmoji} **+50%**
-
${umbralEclipseEmoji} Umbral Eclipse (**umbral**/**ue**) ${(await get(`${user.id}_umbralEclipse`)) === "1" ? "(owned)" : ""}
${descriptionEmoji} A lethal masterpiece forged from shadowy steel, the Umbral eclipse is the perfect fusion of elegance and devastation.
${coinEmoji} **23,000**
${attackUpEmoji} **+30**
${critUpEmoji} **+40%**
-
${azurebladeEmoji} Azureblade (**azureblade**/**ab**) ${(await get(`${user.id}_azureblade`)) === "1" ? "(owned)" : ""}
${descriptionEmoji} A legendary sword forged from shimmering azure steel, the Azureblade is the perfect all-rounder for a medium-skilled adventurer.
${coinEmoji} **17,000**
${attackUpEmoji} **+20**
${critUpEmoji} **+35%**
-
${zephyrsBreezeEmoji} Zephyr's Breeze (**zephyrs**/**zb**) ${(await get(`${user.id}_zephyrsBreeze`)) === "1" ? "(owned)" : ""}
${descriptionEmoji} Crafted with ethereal precision, the Zephyr Breeze cleaves through foes with unmatched speed and grace.
${coinEmoji} **13,000**
${attackUpEmoji} **+15**
${critUpEmoji} **+30%**
-
${squiresHonorEmoji} Squire's Honor (**squires**/**sh**) ${(await get(`${user.id}_squiresHonor`)) === "1" ? "(owned)" : ""}
${descriptionEmoji} A sword once used by knights across the country, the Squire's Honor is the perfect choice for an adventurer just starting out.
${coinEmoji} **7,500**
${attackUpEmoji} **+10**
${critUpEmoji} **+15%**
-
${crimsonDaggerEmoji} Crimson Dagger (**crimson**/**cd**) ${(await get(`${user.id}_crimsonDagger`)) === "1" ? "(owned)" : ""}
${descriptionEmoji} A fast, strong and cost effective dagger, crafted from crimson.
${coinEmoji} **5,000**
${attackUpEmoji} **+5**
${critUpEmoji} **+10%**`
            )
            .setFooter({ text: "Use /buy <id> to buy an item and /equip to equip an item. You can only equip one weapon at once." })
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
