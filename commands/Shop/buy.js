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

    if (item === "stone ring" || item === "stonering") {
      if (coins < 1500 || coins == undefined) {
        return interaction.reply({
          content: `You don't have enough coins for this item! You need ${coinEmoji} 1500.`,
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
      await decr(`${user.id}`, "coins", 1500);
      await set(`${user.id}_stoneRing`, 1);
      return interaction.reply({
        content: `You bought a stone ring for ${coinEmoji}1500.`,
        ephemeral: true,
      });
    }

    if (item === "celestial armor" || item === "celestialarmor" || item === "celestial") {
      if (coins < 10000 || coins == undefined) {
        return interaction.reply({
          content: `You don't have enough coins for this item! You need ${coinEmoji} 10000.`,
          ephemeral: true,
        });
      }

      if ((await get(`${user.id}_celestialArmor`)) >= 1) {
        return interaction.reply({
          content: "You can only have 1 celestial armor.",
          ephemeral: true,
        });
      }
      await decr(`${user.id}`, "coins", 10000);
      await set(`${user.id}_celestialArmor`, 1);
      return interaction.reply({
        content: `You bought a celestial armor for ${coinEmoji}10000.`,
        ephemeral: true,
      });
    }

    if (item === "sunforged armor" || item === "sunforgedarmor" || item === "sunforged") {
      if (coins < 8500 || coins == undefined) {
        return interaction.reply({
          content: `You don't have enough coins for this item! You need ${coinEmoji} 8500.`,
          ephemeral: true,
        });
      }

      if ((await get(`${user.id}_sunforgedArmor`)) >= 1) {
        return interaction.reply({
          content: "You can only have 1 sunforged armor.",
          ephemeral: true,
        });
      }
      await decr(`${user.id}`, "coins", 8500);
      await set(`${user.id}_sunforgedArmor`, 1);
      return interaction.reply({
        content: `You bought a sunforged armor for ${coinEmoji}8500.`,
        ephemeral: true,
      });
    }

    if (item === "glacial armor" || item === "glacialarmor" || item === "glacial") {
      if (coins < 6500 || coins == undefined) {
        return interaction.reply({
          content: `You don't have enough coins for this item! You need ${coinEmoji} 6500.`,
          ephemeral: true,
        });
      }

      if ((await get(`${user.id}_glacialArmor`)) >= 1) {
        return interaction.reply({
          content: "You can only have 1 glacial armor.",
          ephemeral: true,
        });
      }
      await decr(`${user.id}`, "coins", 6500);
      await set(`${user.id}_glacialArmor`, 1);
      return interaction.reply({
        content: `You bought a glacial armor for ${coinEmoji}6500.`,
        ephemeral: true,
      });
    }

    if (item === "abyssal armor" || item === "abyssalarmor" || item === "abyssal") {
      if (coins < 5500 || coins == undefined) {
        return interaction.reply({
          content: `You don't have enough coins for this item! You need ${coinEmoji} 5500.`,
          ephemeral: true,
        });
      }

      if ((await get(`${user.id}_abyssalArmor`)) >= 1) {
        return interaction.reply({
          content: "You can only have 1 abyssal armor.",
          ephemeral: true,
        });
      }

      await decr(`${user.id}`, "coins", 5500);
      await set(`${user.id}_abyssalArmor`, 1);
      return interaction.reply({
        content: `You bought a abyssal armor for ${coinEmoji}5500.`,
        ephemeral: true,
      });
    }

    if (item === "verdant armor" || item === "verdantarmor" || item === "verdant") {
      if (coins < 4500 || coins == undefined) {
        return interaction.reply({
          content: `You don't have enough coins for this item! You need ${coinEmoji} 4500.`,
          ephemeral: true,
        });
      }

      if ((await get(`${user.id}_verdantArmor`)) >= 1) {
        return interaction.reply({
          content: "You can only have 1 verdant armor.",
          ephemeral: true,
        });
      }

      await decr(`${user.id}`, "coins", 4500);
      await set(`${user.id}_verdantArmor`, 1);
      return interaction.reply({
        content: `You bought a verdant armor for ${coinEmoji}4500.`,
        ephemeral: true,
      });
    }

    if (item === "sylvan armor" || item === "sylvanarmor" || item === "sylvan") {
      if (coins < 3500 || coins == undefined) {
        return interaction.reply({
          content: `You don't have enough coins for this item! You need ${coinEmoji} 3500.`,
          ephemeral: true,
        });
      }

      if ((await get(`${user.id}_sylvanArmor`)) >= 1) {
        return interaction.reply({
          content: "You can only have 1 sylvan armor.",
          ephemeral: true,
        });
      }

      await decr(`${user.id}`, "coins", 3500);
      await set(`${user.id}_sylvanArmor`, 1);
      return interaction.reply({
        content: `You bought a sylvan armor for ${coinEmoji}3500.`,
        ephemeral: true,
      });
    }

    if (item === "topazine armor" || item === "topazinearmor" || item === "topazine") {
      if (coins < 2500 || coins == undefined) {
        return interaction.reply({
          content: `You don't have enough coins for this item! You need ${coinEmoji} 2500.`,
          ephemeral: true,
        });
      }

      if ((await get(`${user.id}_topazineArmor`)) >= 1) {
        return interaction.reply({
          content: "You can only have 1 topazine armor.",
          ephemeral: true,
        });
      }

      await decr(`${user.id}`, "coins", 2500);
      await set(`${user.id}_topazineArmor`, 1);
      return interaction.reply({
        content: `You bought a topazine armor for ${coinEmoji}2500.`,
        ephemeral: true,
      });
    }
  },
};
