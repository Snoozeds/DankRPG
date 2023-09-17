const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { get, set, emoji } = require("../../globals.js");

// Define the prices of each item in the inventory.
const inventoryPrices = {
  _lifesaver: 1000,
  _luckPotion: 500,
  _energyPotion: 500,
  _healthPotion: 0,
  _diamond: 250,
  _demonWing: 300,
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

    // Inventory arrays
    const inventoryItems = [
      {
        name: "Lifesaver",
        key: `${user.id}_lifesaver`,
        price: inventoryPrices._lifesaver,
        emoji: emoji.lifesaver,
      },
      {
        name: "Luck Potions",
        key: `${user.id}_luckPotion`,
        price: inventoryPrices._luckPotion,
        emoji: emoji.luckPotion,
      },
      {
        name: "Energy Potions",
        key: `${user.id}_energyPotion`,
        price: inventoryPrices._energyPotion,
        emoji: emoji.energyPotion,
      },
      {
        name: "Health Potions",
        key: `${user.id}_healthPotion`,
        price: inventoryPrices._healthPotion,
        emoji: emoji.healthPotion,
      },
      {
        name: "Diamonds",
        key: `${user.id}_diamond`,
        price: inventoryPrices._diamond,
        emoji: emoji.diamond,
      },
      {
        name: "Stone",
        key: `${user.id}_stone`,
        price: inventoryPrices._stone,
        emoji: emoji.stone,
      },
      {
        name: "Wood",
        key: `${user.id}_wood`,
        price: inventoryPrices._wood,
        emoji: emoji.wood,
      },
      {
        name: "Demon Wing",
        key: `${user.id}_demonWing`,
        price: inventoryPrices._demonWing,
        emoji: emoji.demonWing,
      },
    ];

    const armorItems = [
      {
        name: "Celestial Armor",
        key: `${user.id}_celestialArmor`,
        price: 30000,
        emoji: emoji.celestialArmor,
      },
      {
        name: "Sunforged Armor",
        key: `${user.id}_sunforgedArmor`,
        price: 22500,
        emoji: emoji.sunforgedArmor,
      },
      {
        name: "Glacial Armor",
        key: `${user.id}_glacialArmor`,
        price: 17500,
        emoji: emoji.glacialArmor,
      },
      {
        name: "Abyssal Armor",
        key: `${user.id}_abyssalArmor`,
        price: 13500,
        emoji: emoji.abyssalArmor,
      },
      {
        name: "Verdant Armor",
        key: `${user.id}_verdantArmor`,
        price: 10500,
        emoji: emoji.verdantArmor,
      },
      {
        name: "Sylvan Armor",
        key: `${user.id}_sylvanArmor`,
        price: 7500,
        emoji: emoji.sylvanArmor,
      },
      {
        name: "Topazine Armor",
        key: `${user.id}_topazineArmor`,
        price: 4500,
        emoji: emoji.topazineArmor,
      },
    ];

    const weaponItems = [
      {
        name: "Blade of the Dead",
        key: `${user.id}_bladeOfTheDead`,
        price: 37000,
        emoji: emoji.bladeOfTheDead,
      },
      {
        name: "Divine Wrath",
        key: `${user.id}_divineWrath`,
        price: 30000,
        emoji: emoji.divineWrath,
      },
      {
        name: "Umbral Eclipse",
        key: `${user.id}_umbralEclipse`,
        price: 23000,
        emoji: emoji.umbralEclipse,
      },
      {
        name: "Azureblade",
        key: `${user.id}_azureblade`,
        price: 17000,
        emoji: emoji.azureBlade,
      },
      {
        name: "Zephyr's Breeze",
        key: `${user.id}_zephyrsBreeze`,
        price: 13000,
        emoji: emoji.zephyrsBreeze,
      },
      {
        name: "Squire's Honor",
        key: `${user.id}_squiresHonor`,
        price: 7500,
        emoji: emoji.squiresHonor,
      },
      {
        name: "Crimson Dagger",
        key: `${user.id}_crimsonDagger`,
        price: 5000,
        emoji: emoji.crimsonDagger,
      },
    ];

    const fishingItems = [
      {
        name: "Best Fishing Rod",
        key: `${user.id}_bestFishingRod`,
        price: 10000,
        emoji: emoji.bestFishingRod,
      },
      {
        name: "Better Fishing Rod",
        key: `${user.id}_betterFishingRod`,
        price: 5000,
        emoji: emoji.betterFishingRod,
      },
      {
        name: "Basic Fishing Rod",
        key: `${user.id}_basicFishingRod`,
        price: 1000,
        emoji: emoji.basicFishingRod,
      },
      {
        name: "Fishing Bait",
        key: `${user.id}_fishingBait`,
        price: 50,
        emoji: emoji.fishingBait,
      },
    ];

    const fish = [
      {
        name: "Tilapia",
        key: `${user.id}_tilapia`,
        price: 45,
        emoji: emoji.tilapia,
      },
      {
        name: "Sardine",
        key: `${user.id}_sardine`,
        price: 45,
        emoji: emoji.sardine,
      },
      {
        name: "Perch",
        key: `${user.id}_perch`,
        price: 45,
        emoji: emoji.perch,
      },
      {
        name: "Anchovy",
        key: `${user.id}_anchovy`,
        price: 45,
        emoji: emoji.anchovy,
      },
      {
        name: "Spot",
        key: `${user.id}_spot`,
        price: 65,
        emoji: emoji.spot,
      },
      {
        name: "Rainbow Trout",
        key: `${user.id}_rainbowTrout`,
        price: 65,
        emoji: emoji.rainbowTrout,
      },
      {
        name: "Catfish",
        key: `${user.id}_catfish`,
        price: 65,
        emoji: emoji.catfish,
      },
      {
        name: "Pufferfish",
        key: `${user.id}_pufferfish`,
        price: 80,
        emoji: emoji.pufferfish,
      },
      {
        name: "Bass",
        key: `${user.id}_bass`,
        price: 80,
        emoji: emoji.bass,
      },
      {
        name: "Octopus",
        key: `${user.id}_octopus`,
        price: 100,
        emoji: emoji.octopus,
      },
    ];

    const petItems = [
      {
        name: "Cat Food",
        key: `${user.id}_catFoodUsesLeft`,
        price: 20, // As pet food has 5 uses but costs 100, the price here is 20.
        emoji: emoji.catFood,
      },
      {
        name: "Dog Food",
        key: `${user.id}_dogFoodUsesLeft`,
        price: 20,
        emoji: emoji.dogFood,
      },
      {
        name: "Duck Food",
        key: `${user.id}_duckFoodUsesLeft`,
        price: 20,
        emoji: emoji.duckFood,
      },
      {
        name: "Pet Shampoo",
        key: `${user.id}_petShampooUsesLeft`,
        price: 10, // As pet shampoo has 10 uses but costs 100, the price here is 10.
        emoji: emoji.petShampoo,
      },
    ];

    // Sort the inventory items by price.
    inventoryItems.sort((a, b) => b.price - a.price);
    armorItems.sort((a, b) => b.price - a.price);
    weaponItems.sort((a, b) => b.price - a.price);
    fishingItems.sort((a, b) => b.price - a.price);
    fish.sort((a, b) => b.price - a.price);
    petItems.sort((a, b) => b.price - a.price);

    let totalInventoryValue = 0; // The total coin value of the inventory.
    let totalWeaponValue = 0;
    let totalArmorValue = 0;
    let totalFishingValue = 0;
    let totalFishValue = 0;
    let totalMiscValue = 0;
    let totalPetItemValue = 0;

    // Loop through the weapon items and add them to the description.
    let weaponDescription = "";
    for (const item of weaponItems) {
      const value = await get(item.key);
      if (value && item.price && item.price > 0 && value > 0) {
        const itemValue = value * item.price;
        weaponDescription += `**${item.emoji} ${item.name}**: ${value} (${emoji.coins}${itemValue})\n`;
        totalInventoryValue += itemValue;
        totalWeaponValue += itemValue;
      } else if (value && value > 0) {
        weaponDescription += `**${item.emoji} ${item.name}**: ${value}\n`;
      }
    }

    // Loop through the armor items and add them to the description.
    let armorDescription = "";
    for (const item of armorItems) {
      const value = await get(item.key);
      if (value && item.price && item.price > 0 && value > 0) {
        const itemValue = value * item.price;
        armorDescription += `**${item.emoji} ${item.name}** (${emoji.coins}${itemValue})\n`;
        totalInventoryValue += itemValue;
        totalArmorValue += itemValue;
      } else if (value && value > 0) {
        armorDescription += `${item.name}: ${value}\n`;
      }
    }

    // Loop through the fishing items and add them to the description.
    let fishingDescription = "";
    for (const item of fishingItems) {
      const value = await get(item.key);
      if (value && item.price && item.price > 0 && value > 0) {
        const itemValue = value * item.price;
        // Add value to the description if the item is bait (can own multiple)
        if (item !== fishingItems[3]) {
          fishingDescription += `**${item.emoji} ${item.name}** (${emoji.coins}${itemValue})\n`;
        } else {
          fishingDescription += `**${item.emoji} ${item.name}**: ${value} (${emoji.coins}${itemValue})\n`;
        }
        totalInventoryValue += itemValue;
        totalFishingValue += itemValue;
      } else if (value && value > 0) {
        fishingDescription += `${item.name}: ${value}\n`;
      }
    }

    // Loop through the fish and add them to the description.
    let fishDescription = "";
    for (const item of fish) {
      const value = await get(item.key);
      if (value && item.price && item.price > 0 && value > 0) {
        const itemValue = value * item.price;
        fishDescription += `**${item.emoji} ${item.name}**: ${value} (${emoji.coins}${itemValue})\n`;
        totalInventoryValue += itemValue;
        totalFishValue += itemValue;
      } else if (value && value > 0) {
        fishDescription += `${item.name}: ${value}\n`;
      }
    }

    // Loop through the inventory items and add them to the description.
    let inventoryDescription = "";
    for (const item of inventoryItems) {
      const value = await get(item.key);
      if (value && item.price && item.price > 0 && value > 0) {
        const itemValue = value * item.price;
        inventoryDescription += `**${item.emoji} ${item.name}**: ${value} (${emoji.coins}${itemValue})\n`;
        totalInventoryValue += itemValue;
        totalMiscValue += itemValue;
      } else if (value && value > 0) {
        inventoryDescription += `**${item.emoji} ${item.name}**: ${value}\n`;
      }
    }

    let petDescription = "";
    for (const item of petItems) {
      const value = await get(item.key);
      if (value && item.price && item.price > 0 && value > 0) {
        const itemValue = value * item.price;
        petDescription += `**${item.emoji} ${item.name}**: ${value} (${emoji.coins}${itemValue})\n`;
        totalInventoryValue += itemValue;
        totalPetItemValue += itemValue;
      } else if (value && value > 0) {
        petDescription += `${item.name}: ${value}\n`;
      }
    }

    // Add the items to the embed, if there are any.
    inventoryDescription += armorDescription !== "" ? `\n**Armor** (${emoji.coins}${totalArmorValue ?? 0}):\n${armorDescription}` : "";
    inventoryDescription += weaponDescription !== "" ? `\n**Weapons** (${emoji.coins}${totalWeaponValue ?? 0}):\n${weaponDescription}` : "";
    inventoryDescription += fishingDescription !== "" ? `\n**Fishing** (${emoji.coins}${totalFishingValue ?? 0}):\n${fishingDescription}` : "";
    inventoryDescription += fishDescription !== "" ? `\n**Fish** (${emoji.coins}${totalFishValue ?? 0}):\n${fishDescription}` : "";
    inventoryDescription += petDescription !== "" ? `\n**Pet item uses left** (${emoji.coins}${totalPetItemValue ?? 0}):\n${petDescription}` : "";

    // If the inventory is empty, set the description to a default message.
    if (inventoryDescription === "") {
      inventoryDescription = "This user has an empty inventory.";
    }

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Inventory`)
      .setFields({
        name: "Total Inventory Value",
        value: `${emoji.coins}**${totalInventoryValue.toLocaleString()}**`,
        inline: true,
      })
      .setDescription(`**Items** (${emoji.coins}${totalMiscValue ?? 0}):\n${inventoryDescription}`)
      .setColor((await get(`${interaction.user.id}_color`)) ?? "#2b2d31")
      .setThumbnail(user.displayAvatarURL({ format: "jpg", size: 4096 }));

    async function setDefaultInventoryValues(id, key, value) {
      if ((await get(`${id}${key}`)) === null) {
        await set(`${id}${key}`, value);
      }
    }

    await interaction.reply({ embeds: [embed] });
  },
};
