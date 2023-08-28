const { SlashCommandBuilder } = require("discord.js");
const { set, get, decr, emoji } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unequip")
    .setDescription("Unequip an item.")
    .addStringOption((option) =>
      option
        .setName("item")
        .setDescription("The item to equip.")
        .setRequired(true)
        .addChoices(
          { name: "Celestial Armor", value: "celestial" },
          { name: "Sunforged Armor", value: "sunforged" },
          { name: "Glacial Armor", value: "glacial" },
          { name: "Abyssal Armor", value: "abyssal" },
          { name: "Verdant Armor", value: "verdant" },
          { name: "Sylvan Armor", value: "sylvan" },
          { name: "Topazine Armor", value: "topazine" },
          { name: "Blade of the Dead", value: "blade" },
          { name: "Divine Wrath", value: "divine" },
          { name: "Umbral Eclipse", value: "umbral" },
          { name: "Azureblade", value: "azureblade" },
          { name: "Zephyr's breeze", value: "zephyr" },
          { name: "Squire's honor", value: "squire" },
          { name: "Crimson Dagger", value: "crimson" },
          { name: "Basic Fishing Rod", value: "basicFishingRod" },
          { name: "Better Fishing Rod", value: "betterFishingRod" },
          { name: "Best Fishing Rod", value: "bestFishingRod" },
          { name: "Fishing Bait", value: "fishingBait" }
        )
    ),
  async execute(interaction) {
    const user = interaction.user;
    const item = interaction.options.getString("item");

    async function userOwnsItem(item) {
      const owned = await get(`${user.id}_${item}`);
      if (owned === "1") {
        return true;
      }
      return false;
    }

    async function userHasEquippedItem(item) {
      const equipped = await get(`${user.id}_${item}Equipped`);
      if (equipped === 1) {
        return true;
      }
      return false;
    }

    // Armor
    if (item === "celestial") {
      if (!userOwnsItem("celestialArmor")) {
        return await interaction.reply({
          content: `You don't own this item.`,
          ephemeral: true,
        });
      }
      if (!userHasEquippedItem("celestial")) {
        return await interaction.reply({
          content: `You don't have this item equipped.`,
          ephemeral: true,
        });
      }
      await set(`${user.id}_celestialEquipped`, 0);
      await set(`${user.id}_armorEquipped`, "none");
      await decr(`${user.id}`, "armor", 50);
      return await interaction.reply({
        content: `Unequipped ${emoji.celestialArmor} Celestial Armor.\n-${emoji.armor} 50.`,
        ephemeral: true,
      });
    }
    if (item === "sunforged") {
      if (!userOwnsItem("sunforgedArmor")) {
        return await interaction.reply({
          content: `You don't own this item.`,
          ephemeral: true,
        });
      }
      if (!userHasEquippedItem("sunforged")) {
        return await interaction.reply({
          content: `You don't have this item equipped.`,
          ephemeral: true,
        });
      }
      await set(`${user.id}_sunforgedEquipped`, 0);
      await set(`${user.id}_armorEquipped`, "none");
      await decr(`${user.id}`, "armor", 35);
      return await interaction.reply({
        content: `Unequipped ${emoji.sunforgedArmor} Sunforged Armor.\n-${emoji.armor} 35.`,
        ephemeral: true,
      });
    }
    if (item === "glacial") {
      if (!userOwnsItem("glacialArmor")) {
        return await interaction.reply({
          content: `You don't own this item.`,
          ephemeral: true,
        });
      }
      if (!userHasEquippedItem("glacial")) {
        return await interaction.reply({
          content: `You don't have this item equipped.`,
          ephemeral: true,
        });
      }
      await set(`${user.id}_glacialEquipped`, 0);
      await set(`${user.id}_armorEquipped`, "none");
      await decr(`${user.id}`, "armor", 25);
      return await interaction.reply({
        content: `Unequipped ${emoji.glacialArmor} Glacial Armor.\n-${emoji.armor} 25.`,
        ephemeral: true,
      });
    }
    if (item === "abyssal") {
      if (!userOwnsItem("abyssalArmor")) {
        return await interaction.reply({
          content: `You don't own this item.`,
          ephemeral: true,
        });
      }
      if (!userHasEquippedItem("abyssal")) {
        return await interaction.reply({
          content: `You don't have this item equipped.`,
          ephemeral: true,
        });
      }
      await set(`${user.id}_abyssalEquipped`, 0);
      await set(`${user.id}_armorEquipped`, "none");
      await decr(`${user.id}`, "armor", 20);
      return await interaction.reply({
        content: `Unequipped ${emoji.abyssalArmor} Abyssal Armor.\n-${emoji.armor} 20.`,
        ephemeral: true,
      });
    }
    if (item === "verdant") {
      if (!userOwnsItem("verdantArmor")) {
        return await interaction.reply({
          content: `You don't own this item.`,
          ephemeral: true,
        });
      }
      if (!userHasEquippedItem("verdant")) {
        return await interaction.reply({
          content: `You don't have this item equipped.`,
          ephemeral: true,
        });
      }
      await set(`${user.id}_verdantEquipped`, 0);
      await set(`${user.id}_armorEquipped`, "none");
      await decr(`${user.id}`, "armor", 15);
      return await interaction.reply({
        content: `Unequipped ${emoji.verdantArmor} Verdant Armor.\n-${emoji.armor} 15.`,
        ephemeral: true,
      });
    }
    if (item === "sylvan") {
      if (!userOwnsItem("sylvanArmor")) {
        return await interaction.reply({
          content: `You don't own this item.`,
          ephemeral: true,
        });
      }
      if (!userHasEquippedItem("sylvan")) {
        return await interaction.reply({
          content: `You don't have this item equipped.`,
          ephemeral: true,
        });
      }
      await set(`${user.id}_sylvanEquipped`, 0);
      await set(`${user.id}_armorEquipped`, "none");
      await decr(`${user.id}`, "armor", 10);
      return await interaction.reply({
        content: `Unequipped ${emoji.sylvanArmor} Sylvan Armor.\n-${emoji.armor} 10.`,
        ephemeral: true,
      });
    }
    if (item === "topazine") {
      if (!userOwnsItem("topazineArmor")) {
        return await interaction.reply({
          content: `You don't own this item.`,
          ephemeral: true,
        });
      }
      if (!userHasEquippedItem("topazine")) {
        return await interaction.reply({
          content: `You don't have this item equipped.`,
          ephemeral: true,
        });
      }
      await set(`${user.id}_topazineEquipped`, 0);
      await set(`${user.id}_armorEquipped`, "none");
      await decr(`${user.id}`, "armor", 5);
      return await interaction.reply({
        content: `Unequipped ${emoji.topazineArmor} Topazine Armor.\n-${emoji.armor} 5.`,
        ephemeral: true,
      });
    }

    // Swords
    if (item === "blade") {
      if (!userOwnsItem("bladeOfTheDead")) {
        return await interaction.reply({
          content: `You don't own this item.`,
          ephemeral: true,
        });
      }
      if (!userHasEquippedItem("botd")) {
        return await interaction.reply({
          content: `You don't have this item equipped.`,
          ephemeral: true,
        });
      }
      await set(`${user.id}_botdEquipped`, 0);
      await set(`${user.id}_swordEquipped`, "none");
      await decr(`${user.id}`, "attack", 60);
      await decr(`${user.id}`, "critChance", 60);
      return await interaction.reply({
        content: `Unequipped ${emoji.bladeOfTheDead} Blade of the Dead.\n-${emoji.attack} 60.\n-${emoji.crit} 60.`,
        ephemeral: true,
      });
    }
    if (item === "divine") {
      if (!userOwnsItem("divineWrath")) {
        return await interaction.reply({
          content: `You don't own this item.`,
          ephemeral: true,
        });
      }
      if (!userHasEquippedItem("divine")) {
        return await interaction.reply({
          content: `You don't have this item equipped.`,
          ephemeral: true,
        });
      }
      await set(`${user.id}_divineEquipped`, 0);
      await set(`${user.id}_swordEquipped`, "none");
      await decr(`${user.id}`, "attack", 40);
      await decr(`${user.id}`, "critChance", 50);
      return await interaction.reply({
        content: `Unequipped ${emoji.divineWrath} Divine Wrath.\n-${emoji.attack} 40.\n-${emoji.crit} 50.`,
        ephemeral: true,
      });
    }
    if (item === "umbral") {
      if (!userOwnsItem("umbralEclipse")) {
        return await interaction.reply({
          content: `You don't own this item.`,
          ephemeral: true,
        });
      }
      if (!userHasEquippedItem("umbral")) {
        return await interaction.reply({
          content: `You don't have this item equipped.`,
          ephemeral: true,
        });
      }
      await set(`${user.id}_umbralEquipped`, 0);
      await set(`${user.id}_swordEquipped`, "none");
      await decr(`${user.id}`, "attack", 30);
      await decr(`${user.id}`, "critChance", 40);
      return await interaction.reply({
        content: `Unequipped ${emoji.umbralEclipse} Umbral Eclipse.\n-${emoji.attack} 30.\n-${emoji.crit} 40.`,
        ephemeral: true,
      });
    }
    if (item === "azureblade") {
      if (!userOwnsItem("azureblade")) {
        return await interaction.reply({
          content: `You don't own this item.`,
          ephemeral: true,
        });
      }
      if (!userHasEquippedItem("azureblade")) {
        return await interaction.reply({
          content: `You don't have this item equipped.`,
          ephemeral: true,
        });
      }
      await set(`${user.id}_azurebladeEquipped`, 0);
      await set(`${user.id}_swordEquipped`, "none");
      await decr(`${user.id}`, "attack", 20);
      await decr(`${user.id}`, "critChance", 35);
      return await interaction.reply({
        content: `Unequipped ${emoji.azureBlade} Azureblade.\n-${emoji.attack} 20.\n-${emoji.crit} 35.`,
        ephemeral: true,
      });
    }
    if (item === "zephyr") {
      if (!userOwnsItem("zephyrsBreeze")) {
        return await interaction.reply({
          content: `You don't own this item.`,
          ephemeral: true,
        });
      }
      if (!userHasEquippedItem("zephyr")) {
        return await interaction.reply({
          content: `You don't have this item equipped.`,
          ephemeral: true,
        });
      }
      await set(`${user.id}_zephyrEquipped`, 0);
      await set(`${user.id}_swordEquipped`, "none");
      await decr(`${user.id}`, "attack", 15);
      await decr(`${user.id}`, "critChance", 30);

      return await interaction.reply({
        content: `Unequipped ${emoji.zephyrsBreeze} Zephyr's Breeze.\n-${emoji.attack} 15.\n-${emoji.crit} 30.`,
        ephemeral: true,
      });
    }
    if (item === "squire") {
      if (!userOwnsItem("squiresHonor")) {
        return await interaction.reply({
          content: `You don't own this item.`,
          ephemeral: true,
        });
      }
      if (!userHasEquippedItem("squire")) {
        return await interaction.reply({
          content: `You don't have this item equipped.`,
          ephemeral: true,
        });
      }
      await set(`${user.id}_squireEquipped`, 0);
      await set(`${user.id}_swordEquipped`, "none");
      await decr(`${user.id}`, "attack", 10);
      await decr(`${user.id}`, "critChance", 15);
      return await interaction.reply({
        content: `Unequipped ${emoji.squiresHonor} Squire's Honor.\n-${emoji.attack} 10.\n-${emoji.crit} 15.`,
        ephemeral: true,
      });
    }
    if (item === "crimson") {
      if (!userOwnsItem("crimsonDagger")) {
        return await interaction.reply({
          content: `You don't own this item.`,
          ephemeral: true,
        });
      }
      if (!userHasEquippedItem("crimson")) {
        return await interaction.reply({
          content: `You don't have this item equipped.`,
          ephemeral: true,
        });
      }
      await set(`${user.id}_crimsonEquipped`, 0);
      await set(`${user.id}_swordEquipped`, "none");
      await decr(`${user.id}`, "attack", 5);
      await decr(`${user.id}`, "critChance", 10);
      return await interaction.reply({
        content: `Unequipped ${emoji.crimsonDagger} Crimson Dagger.\n-${emoji.attack} 5.\n-${emoji.crit} 10.`,
        ephemeral: true,
      });
    }
    if (item === "basicFishingRod") {
      if (!userOwnsItem("basicFishingRod")) {
        return await interaction.reply({
          content: `You don't own this item.`,
          ephemeral: true,
        });
      }
      if (!userHasEquippedItem("basicFishingRod")) {
        return await interaction.reply({
          content: `You don't have this item equipped.`,
          ephemeral: true,
        });
      }
      await set(`${user.id}_basicFishingRodEquipped`, 0);
      await set(`${user.id}_fishingRodEquipped`, "none");
      return await interaction.reply({
        content: `Unequipped ${emoji.basicFishingRod} Basic Fishing Rod.`,
        ephemeral: true,
      });
    }
    if (item === "betterFishingRod") {
      if (!userOwnsItem("betterFishingRod")) {
        return await interaction.reply({
          content: `You don't own this item.`,
          ephemeral: true,
        });
      }
      if (!userHasEquippedItem("betterFishingRod")) {
        return await interaction.reply({
          content: `You don't have this item equipped.`,
          ephemeral: true,
        });
      }
      await set(`${user.id}_betterFishingRodEquipped`, 0);
      await set(`${user.id}_fishingRodEquipped`, "none");
      return await interaction.reply({
        content: `Unequipped ${emoji.betterFishingRod} Better Fishing Rod.`,
        ephemeral: true,
      });
    }
    if (item === "bestFishingRod") {
      if (!userOwnsItem("bestFishingRod")) {
        return await interaction.reply({
          content: `You don't own this item.`,
          ephemeral: true,
        });
      }
      if (!userHasEquippedItem("bestFishingRod")) {
        return await interaction.reply({
          content: `You don't have this item equipped.`,
          ephemeral: true,
        });
      }
      await set(`${user.id}_bestFishingRodEquipped`, 0);
      await set(`${user.id}_fishingRodEquipped`, "none");
      return await interaction.reply({
        content: `Unequipped ${emoji.bestFishingRod} Best Fishing Rod.`,
        ephemeral: true,
      });
    }
    if (item === "fishingBait") {
      if (!userOwnsItem("fishingBait")) {
        return await interaction.reply({
          content: `You don't own this item.`,
          ephemeral: true,
        });
      }
      await set(`${user.id}_fishingBaitEquipped`, 0);
      return await interaction.reply({
        content: `Unequipped ${emoji.fishingBait} Fishing Bait. It will now no longer be used when fishing.`,
        ephemeral: true,
      });
    }
  },
};
