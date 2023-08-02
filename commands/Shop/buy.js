const { SlashCommandBuilder } = require("discord.js");
const { set, get, incr, decr, coinEmoji } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("buy")
    .setDescription("Buy an item from the shop.")
    .addStringOption((option) => option.setName("item").setDescription("The item you want to buy.").setRequired(true)),
  async execute(interaction) {
    const item = interaction.options.getString("item").toLowerCase();
    const user = interaction.user;
    const coins = await get(`${user.id}_coins`);

    // Misc items
    if (item == "lifesaver") {
      if (coins < 500 || coins == undefined) {
        return interaction.reply({
          content: "You don't have enough coins for this item!",
          ephemeral: true,
        });
      }
      if ((await get(`${user.id}_lifesaver`)) >= 1) {
        return interaction.reply({
          content: "You can only have 1 lifesaver.",
          ephemeral: true,
        });
      }
      if ((await get(`${user.id}_lifesaver`)) === null) {
        await set(`${user.id}_lifesaver`, 1);
      } else {
        await incr(`${user.id}`, "lifesaver", 1);
      }
      await decr(`${user.id}`, "coins", 500);
      return interaction.reply({
        content: `You bought a lifesaver for ${coinEmoji}500.`,
        ephemeral: true,
      });
    }

    // Armor
    if (item === "stone ring" || item === "stonering") {
      if (coins < 2000 || coins == undefined) {
        return interaction.reply({
          content: `You don't have enough coins for this item! You need ${coinEmoji} 2000.`,
          ephemeral: true,
        });
      }
      if ((await get(`${user.id}_stoneRing`)) >= 1) {
        return interaction.reply({
          content: "You can only have 1 stone ring.",
          ephemeral: true,
        });
      }
      await incr(`${user.id}`, "armor", 1);
      await decr(`${user.id}`, "coins", 2000);
      await set(`${user.id}_stoneRing`, 1);
      return interaction.reply({
        content: `You bought a stone ring for ${coinEmoji}2000.`,
        ephemeral: true,
      });
    }

    if (item === "celestial armor" || item === "celestialarmor" || item === "celestial") {
      if (coins < 30000 || coins == undefined) {
        return interaction.reply({
          content: `You don't have enough coins for this item! You need ${coinEmoji} 30000.`,
          ephemeral: true,
        });
      }

      if ((await get(`${user.id}_celestialArmor`)) >= 1) {
        return interaction.reply({
          content: "You can only have 1 celestial armor.",
          ephemeral: true,
        });
      }
      await decr(`${user.id}`, "coins", 30000);
      await set(`${user.id}_celestialArmor`, 1);
      return interaction.reply({
        content: `You bought a celestial armor for ${coinEmoji} 30000.`,
        ephemeral: true,
      });
    }

    if (item === "sunforged armor" || item === "sunforgedarmor" || item === "sunforged") {
      if (coins < 22500 || coins == undefined) {
        return interaction.reply({
          content: `You don't have enough coins for this item! You need ${coinEmoji} 22500.`,
          ephemeral: true,
        });
      }

      if ((await get(`${user.id}_sunforgedArmor`)) >= 1) {
        return interaction.reply({
          content: "You can only have 1 sunforged armor.",
          ephemeral: true,
        });
      }
      await decr(`${user.id}`, "coins", 22500);
      await set(`${user.id}_sunforgedArmor`, 1);
      return interaction.reply({
        content: `You bought a sunforged armor for ${coinEmoji}22500.`,
        ephemeral: true,
      });
    }

    if (item === "glacial armor" || item === "glacialarmor" || item === "glacial") {
      if (coins < 17500 || coins == undefined) {
        return interaction.reply({
          content: `You don't have enough coins for this item! You need ${coinEmoji} 17500.`,
          ephemeral: true,
        });
      }

      if ((await get(`${user.id}_glacialArmor`)) >= 1) {
        return interaction.reply({
          content: "You can only have 1 glacial armor.",
          ephemeral: true,
        });
      }
      await decr(`${user.id}`, "coins", 17500);
      await set(`${user.id}_glacialArmor`, 1);
      return interaction.reply({
        content: `You bought a glacial armor for ${coinEmoji}17500.`,
        ephemeral: true,
      });
    }

    if (item === "abyssal armor" || item === "abyssalarmor" || item === "abyssal") {
      if (coins < 13500 || coins == undefined) {
        return interaction.reply({
          content: `You don't have enough coins for this item! You need ${coinEmoji} 13500.`,
          ephemeral: true,
        });
      }

      if ((await get(`${user.id}_abyssalArmor`)) >= 1) {
        return interaction.reply({
          content: "You can only have 1 abyssal armor.",
          ephemeral: true,
        });
      }

      await decr(`${user.id}`, "coins", 13500);
      await set(`${user.id}_abyssalArmor`, 1);
      return interaction.reply({
        content: `You bought a abyssal armor for ${coinEmoji}13500.`,
        ephemeral: true,
      });
    }

    if (item === "verdant armor" || item === "verdantarmor" || item === "verdant") {
      if (coins < 10500 || coins == undefined) {
        return interaction.reply({
          content: `You don't have enough coins for this item! You need ${coinEmoji} 10500.`,
          ephemeral: true,
        });
      }

      if ((await get(`${user.id}_verdantArmor`)) >= 1) {
        return interaction.reply({
          content: "You can only have 1 verdant armor.",
          ephemeral: true,
        });
      }

      await decr(`${user.id}`, "coins", 10500);
      await set(`${user.id}_verdantArmor`, 1);
      return interaction.reply({
        content: `You bought a verdant armor for ${coinEmoji}10500.`,
        ephemeral: true,
      });
    }

    if (item === "sylvan armor" || item === "sylvanarmor" || item === "sylvan") {
      if (coins < 7500 || coins == undefined) {
        return interaction.reply({
          content: `You don't have enough coins for this item! You need ${coinEmoji} 7500.`,
          ephemeral: true,
        });
      }

      if ((await get(`${user.id}_sylvanArmor`)) >= 1) {
        return interaction.reply({
          content: "You can only have 1 sylvan armor.",
          ephemeral: true,
        });
      }

      await decr(`${user.id}`, "coins", 7500);
      await set(`${user.id}_sylvanArmor`, 1);
      return interaction.reply({
        content: `You bought a sylvan armor for ${coinEmoji}7500.`,
        ephemeral: true,
      });
    }

    if (item === "topazine armor" || item === "topazinearmor" || item === "topazine") {
      if (coins < 4500 || coins == undefined) {
        return interaction.reply({
          content: `You don't have enough coins for this item! You need ${coinEmoji} 4500.`,
          ephemeral: true,
        });
      }

      if ((await get(`${user.id}_topazineArmor`)) >= 1) {
        return interaction.reply({
          content: "You can only have 1 topazine armor.",
          ephemeral: true,
        });
      }

      await decr(`${user.id}`, "coins", 4500);
      await set(`${user.id}_topazineArmor`, 1);
      return interaction.reply({
        content: `You bought a topazine armor for ${coinEmoji}4500.`,
        ephemeral: true,
      });
    }

    // Weapons

    if (item === "crimson dagger" || item === "crimsondagger" || item === "crimson" || item === "cd") {
      if (coins < 5000 || coins == undefined) {
        return interaction.reply({
          content: `You don't have enough coins for this item! You need ${coinEmoji} 5000.`,
          ephemeral: true,
        });
      }

      if ((await get(`${user.id}_crimsonDagger`)) >= 1) {
        return interaction.reply({
          content: "You can only have 1 crimson dagger.",
          ephemeral: true,
        });
      }

      await decr(`${user.id}`, "coins", 5000);
      await set(`${user.id}_crimsonDagger`, 1);
      return interaction.reply({
        content: `You bought a crimson dagger for ${coinEmoji}5000. Make sure to equip it with /equip.`,
        ephemeral: true,
      });
    }

    if (item === "squire's honor" || item === "squires honor" || item === "squire'shonor" || item === "squireshonor" || item === "squires" || item === "sh") {
      if (coins < 7500 || coins == undefined) {
        return interaction.reply({
          content: `You don't have enough coins for this item! You need ${coinEmoji} 7500.`,
          ephemeral: true,
        });
      }

      if ((await get(`${user.id}_squiresHonor`)) >= 1) {
        return interaction.reply({
          content: "You can only have 1 squire's honor.",
          ephemeral: true,
        });
      }

      await decr(`${user.id}`, "coins", 7500);
      await set(`${user.id}_squiresHonor`, 1);
      return interaction.reply({
        content: `You bought a squire's honor for ${coinEmoji}7500. Make sure to equip it with /equip.`,
        ephemeral: true,
      });
    }

    if (item === "zephyr's breeze" || item === "zephyrs breeze" || item === "zephyr'sbreeze" || item === "zephyrsbreeze" || item === "zephyrs" || item === "zb") {
      if (coins < 13000 || coins == undefined) {
        return interaction.reply({
          content: `You don't have enough coins for this item! You need ${coinEmoji} 13000.`,
          ephemeral: true,
        });
      }

      if ((await get(`${user.id}_zephyrsBreeze`)) >= 1) {
        return interaction.reply({
          content: "You can only have 1 zephyr's breeze.",
          ephemeral: true,
        });
      }

      await decr(`${user.id}`, "coins", 13000);
      await set(`${user.id}_zephyrsBreeze`, 1);
      return interaction.reply({
        content: `You bought a zephyr's breeze for ${coinEmoji}13000. Make sure to equip it with /equip.`,
        ephemeral: true,
      });
    }

    if (item === "azureblade" || item === "azure blade" || item === "ab") {
      if (coins < 17000 || coins == undefined) {
        return interaction.reply({
          content: `You don't have enough coins for this item! You need ${coinEmoji} 17000.`,
          ephemeral: true,
        });
      }

      if ((await get(`${user.id}_azureBlade`)) >= 1) {
        return interaction.reply({
          content: "You can only have 1 azure blade.",
          ephemeral: true,
        });
      }

      await decr(`${user.id}`, "coins", 17000);
      await set(`${user.id}_azureBlade`, 1);
      return interaction.reply({
        content: `You bought an azure blade for ${coinEmoji}17000. Make sure to equip it with /equip.`,
        ephemeral: true,
      });
    }

    if (item === "umbraleclipse" || item === "umbral eclipse" || item === "umbral" || item === "ue") {
      if (coins < 23000 || coins == undefined) {
        return interaction.reply({
          content: `You don't have enough coins for this item! You need ${coinEmoji} 23000.`,
          ephemeral: true,
        });
      }

      if ((await get(`${user.id}_umbralEclipse`)) >= 1) {
        return interaction.reply({
          content: "You can only have 1 umbral eclipse.",
          ephemeral: true,
        });
      }

      await decr(`${user.id}`, "coins", 23000);
      await set(`${user.id}_umbralEclipse`, 1);
      return interaction.reply({
        content: `You bought an umbral eclipse for ${coinEmoji}23000. Make sure to equip it with /equip.`,
        ephemeral: true,
      });
    }

    if (item === "divinewrath" || item === "divine wrath" || item === "divine" || item === "dw") {
      if (coins < 30000 || coins == undefined) {
        return interaction.reply({
          content: `You don't have enough coins for this item! You need ${coinEmoji} 30000.`,
          ephemeral: true,
        });
      }

      if ((await get(`${user.id}_divineWrath`)) >= 1) {
        return interaction.reply({
          content: "You can only have 1 divine wrath.",
          ephemeral: true,
        });
      }

      await decr(`${user.id}`, "coins", 30000);
      await set(`${user.id}_divineWrath`, 1);
      return interaction.reply({
        content: `You bought a divine wrath for ${coinEmoji}30000. Make sure to equip it with /equip.`,
        ephemeral: true,
      });
    }

    if (item === "bladeofthedead" || item === "blade of the dead" || item === "blade" || item === "botd") {
      if (coins < 37000 || coins == undefined) {
        return interaction.reply({
          content: `You don't have enough coins for this item! You need ${coinEmoji} 37000.`,
          ephemeral: true,
        });
      }

      if ((await get(`${user.id}_bladeOfTheDead`)) >= 1) {
        return interaction.reply({
          content: "You can only have 1 blade of the dead.",
          ephemeral: true,
        });
      }

      await decr(`${user.id}`, "coins", 37000);
      await set(`${user.id}_bladeOfTheDead`, 1);
      return interaction.reply({
        content: `You bought a blade of the dead for ${coinEmoji}37000. Make sure to equip it with /equip.`,
        ephemeral: true,
      });
    }
  },
};
