const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const { set, decr, incr, get, emoji } = require("../../globals.js");

// Array of the items, armor value is just there for rings where the armor is automatically added to the user's armor, instead of equipped.
const items = {
  lifesaver: {
    name: "Lifesaver",
    emoji: emoji.lifesaver,
    variable: "lifesaver",
    price: 1000,
    armor: 0,
    allowMultiple: false,
  },
  stoneRing: {
    name: "Stone Ring",
    emoji: emoji.stoneRing,
    variable: "stoneRing",
    price: 2000,
    armor: 1,
    allowMultiple: false,
  },
  celestialArmor: {
    name: "Celestial Armor",
    emoji: emoji.celestialArmor,
    variable: "celestialArmor",
    price: 30000,
    armor: 0,
    allowMultiple: false,
  },
  sunforgedArmor: {
    name: "Sunforged Armor",
    emoji: emoji.sunforgedArmor,
    variable: "sunforgedArmor",
    price: 22500,
    armor: 0,
    allowMultiple: false,
  },
  glacialArmor: {
    name: "Glacial Armor",
    emoji: emoji.glacialArmor,
    variable: "glacialArmor",
    price: 17500,
    armor: 0,
    allowMultiple: false,
  },
  abyssalArmor: {
    name: "Abyssal Armor",
    emoji: emoji.abyssalArmor,
    variable: "abyssalArmor",
    price: 13500,
    armor: 0,
    allowMultiple: false,
  },
  verdantArmor: {
    name: "Verdant Armor",
    emoji: emoji.verdantArmor,
    variable: "verdantArmor",
    price: 10500,
    armor: 0,
    allowMultiple: false,
  },
  sylvanArmor: {
    name: "Sylvan Armor",
    emoji: emoji.sylvanArmor,
    variable: "sylvanArmor",
    price: 7500,
    armor: 0,
    allowMultiple: false,
  },
  topazineArmor: {
    name: "Topazine Armor",
    emoji: emoji.topazineArmor,
    variable: "topazineArmor",
    price: 4500,
    armor: 0,
    allowMultiple: false,
  },
  crimsonDagger: {
    name: "Crimson Dagger",
    emoji: emoji.crimsonDagger,
    variable: "crimsonDagger",
    price: 5000,
    armor: 0,
    allowMultiple: false,
  },
  squiresHonor: {
    name: "Squire's Honor",
    emoji: emoji.squiresHonor,
    variable: "squiresHonor",
    price: 7500,
    armor: 0,
    allowMultiple: false,
  },
  zephyrsBreeze: {
    name: "Zephyr's Breeze",
    emoji: emoji.zephyrsBreeze,
    variable: "zephyrsBreeze",
    price: 13000,
    armor: 0,
    allowMultiple: false,
  },
  azureBlade: {
    name: "Azure Blade",
    emoji: emoji.azureBlade,
    variable: "azureBlade",
    price: 17000,
    armor: 0,
    allowMultiple: false,
  },
  umbralEclipse: {
    name: "Umbral Eclipse",
    emoji: emoji.umbralEclipse,
    variable: "umbralEclipse",
    price: 23000,
    armor: 0,
    allowMultiple: false,
  },
  divineWrath: {
    name: "Divine Wrath",
    emoji: emoji.divineWrath,
    variable: "divineWrath",
    price: 30000,
    armor: 0,
    allowMultiple: false,
  },
  bladeOfTheDead: {
    name: "Blade of the Dead",
    emoji: emoji.bladeOfTheDead,
    variable: "bladeOfTheDead",
    price: 37000,
    armor: 0,
    allowMultiple: false,
  },
  basicFishingRod: {
    name: "Basic Fishing Rod",
    emoji: emoji.basicFishingRod,
    variable: "basicFishingRod",
    price: 1000,
    armor: 0,
    allowMultiple: false,
  },
  betterFishingRod: {
    name: "Better Fishing Rod",
    emoji: emoji.betterFishingRod,
    variable: "betterFishingRod",
    price: 5000,
    armor: 0,
    allowMultiple: false,
  },
  bestFishingRod: {
    name: "Best Fishing Rod",
    emoji: emoji.bestFishingRod,
    variable: "bestFishingRod",
    price: 10000,
    armor: 0,
    allowMultiple: false,
  },
  fishingBait: {
    name: "Fishing Bait",
    emoji: emoji.fishingBait,
    variable: "fishingBait",
    price: 50,
    armor: 0,
    allowMultiple: true,
  },
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("buy")
    .setDescription("Buy an item from the shop.")
    .addStringOption((option) =>
      option
        .setName("item")
        .setDescription("The item you want to buy.")
        .setRequired(true)
        .addChoices(
          ...Object.keys(items).map((key) => ({
            name: items[key].name,
            value: key,
          }))
        )
    ),
  async execute(interaction) {
    const item = interaction.options.getString("item");
    const user = interaction.user;
    const coins = await get(`${user.id}_coins`);
    const collectorFilter = (i) => i.user.id === interaction.user.id;

    // Check if user has enough coins
    if (coins < items[item].price) {
      return interaction.reply({
        content: `You don't have enough coins to buy this item. You need ${emoji.coins}${items[item].price - coins} more.`,
        ephemeral: true,
      });
    }

    // Check if user already has item
    const hasItem = await get(`${user.id}_${item}`);
    if (hasItem == 1 && !items[item].allowMultiple) {
      return interaction.reply({
        content: `You already have this item!`,
        ephemeral: true,
      });
    }

    const buyConfirmation = await get(`${user.id}_buyConfirmation`);
    if (buyConfirmation === "1" || buyConfirmation === "null") {
      const yes = new ButtonBuilder().setCustomId("yes").setLabel("Yes").setStyle(ButtonStyle.Success);
      const no = new ButtonBuilder().setCustomId("no").setLabel("No").setStyle(ButtonStyle.Danger);
      const row = new ActionRowBuilder().addComponents(yes, no);

      const reply = await interaction.reply({
        content: `Are you sure you want to buy ${items[item].emoji}${items[item].name} for ${emoji.coins}${items[item].price}?`,
        components: [row],
      });

      try {
        const confirmation = await reply.awaitMessageComponent({ filter: collectorFilter, time: 60000 });
        if (confirmation.customId === "yes") {
          const userCoins = await get(`${user.id}_coins`);

          // Check user still has enough coins
          if (userCoins < items[item].price) {
            return confirmation.update({
              content: `You no longer have enough coins to buy this item. You need ${emoji.coins}${items[item].price - userCoins} more.`,
              components: [],
            });
          }

          // Check if user has bought item since confirmation
          const userHasItem = await get(`${user.id}_${item}`);
          if (userHasItem == 1) {
            return confirmation.update({
              content: `You already have this item!`,
              components: [],
            });
          }

          await set(`${user.id}_${items[item].variable}`, 1);
          await decr(user.id, "coins", items[item].price);
          if (items[item].armor > 0) {
            await incr(user.id, "armor", items[item].armor);
          }

          await confirmation.update({
            content: `You bought ${items[item].emoji}1 for ${emoji.coins}${items[item].price}${items[item].armor > 0 ? `\n${emoji.armorUp} +**${items[item].armor}**` : ""}.`,
            components: [],
          });
        } else if (confirmation.customId === "no") {
          await confirmation.update({
            content: "Purchase cancelled.",
            components: [],
          });
        }
      } catch (e) {
        await interaction.editReply({
          content: "No buttons have been pressed within 1 minute, cancelling purchase.",
          components: [],
        });
      }
    } else {
      if (items[item].armor > 0) {
        await incr(user.id, "armor", items[item].armor);
      }
      await set(`${user.id}_${items[item].variable}`, 1);
      await decr(user.id, "coins", items[item].price);
      return interaction.reply({
        content: `You bought ${items[item].emoji}1 for ${emoji.coins}${items[item].price}.`,
        ephemeral: true,
      });
    }
  },
};
