const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
} = require("discord.js");
const { get, incr, decr, coinEmoji } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sell")
    .setDescription("Sell an item from your inventory.")
    .addStringOption((option) =>
      option
        .setName("item")
        .setDescription("The item you want to sell.")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount of items you want to sell.")
        .setRequired(false)
    ),
  async execute(interaction) {
    const item = interaction.options.getString("item");
    const amount = interaction.options.getInteger("amount") ?? 1;
    const user = interaction.user;

    // An array of items that can be sold
    const items = [
      {
        name: "diamond",
        value: 250,
        description: "A rarity, worth 250 coins.",
      },
      {
        name: "stone",
        value: 5,
        description: "A common item, worth 5 coins.",
      },
      {
        name: "wood",
        value: 1,
        description: "A common item, worth 1 coin.",
      },
    ];

    // Find the item in the items array
    const selectedItem = items.find((i) => i.name === item);

    // If the item doesn't exist, return
    if (!selectedItem) {
      return interaction.reply({
        content: `The item \`${item}\` doesn't exist.`,
        ephemeral: true,
      });
    }

    // If the user doesn't have the item, return
    if ((await get(`${user.id}_${selectedItem.name}`)) < amount) {
      return interaction.reply({
        content: `You don't have enough \`${item}\` to sell.`,
        ephemeral: true,
      });
    }

    // If the user has the item, sell it
    if ((await get(`${user.id}_${selectedItem.name}`)) >= amount) {
      await decr(user.id, `${selectedItem.name}`, amount);
      await incr(user.id, "coins", selectedItem.value * amount)
      return interaction.reply({
        content: `You sold \`${amount}\` \`${
          selectedItem.name
        }\` for ${coinEmoji}${selectedItem.value * amount}.`,
        ephemeral: true,
      });
    }
  },
};
