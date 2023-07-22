const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const {
  get,
  set,
  coinEmoji,
  diamondEmoji,
  stoneEmoji,
  woodEmoji,
  celestialArmorEmoji,
  sunforgedArmorEmoji,
  glacialArmorEmoji,
  abyssalArmorEmoji,
  verdantArmorEmoji,
  sylvanArmorEmoji,
  topazineArmorEmoji,
} = require("../../globals.js");

// Define the prices of each item in the inventory.
const inventoryPrices = {
  _lifesaver: 0,
  _diamond: 250,
  _wood: 1,
  _stone: 5,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("inventory")
    .setDescription("Shows your/another user's inventory.")
    .addUserOption((option) => option.setName("user").setDescription("The member whose inventory you want to view").setRequired(false)),
  async execute(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;

    if (user.bot) {
      await interaction.reply({
        text: "You can't view the inventory of a bot!",
        ephemeral: true,
      });
      return;
    }

    // Set default values for inventory if they do not exist (null.)
    await setDefaultInventoryValues(user.id, "_lifesaver", 0);
    await setDefaultInventoryValues(user.id, "_diamond", 0);
    await setDefaultInventoryValues(user.id, "_wood", 0);
    await setDefaultInventoryValues(user.id, "_stone", 0);

    // An array for the inventory items.
    const inventoryItems = [
      {
        name: "Lifesavers",
        key: `${user.id}_lifesaver`,
        price: inventoryPrices._lifesaver,
      },
      {
        name: "Diamonds",
        key: `${user.id}_diamond`,
        price: inventoryPrices._diamond,
        emoji: diamondEmoji,
      },
      {
        name: "Stone",
        key: `${user.id}_stone`,
        price: inventoryPrices._stone,
        emoji: stoneEmoji,
      },
      {
        name: "Wood",
        key: `${user.id}_wood`,
        price: inventoryPrices._wood,
        emoji: woodEmoji,
      },
    ];

    const armorItems = [
      {
        name: "Celestial Armor",
        key: `${user.id}_celestialArmor`,
        price: 35000,
        emoji: celestialArmorEmoji,
      },
      {
        name: "Sunforged Armor",
        key: `${user.id}_sunforgedArmor`,
        price: 22500,
        emoji: sunforgedArmorEmoji,
      },
      {
        name: "Glacial Armor",
        key: `${user.id}_glacialArmor`,
        price: 17500,
        emoji: glacialArmorEmoji,
      },
      {
        name: "Abyssal Armor",
        key: `${user.id}_abyssalArmor`,
        price: 13500,
        emoji: abyssalArmorEmoji,
      },
      {
        name: "Verdant Armor",
        key: `${user.id}_verdantArmor`,
        price: 10500,
        emoji: verdantArmorEmoji,
      },
      {
        name: "Sylvan Armor",
        key: `${user.id}_sylvanArmor`,
        price: 7500,
        emoji: sylvanArmorEmoji,
      },
      {
        name: "Topazine Armor",
        key: `${user.id}_topazineArmor`,
        price: 4500,
        emoji: topazineArmorEmoji,
      },
    ];

    // Sort the inventory items by price.
    inventoryItems.sort((a, b) => a.price - b.price);
    armorItems.sort((a, b) => b.price - a.price);

    // Loop through the armor items and add them to the description.
    let armorDescription = "";
    let totalInventoryValue = 0;
    for (const item of armorItems) {
      const value = await get(item.key);
      if (value && item.price && item.price > 0 && value > 0) {
        const itemValue = value * item.price;
        armorDescription += `**${item.emoji} ${item.name}** (${coinEmoji}${itemValue})\n`;
        totalInventoryValue += itemValue;
      } else if (value && value > 0) {
        armorDescription += `${item.name}: ${value}\n`;
      }
    }

    // Loop through the inventory items and add them to the description.
    let inventoryDescription = "";
    for (const item of inventoryItems) {
      const value = await get(item.key);
      if (value && item.price && item.price > 0 && value > 0) {
        const itemValue = value * item.price;
        inventoryDescription += `**${item.emoji} ${item.name}**: ${value} (${coinEmoji}${itemValue})\n`;
        totalInventoryValue += itemValue;
      } else if (value && value > 0) {
        inventoryDescription += `${item.name}: ${value}\n`;
      }
    }

    // Add the armors to the inventory description.
    inventoryDescription += `\n**Armor:**\n${armorDescription}`;

    // If the inventory is empty, reply with an ephemeral message.
    if (inventoryDescription === "") {
      inventoryDescription = "This user has an empty inventory.";
    }

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Inventory`)
      .setFields({
        name: "Total Inventory Value",
        value: `${coinEmoji}**${totalInventoryValue.toLocaleString()}**`,
        inline: true,
      })
      .setDescription(`**Items:**\n${inventoryDescription}`)
      .setColor(await get(`${interaction.user.id}_color`))
      .setThumbnail(user.displayAvatarURL({ format: "jpg", size: 4096 }));

    async function setDefaultInventoryValues(id, key, value) {
      if ((await get(`${id}${key}`)) === null) {
        await set(`${id}${key}`, value);
      }
    }

    await interaction.reply({ embeds: [embed] });
  },
};
