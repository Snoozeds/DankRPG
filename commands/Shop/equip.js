const { SlashCommandBuilder } = require("discord.js");
const { set, get, incr, emoji } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("equip")
    .setDescription("Equip an item.")
    .addStringOption((option) =>
      option
        .setName("item")
        .setDescription("The item to equip.")
        .setRequired(true)
        .addChoices(
          { name: "Celestial armor", value: "celestial" },
          { name: "Sunforged armor", value: "sunforged" },
          { name: "Glacial armor", value: "glacial" },
          { name: "Abyssal armor", value: "abyssal" },
          { name: "Verdant armor", value: "verdant" },
          { name: "Sylvan armor", value: "sylvan" },
          { name: "Topazine armor", value: "topazine" },
          { name: "Blade of the Dead", value: "blade" },
          { name: "Divine Wrath", value: "divine" },
          { name: "Umbral Eclipse", value: "umbral" },
          { name: "Azureblade", value: "azureblade" },
          { name: "Zephyr's breeze", value: "zephyr" },
          { name: "Squire's honor", value: "squire" },
          { name: "Crimson Dagger", value: "crimson" },
          { name: "Best fishing rod", value: "bestFishingRod" },
          { name: "Better fishing rod", value: "betterFishingRod" },
          { name: "Basic Fishing rod", value: "basicFishingRod" },
          { name: "Fishing bait", value: "fishingBait" }
        )
    ),
  async execute(interaction) {
    const user = interaction.user;
    const item = interaction.options.getString("item");

    if (
      (await get(`${user.id}_armorEquipped`)) !== "none" &&
      (await get(`${user.id}_armorEquipped`)) != undefined &&
      item != "blade" &&
      item != "divine" &&
      item != "umbral" &&
      item != "azureblade" &&
      item != "zephyr" &&
      item != "squire" &&
      item != "crimson" &&
      item != "basicFishingRod" &&
      item != "bestFishingRod" &&
      item != "betterFishingRod" &&
      item != "fishingRod" &&
      item != "fishingBait"
    ) {
      return interaction.reply({
        content: "You already have an armor equipped!",
        ephemeral: true,
      });
    }

    if (
      (await get(`${user.id}_swordEquipped`)) !== "none" &&
      (await get(`${user.id}_swordEquipped`)) != undefined &&
      item != "celestial" &&
      item != "sunforged" &&
      item != "glacial" &&
      item != "abyssal" &&
      item != "verdant" &&
      item != "sylvan" &&
      item != "topazine" &&
      item != "basicFishingRod" &&
      item != "bestFishingRod" &&
      item != "betterFishingRod" &&
      item != "fishingRod" &&
      item != "fishingBait"
    ) {
      return interaction.reply({
        content: "You already have a sword equipped!",
        ephemeral: true,
      });
    }

    if (
      (await get(`${user.id}_fishingRodEquipped`)) !== "none" &&
      (await get(`${user.id}_fishingRodEquipped`)) != undefined &&
      item != "fishingBait" &&
      item != "blade" &&
      item != "divine" &&
      item != "umbral" &&
      item != "azureblade" &&
      item != "zephyr" &&
      item != "squire" &&
      item != "crimson" &&
      item != "celestial" &&
      item != "sunforged" &&
      item != "glacial" &&
      item != "abyssal" &&
      item != "verdant" &&
      item != "sylvan" &&
      item != "topazine"
    ) {
      return interaction.reply({
        content: "You already have a fishing rod equipped!",
        ephemeral: true,
      });
    }

    if (item === "celestial") {
      if ((await get(`${user.id}_celestialArmor`)) != 1) {
        return interaction.reply({
          content: "You don't have this item!",
          ephemeral: true,
        });
      }

      await interaction.reply({
        content: `You equipped ${emoji.celestialArmor} Celestial Armor.\n${emoji.armor}**+50**`,
        ephemeral: true,
      });

      await set(`${user.id}_celestialEquipped`, 1);
      await set(`${user.id}_armorEquipped`, "celestial");
      await incr(`${user.id}`, "armor", 50);
    } else if (item === "sunforged") {
      if ((await get(`${user.id}_sunforgedArmor`)) != 1) {
        return interaction.reply({
          content: "You don't have this item!",
          ephemeral: true,
        });
      }

      await interaction.reply({
        content: `You equipped ${emoji.sunforgedArmor} Sunforged Armor.\n${emoji.armor}**+35**`,
        ephemeral: true,
      });

      await set(`${user.id}_sunforgedEquipped`, 1);
      await set(`${user.id}_armorEquipped`, "sunforged");
      await incr(`${user.id}`, "armor", 35);
    } else if (item === "glacial") {
      if ((await get(`${user.id}_glacialArmor`)) != 1) {
        return interaction.reply({
          content: "You don't have this item!",
          ephemeral: true,
        });
      }

      await interaction.reply({
        content: `You equipped ${emoji.glacialArmor} Glacial Armor.\n${emoji.armor}**+25**`,
        ephemeral: true,
      });

      await set(`${user.id}_glacialEquipped`, 1);
      await set(`${user.id}_armorEquipped`, "glacial");
      await incr(`${user.id}`, "armor", 25);
    } else if (item === "abyssal") {
      if ((await get(`${user.id}_abyssalArmor`)) != 1) {
        return interaction.reply({
          content: "You don't have this item!",
          ephemeral: true,
        });
      }

      await interaction.reply({
        content: `You equipped ${emoji.abyssalArmor} Abyssal Armor.\n${emoji.armor}**+20**`,
        ephemeral: true,
      });

      await set(`${user.id}_abyssalEquipped`, 1);
      await set(`${user.id}_armorEquipped`, "abyssal");
      await incr(`${user.id}`, "armor", 20);
    } else if (item === "verdant") {
      if ((await get(`${user.id}_verdantArmor`)) != 1) {
        return interaction.reply({
          content: "You don't have this item!",
          ephemeral: true,
        });
      }

      await interaction.reply({
        content: `You equipped ${emoji.verdantArmor} Verdant Armor.\n${emoji.armor}**+15**`,
        ephemeral: true,
      });

      await set(`${user.id}_verdantEquipped`, 1);
      await set(`${user.id}_armorEquipped`, "verdant");
      await incr(`${user.id}`, "armor", 15);
    } else if (item === "sylvan") {
      if ((await get(`${user.id}_sylvanArmor`)) != 1) {
        return interaction.reply({
          content: "You don't have this item!",
          ephemeral: true,
        });
      }

      await interaction.reply({
        content: `You equipped ${emoji.sylvanArmor} Sylvan Armor.\n${emoji.armor}**+10**`,
        ephemeral: true,
      });

      await set(`${user.id}_sylvanEquipped`, 1);
      await set(`${user.id}_armorEquipped`, "sylvan");
      await incr(`${user.id}`, "armor", 10);
    } else if (item === "topazine") {
      if ((await get(`${user.id}_topazineArmor`)) != 1) {
        return interaction.reply({
          content: "You don't have this item!",
          ephemeral: true,
        });
      }

      await interaction.reply({
        content: `You equipped ${emoji.topazineArmor} Topazine Armor.\n${emoji.armor}**+5**`,
        ephemeral: true,
      });

      await set(`${user.id}_topazineEquipped`, 1);
      await set(`${user.id}_armorEquipped`, "topazine");
      await incr(`${user.id}`, "armor", 5);
    } else if (item === "blade") {
      if ((await get(`${user.id}_bladeOfTheDead`)) != 1) {
        return interaction.reply({
          content: "You don't have this item!",
          ephemeral: true,
        });
      }
      if ((await get(`${user.id}_botdEquipped`)) === 1) {
        return interaction.reply({
          content: "You already have this item equipped!",
          ephemeral: true,
        });
      }

      await interaction.reply({
        content: `You equipped ${emoji.bladeOfTheDead} Blade of the Dead.\n${emoji.attackUp}**+60**\n${emoji.critUp}**+60%**`,
        ephemeral: true,
      });

      await set(`${user.id}_botdEquipped`, 1);
      await set(`${user.id}_swordEquipped`, "blade");
      await incr(`${user.id}`, "damage", 60);
      await incr(`${user.id}`, "critChance", 60);
    } else if (item === "divine") {
      if ((await get(`${user.id}_divineWrath`)) != 1) {
        return interaction.reply({
          content: "You don't have this item!",
          ephemeral: true,
        });
      }
      if ((await get(`${user.id}_divineEquipped`)) === 1) {
        return interaction.reply({
          content: "You already have this item equipped!",
          ephemeral: true,
        });
      }

      await interaction.reply({
        content: `You equipped ${emoji.divineWrath} Divine Wrath.\n${emoji.attackUp}**+40**\n${emoji.critUp}**+50%**`,
        ephemeral: true,
      });

      await set(`${user.id}_divineEquipped`, 1);
      await set(`${user.id}_swordEquipped`, "divine");
      await incr(`${user.id}`, "damage", 40);
      await incr(`${user.id}`, "critChance", 50);
    } else if (item === "umbral") {
      if ((await get(`${user.id}_umbralEclipse`)) != 1) {
        return interaction.reply({
          content: "You don't have this item!",
          ephemeral: true,
        });
      }
      if ((await get(`${user.id}_umbralEquipped`)) === 1) {
        return interaction.reply({
          content: "You already have this item equipped!",
          ephemeral: true,
        });
      }

      await interaction.reply({
        content: `You equipped ${emoji.umbralEclipse} Umbral Eclipse.\n${emoji.attackUp}**+30**\n${emoji.critUp}**+40%**`,
        ephemeral: true,
      });

      await set(`${user.id}_umbralEquipped`, 1);
      await set(`${user.id}_swordEquipped`, "umbral");
      await incr(`${user.id}`, "damage", 30);
      await incr(`${user.id}`, "critChance", 40);
    } else if (item === "azureblade") {
      if ((await get(`${user.id}_azureblade`)) != 1) {
        return interaction.reply({
          content: "You don't have this item!",
          ephemeral: true,
        });
      }
      if ((await get(`${user.id}_azurebladeEquipped`)) === 1) {
        return interaction.reply({
          content: "You already have this item equipped!",
          ephemeral: true,
        });
      }

      await interaction.reply({
        content: `You equipped ${emoji.azureBlade} Azureblade.\n${emoji.attackUp}**+20**\n${emoji.critUp}**+35%**`,
        ephemeral: true,
      });

      await set(`${user.id}_azurebladeEquipped`, 1);
      await set(`${user.id}_swordEquipped`, "azureblade");
      await incr(`${user.id}`, "damage", 20);
      await incr(`${user.id}`, "critChance", 35);
    } else if (item === "zephyr") {
      if ((await get(`${user.id}_zephyrsBreeze`)) != 1) {
        return interaction.reply({
          content: "You don't have this item!",
          ephemeral: true,
        });
      }
      if ((await get(`${user.id}_zephyrEquipped`)) === 1) {
        return interaction.reply({
          content: "You already have this item equipped!",
          ephemeral: true,
        });
      }

      await interaction.reply({
        content: `You equipped ${emoji.zephyrsBreeze} Zephyr's Breeze.\n${emoji.attackUp}**+15**\n${emoji.critUp}**+30%**`,
        ephemeral: true,
      });

      await set(`${user.id}_zephyrEquipped`, 1);
      await set(`${user.id}_swordEquipped`, "zephyr");
      await incr(`${user.id}`, "damage", 15);
      await incr(`${user.id}`, "critChance", 30);
    } else if (item === "squire") {
      if ((await get(`${user.id}_squiresHonor`)) != 1) {
        return interaction.reply({
          content: "You don't have this item!",
          ephemeral: true,
        });
      }
      if ((await get(`${user.id}_squireEquipped`)) === 1) {
        return interaction.reply({
          content: "You already have this item equipped!",
          ephemeral: true,
        });
      }

      await interaction.reply({
        content: `You equipped ${emoji.squiresHonor} Squire's Honor.\n${emoji.attackUp}**+10**\n${emoji.critUp}**+15%**`,
        ephemeral: true,
      });

      await set(`${user.id}_squireEquipped`, 1);
      await set(`${user.id}_swordEquipped`, "squire");
      await incr(`${user.id}`, "damage", 10);
      await incr(`${user.id}`, "critChance", 15);
    } else if (item === "crimson") {
      if ((await get(`${user.id}_crimsonDagger`)) != 1) {
        return interaction.reply({
          content: "You don't have this item!",
          ephemeral: true,
        });
      }
      if ((await get(`${user.id}_crimsonEquipped`)) === 1) {
        return interaction.reply({
          content: "You already have this item equipped!",
          ephemeral: true,
        });
      }

      await interaction.reply({
        content: `You equipped ${emoji.crimsonDagger} Crimson Dagger.\n${emoji.attackUp}**+5**\n${emoji.critUp}**+10%**`,
        ephemeral: true,
      });

      await set(`${user.id}_crimsonEquipped`, 1);
      await set(`${user.id}_swordEquipped`, "crimson");
      await incr(`${user.id}`, "damage", 5);
      await incr(`${user.id}`, "critChance", 10);
    } else if (item === "bestFishingRod") {
      if ((await get(`${user.id}_bestFishingRod`)) != 1) {
        return interaction.reply({
          content: "You don't have this item!",
          ephemeral: true,
        });
      }

      if ((await get(`${user.id}_bestFishingRodEquipped`)) === 1) {
        return interaction.reply({
          content: "You already have this item equipped!",
          ephemeral: true,
        });
      }

      await interaction.reply({
        content: `You equipped ${emoji.bestFishingRod} Best Fishing Rod.`,
        ephemeral: true,
      });

      await set(`${user.id}_bestFishingRodEquipped`, 1);
      await set(`${user.id}_fishingRodEquipped`, "bestFishingRod");
    } else if (item === "betterFishingRod") {
      if ((await get(`${user.id}_betterFishingRod`)) != 1) {
        return interaction.reply({
          content: "You don't have this item!",
          ephemeral: true,
        });
      }

      if ((await get(`${user.id}_betterFishingRodEquipped`)) === 1) {
        return interaction.reply({
          content: "You already have this item equipped!",
          ephemeral: true,
        });
      }

      await interaction.reply({
        content: `You equipped ${emoji.betterFishingRod} Better Fishing Rod.`,
        ephemeral: true,
      });

      await set(`${user.id}_betterFishingRodEquipped`, 1);
      await set(`${user.id}_fishingRodEquipped`, "betterFishingRod");
    } else if (item === "basicFishingRod") {
      if ((await get(`${user.id}_basicFishingRod`)) != 1) {
        return interaction.reply({
          content: "You don't have this item!",
          ephemeral: true,
        });
      }

      if ((await get(`${user.id}_basicFishingRodEquipped`)) === 1) {
        return interaction.reply({
          content: "You already have this item equipped!",
          ephemeral: true,
        });
      }

      await interaction.reply({
        content: `You equipped ${emoji.basicFishingRod} Basic Fishing Rod.`,
        ephemeral: true,
      });

      await set(`${user.id}_basicFishingRodEquipped`, 1);
      await set(`${user.id}_fishingRodEquipped`, "basicFishingRod");
    } else if (item === "fishingBait") {
      if ((await get(`${user.id}_fishingBait`)) == 0) {
        return interaction.reply({
          content: "You don't have this item!",
          ephemeral: true,
        });
      }

      if ((await get(`${user.id}_fishingBaitEquipped`)) == 1) {
        return interaction.reply({
          content: "You already have this item equipped!",
          ephemeral: true,
        });
      }

      await interaction.reply({
        content: `You equipped ${emoji.fishingBait} Fishing Bait. It will now automatically be used when you fish.`,
        ephemeral: true,
      });

      await set(`${user.id}_fishingBaitEquipped`, 1);
    }
  },
};
