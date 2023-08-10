const { SlashCommandBuilder } = require("discord.js");
const {
  set,
  get,
  incr,
  armorEmoji,
  attackUpEmoji,
  critUpEmoji,
  celestialArmorEmoji,
  sunforgedArmorEmoji,
  glacialArmorEmoji,
  abyssalArmorEmoji,
  verdantArmorEmoji,
  sylvanArmorEmoji,
  topazineArmorEmoji,
  bladeOfTheDeadEmoji,
  divineWrathEmoji,
  umbralEclipseEmoji,
  azurebladeEmoji,
  zephyrsBreezeEmoji,
  squiresHonorEmoji,
  crimsonDaggerEmoji,
} = require("../../globals.js");

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
          { name: "Crimson Dagger", value: "crimson" }
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
      item != "crimson"
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
      item != "topazine"
    ) {
      return interaction.reply({
        content: "You already have a sword equipped!",
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
        content: `You equipped ${celestialArmorEmoji} Celestial Armor.\n${armorEmoji}**+50**`,
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
        content: `You equipped ${sunforgedArmorEmoji} Sunforged Armor.\n${armorEmoji}**+35**`,
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
        content: `You equipped ${glacialArmorEmoji} Glacial Armor.\n${armorEmoji}**+25**`,
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
        content: `You equipped ${abyssalArmorEmoji} Abyssal Armor.\n${armorEmoji}**+20**`,
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
        content: `You equipped ${verdantArmorEmoji} Verdant Armor.\n${armorEmoji}**+15**`,
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
        content: `You equipped ${sylvanArmorEmoji} Sylvan Armor.\n${armorEmoji}**+10**`,
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
        content: `You equipped ${topazineArmorEmoji} Topazine Armor.\n${armorEmoji}**+5**`,
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
        content: `You equipped ${bladeOfTheDeadEmoji} Blade of the Dead.\n${attackUpEmoji}**+60**\n${critUpEmoji}**+60%**`,
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
        content: `You equipped ${divineWrathEmoji} Divine Wrath.\n${attackUpEmoji}**+40**\n${critUpEmoji}**+50%**`,
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
        content: `You equipped ${umbralEclipseEmoji} Umbral Eclipse.\n${attackUpEmoji}**+30**\n${critUpEmoji}**+40%**`,
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
        content: `You equipped ${azurebladeEmoji} Azureblade.\n${attackUpEmoji}**+20**\n${critUpEmoji}**+35%**`,
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
        content: `You equipped ${zephyrsBreezeEmoji} Zephyr's Breeze.\n${attackUpEmoji}**+15**\n${critUpEmoji}**+30%**`,
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
        content: `You equipped ${squiresHonorEmoji} Squire's Honor.\n${attackUpEmoji}**+10**\n${critUpEmoji}**+15%**`,
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
        content: `You equipped ${crimsonDaggerEmoji} Crimson Dagger.\n${attackUpEmoji}**+5**\n${critUpEmoji}**+10%**`,
        ephemeral: true,
      });

      await set(`${user.id}_crimsonEquipped`, 1);
      await set(`${user.id}_swordEquipped`, "crimson");
      await incr(`${user.id}`, "damage", 5);
      await incr(`${user.id}`, "critChance", 10);
    } else {
      return interaction.reply({
        content: "That's not a valid item!\nValid: celestial, sunforged, glacial, abyssal, verdant, sylvan, topazine, blade, divine, umbral, azureblade, zephyr, squire, crimson",
        ephemeral: true,
      });
    }
  },
};
