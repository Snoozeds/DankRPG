const { SlashCommandBuilder } = require("discord.js");
const {
  set,
  get,
  incr,
  armorEmoji,
  celestialArmorEmoji,
  sunforgedArmorEmoji,
  glacialArmorEmoji,
  abyssalArmorEmoji,
  verdantArmorEmoji,
  sylvanArmorEmoji,
  topazineArmorEmoji,
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
          { name: "Topazine armor", value: "topazine" }
        )
    ),
  async execute(interaction) {
    const user = interaction.user;
    const item = interaction.options.getString("item");

    if ((await get(`${user.id}_armorEquipped`)) !== "none" && (await get(`${user.id}_armorEquipped`)) != undefined) {
      return interaction.reply({
        content: "You already have an armor equipped!",
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
    }
  },
};
