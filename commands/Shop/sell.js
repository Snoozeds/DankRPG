const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const { get, incr, decr, emoji } = require("../../globals.js");

const items = [
  {
    id: "wood",
    emoji: emoji.wood,
    value: 1,
  },
  {
    id: "stone",
    emoji: emoji.stone,
    value: 5,
  },
  {
    id: "diamond",
    emoji: emoji.diamond,
    value: 250,
  },
  {
    id: "demonWing",
    emoji: emoji.demonWing,
    value: 300,
  },
  {
    id: "tilapia",
    emoji: emoji.tilapia,
    value: 45,
  },
  {
    id: "sardine",
    emoji: emoji.sardine,
    value: 45,
  },
  {
    id: "perch",
    emoji: emoji.perch,
    value: 45,
  },
  {
    id: "anchovy",
    emoji: emoji.anchovy,
    value: 45,
  },
  {
    id: "spot",
    emoji: emoji.spot,
    value: 65,
  },
  {
    id: "rainbowTrout",
    emoji: emoji.rainbowTrout,
    value: 65,
  },
  {
    id: "catfish",
    emoji: emoji.catfish,
    value: 65,
  },
  {
    id: "pufferfish",
    emoji: emoji.pufferfish,
    value: 80,
  },
  {
    id: "bass",
    emoji: emoji.bass,
    value: 80,
  },
  {
    id: "octopus",
    emoji: emoji.octopus,
    value: 100,
  },
  {
    id: "candy",
    emoji: emoji.candy,
    value: 50,
  },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sell")
    .setDescription("Sell an item from your inventory.")
    .addStringOption((option) =>
      option
        .setName("item")
        .setDescription("The item you want to sell.")
        .setRequired(true)
        .addChoices(
          { name: `Wood`, value: "wood" },
          { name: `Stone`, value: "stone" },
          { name: `Diamond`, value: "diamond" },
          { name: `Demon Wing`, value: "demonWing" },
          { name: `Tilapia`, value: "tilapia" },
          { name: `Sardine`, value: "sardine" },
          { name: `Perch`, value: "perch" },
          { name: `Anchovy`, value: "anchovy" },
          { name: `Spot`, value: "spot" },
          { name: `Rainbow Trout`, value: "rainbowTrout" },
          { name: `Catfish`, value: "catfish" },
          { name: `Pufferfish`, value: "pufferfish" },
          { name: `Bass`, value: "bass" },
          { name: `Octopus`, value: "octopus" },
          { name: `Candy`, value: "candy" }
        )
    )
    .addStringOption((option) => option.setName("amount").setDescription("The amount you want to sell. Type max to sell all of that item.").setRequired(true)),
  async execute(interaction) {
    const item = interaction.options.getString("item");
    const amount = interaction.options.getString("amount");
    const user = interaction.user;

    if (isNaN(amount) && amount !== "max") return interaction.reply({ content: "The amount must be a number.", ephemeral: true });
    if (amount < 1 && amount !== "max") return interaction.reply({ content: "The amount must be greater than 0.", ephemeral: true });

    let confirmation = await get(`${user.id}_sellConfirmation`);
    if (confirmation === null) confirmation = true;
    if (confirmation === "0") confirmation = false;
    if (confirmation === "1") confirmation = true;

    if (confirmation === true) {
      const itemData = items.find((i) => i.id === item);

      const itemAmount = await get(`${user.id}_${item}`);
      if (itemAmount === null) return interaction.reply({ content: "You don't have that item.", ephemeral: true });
      if (itemAmount == "0") return interaction.reply({ content: "You don't have that item.", ephemeral: true });
      if (itemAmount < amount && amount !== "max") return interaction.reply({ content: `You don't have that many of that item. You have ${itemAmount}.`, ephemeral: true });

      if (amount === "max") {
        const total = itemAmount * itemData.value;

        // Buttons
        const yes = new ButtonBuilder().setCustomId("yes").setLabel("Yes").setStyle(ButtonStyle.Success);
        const no = new ButtonBuilder().setCustomId("no").setLabel("No").setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder().addComponents(yes, no);
        const itemName = itemData.id.charAt(0).toUpperCase() + itemData.id.slice(1).toLowerCase();
        const reply = await interaction.reply({
          content: `Are you sure you want to sell all of your ${itemData.emoji}${itemName} for ${emoji.coins}${total}?`,
          components: [row],
        });
        const collectorFilter = (i) => i.user.id === interaction.user.id;
        const confirmation = reply.createMessageComponentCollector({ collectorFilter, time: 60000 });
        confirmation.on("collect", async (interaction) => {
          if (interaction.customId === "yes") {
            // Check user STILL has enough of the item
            const itemAmount = await get(`${user.id}_${item}`);
            if (itemAmount === null) return interaction.update({ content: "You no longer have that item.", ephemeral: true });
            await incr(user.id, "coins", total);
            await decr(user.id, item, itemAmount);
            await interaction.update({ content: `You sold ${itemAmount} of your ${itemData.emoji}${itemData.id} for ${emoji.coins}${total}.`, components: [] });
          } else if (interaction.customId === "no") {
            await interaction.update({ content: "Selling canceled.", components: [] });
          }
        });
        confirmation.on("end", () => {
          interaction.editReply({ content: "You did not respond in time.", components: [] });
        });
      }
      if (amount !== "max") {
        const total = amount * itemData.value;

        // Buttons
        const yes = new ButtonBuilder().setCustomId("yes").setLabel("Yes").setStyle(ButtonStyle.Success);
        const no = new ButtonBuilder().setCustomId("no").setLabel("No").setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder().addComponents(yes, no);
        // Capitalize first letter of item, make all other letters lowercase.
        const itemName = itemData.id.charAt(0).toUpperCase() + itemData.id.slice(1).toLowerCase();
        const reply = await interaction.reply({
          content: `Are you sure you want to sell ${amount} of your ${itemData.emoji}${itemName} for ${emoji.coins}${total}?`,
          components: [row],
        });
        const collectorFilter = (i) => i.user.id === interaction.user.id;
        const confirmation = reply.createMessageComponentCollector({ collectorFilter, time: 60000 });
        confirmation.on("collect", async (interaction) => {
          if (interaction.customId === "yes") {
            // Check user STILL has enough of the item
            const itemAmount = await get(`${user.id}_${item}`);
            if (itemAmount === null) return interaction.update({ content: "You no longer have that item.", ephemeral: true });
            if (itemAmount < amount) return interaction.update({ content: `You no longer have that many of that item. You have ${itemAmount}.`, ephemeral: true });
            await incr(user.id, "coins", total);
            await decr(user.id, item, amount);
            await interaction.update({ content: `You sold ${amount} of your ${itemData.emoji}${itemData.id} for ${emoji.coins}${total}.`, components: [] });
          } else if (interaction.customId === "no") {
            await interaction.update({ content: "Selling canceled.", components: [] });
          }
        });
        confirmation.on("end", () => {
          interaction.editReply({ content: "You did not respond in time.", components: [] });
        });
      }
    }
    if (confirmation === false) {
      const itemData = items.find((i) => i.id === item);
      if (!itemData) return interaction.reply({ content: "That item doesn't exist.", ephemeral: true });

      const itemAmount = await get(`${user.id}_${item}`);
      if (itemAmount === null) return interaction.reply({ content: "You don't have that item.", ephemeral: true });
      if (itemAmount < amount && amount !== "max") return interaction.reply({ content: `You don't have that many of that item. You have ${itemAmount}.`, ephemeral: true });

      if (amount === "max") {
        const total = itemAmount * itemData.value;

        await incr(user.id, "coins", total);
        await decr(user.id, item, itemAmount);
        await interaction.reply({ content: `You sold ${itemAmount} of your ${itemData.emoji}${itemData.id} for ${emoji.coins}${total}.` });
      }
      if (amount !== "max") {
        const total = amount * itemData.value;

        await incr(user.id, "coins", total);
        await decr(user.id, item, amount);
        await interaction.reply({ content: `You sold ${amount} of your ${itemData.emoji}${itemData.id} for ${emoji.coins}${total}.` });
      }
    }
  },
};
