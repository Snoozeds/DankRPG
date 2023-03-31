const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { get, set, coinEmoji } = require("../../globals.js");

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
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The member whose inventory you want to view")
        .setRequired(false)
    ),
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
      },
      {
        name: "Stone",
        key: `${user.id}_stone`,
        price: inventoryPrices._stone,
      },
      {
        name: "Wood",
        key: `${user.id}_wood`,
        price: inventoryPrices._wood,
      },
    ];

    // Sort the inventoryItems array alphabetically by name.
    inventoryItems.sort((a, b) => a.name.localeCompare(b.name));

    // Loop through the inventory items and add them to the description.
    let inventoryDescription = "";
    let totalInventoryValue = 0;
    for (const item of inventoryItems) {
      const value = await get(item.key);
      if (value != 0 && value != null) {
        const itemValue = value * item.price;
        inventoryDescription += `${item.name}: ${value} (${coinEmoji}${itemValue})\n`;
        totalInventoryValue += itemValue;
      }
    }

    // If the inventory is empty, reply with an ephemeral message.
    if (inventoryDescription === "") {
      inventoryDescription = "This user has an empty inventory.";
    }

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Inventory`)
      .setFields(
        {
          name: "Balance",
          value: `${coinEmoji}**${await get(`${user.id}_coins`)}**`,
          inline: true,
        },
        {
          name: "Total Inventory Value",
          value: `${coinEmoji}**${totalInventoryValue}**`,
          inline: true,
        }
      )
      .setDescription(inventoryDescription)
      .setColor(await get(`${user.id}_color`))
      .setThumbnail(
        user.displayAvatarURL({ format: "jpg", size: 4096 })
      );

    async function setDefaultInventoryValues(id, key, value) {
      if ((await get(`${id}${key}`)) === null) {
        await set(`${id}${key}`, value);
      }
    }

    await interaction.reply({ embeds: [embed] });
  },
};
