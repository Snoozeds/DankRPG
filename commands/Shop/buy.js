const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const { set, decr, incr, get, emoji } = require("../../globals.js");

// Array of the items, armor value is just there for rings where the armor is automatically added to the user's armor, instead of equipped.
const items = {
  lifesaver: {
    name: "Lifesaver",
    emoji: "lifesaver",
    variable: "lifesaver",
    price: 1000,
    armor: 0,
    allowMultiple: false,
  },
  luckPotion: {
    name: "Luck Potion",
    emoji: "luckPotion",
    variable: "luckPotion",
    price: 500,
    armor: 0,
    allowMultiple: true,
  },
  stoneRing: {
    name: "Stone Ring",
    emoji: "stoneRing",
    variable: "stoneRing",
    price: 2000,
    armor: 1,
    allowMultiple: false,
  },
  celestialArmor: {
    name: "Celestial Armor",
    emoji: "celestialArmor",
    variable: "celestialArmor",
    price: 30000,
    armor: 0,
    allowMultiple: false,
  },
  sunforgedArmor: {
    name: "Sunforged Armor",
    emoji: "sunforgedArmor",
    variable: "sunforgedArmor",
    price: 22500,
    armor: 0,
    allowMultiple: false,
  },
  glacialArmor: {
    name: "Glacial Armor",
    emoji: "glacialArmor",
    variable: "glacialArmor",
    price: 17500,
    armor: 0,
    allowMultiple: false,
  },
  abyssalArmor: {
    name: "Abyssal Armor",
    emoji: "abyssalArmor",
    variable: "abyssalArmor",
    price: 13500,
    armor: 0,
    allowMultiple: false,
  },
  verdantArmor: {
    name: "Verdant Armor",
    emoji: "verdantArmor",
    variable: "verdantArmor",
    price: 10500,
    armor: 0,
    allowMultiple: false,
  },
  sylvanArmor: {
    name: "Sylvan Armor",
    emoji: "sylvanArmor",
    variable: "sylvanArmor",
    price: 7500,
    armor: 0,
    allowMultiple: false,
  },
  topazineArmor: {
    name: "Topazine Armor",
    emoji: "topazineArmor",
    variable: "topazineArmor",
    price: 4500,
    armor: 0,
    allowMultiple: false,
  },
  crimsonDagger: {
    name: "Crimson Dagger",
    emoji: "crimsonDagger",
    variable: "crimsonDagger",
    price: 5000,
    armor: 0,
    allowMultiple: false,
  },
  squiresHonor: {
    name: "Squire's Honor",
    emoji: "squiresHonor",
    variable: "squiresHonor",
    price: 7500,
    armor: 0,
    allowMultiple: false,
  },
  zephyrsBreeze: {
    name: "Zephyr's Breeze",
    emoji: "zephyrsBreeze",
    variable: "zephyrsBreeze",
    price: 13000,
    armor: 0,
    allowMultiple: false,
  },
  azureBlade: {
    name: "Azure Blade",
    emoji: "azureBlade",
    variable: "azureBlade",
    price: 17000,
    armor: 0,
    allowMultiple: false,
  },
  umbralEclipse: {
    name: "Umbral Eclipse",
    emoji: "umbralEclipse",
    variable: "umbralEclipse",
    price: 23000,
    armor: 0,
    allowMultiple: false,
  },
  divineWrath: {
    name: "Divine Wrath",
    emoji: "divineWrath",
    variable: "divineWrath",
    price: 30000,
    armor: 0,
    allowMultiple: false,
  },
  bladeOfTheDead: {
    name: "Blade of the Dead",
    emoji: "bladeOfTheDead",
    variable: "bladeOfTheDead",
    price: 37000,
    armor: 0,
    allowMultiple: false,
  },
  basicFishingRod: {
    name: "Basic Fishing Rod",
    emoji: "basicFishingRod",
    variable: "basicFishingRod",
    price: 1000,
    armor: 0,
    allowMultiple: false,
  },
  betterFishingRod: {
    name: "Better Fishing Rod",
    emoji: "betterFishingRod",
    variable: "betterFishingRod",
    price: 5000,
    armor: 0,
    allowMultiple: false,
  },
  bestFishingRod: {
    name: "Best Fishing Rod",
    emoji: "bestFishingRod",
    variable: "bestFishingRod",
    price: 10000,
    armor: 0,
    allowMultiple: false,
  },
  fishingBait: {
    name: "Fishing Bait",
    emoji: "fishingBait",
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
            name: `${items[key].name} (${items[key].price} Coins)`,
            value: key,
          }))
        )
    )
    .addIntegerOption((option) =>
      option.setName("amount").setDescription("The amount of the item you want to buy.").setRequired(false)
    ),
  async execute(interaction) {
    const item = interaction.options.getString("item");
    const user = interaction.user;
    const amount = interaction.options.getInteger("amount") ?? 1;
    const coins = await get(`${user.id}_coins`);
    const collectorFilter = (i) => i.user.id === interaction.user.id;

    // Check if user has enough coins
    if (coins < items[item].price * amount) {
      return interaction.reply({
        content: `You don't have enough coins to buy this item. You need ${emoji.coins}${items[item].price - coins} more.`,
        ephemeral: true,
      });
    }

    if(amount && !items[item].allowMultiple) {
      return interaction.reply({
        content: `You can't buy more than one of this item.`,
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

    const totalPrice = items[item].price * amount;

    const buyConfirmation = await get(`${user.id}_buyConfirmation`);
    if (buyConfirmation === "1" || buyConfirmation === "null") {
      const yes = new ButtonBuilder().setCustomId("yes").setLabel("Yes").setStyle(ButtonStyle.Success);
      const no = new ButtonBuilder().setCustomId("no").setLabel("No").setStyle(ButtonStyle.Danger);
      const row = new ActionRowBuilder().addComponents(yes, no);

      const reply = await interaction.reply({
        content: `Are you sure you want to buy ${amount}x ${emoji[item]} ${items[item].name} for ${emoji.coins}${totalPrice}?`,
        components: [row],
      });

      try {
        const confirmation = await reply.awaitMessageComponent({ filter: collectorFilter, time: 60000 });
        if (confirmation.customId === "yes") {
          const userCoins = await get(`${user.id}_coins`);

          // Check user still has enough coins
          if (userCoins < items[item].price) {
            return confirmation.update({
              content: `You no longer have enough coins to buy this item. You need ${emoji.coins}${totalPrice - userCoins} more.`,
              components: [],
            });
          }

          // Check if user has bought item since confirmation
          const userHasItem = await get(`${user.id}_${item}`);
          if (userHasItem == 1 && !items[item].allowMultiple) {
            return confirmation.update({
              content: `You already have this item!`,
              components: [],
            });
          }

          if (items[item].allowMultiple) {
            await incr(user.id, `${item}`, amount);
          } else {
            await set(`${user.id}_${items[item].variable}`, 1);
          }
          await decr(user.id, "coins", totalPrice);
          if (items[item].armor > 0) {
            await incr(user.id, "armor", items[item].armor);
          }

          await confirmation.update({
            content: `You bought ${amount}x ${emoji[item]} for ${emoji.coins}${totalPrice}${items[item].armor > 0 ? `\n${emoji.armorUp} +**${items[item].armor}**` : ""}.`,
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
      await decr(user.id, "coins", totalPrice);
      return interaction.reply({
        content: `You bought ${emoji[item]}1 for ${emoji.coins}${totalPrice}.`,
        ephemeral: true,
      });
    }
  },
};
