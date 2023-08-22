const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { incr, decr, get, emoji } = require("../../globals");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("craft")
    .setDescription("Craft an item with the materials you have.")
    .addStringOption((option) =>
      option.setName("item").setDescription("The item you want to craft.").setRequired(true).addChoices({ name: "Axe", value: "axe" }, { name: "Pickaxe", value: "pickaxe" })
    ),
  async execute(interaction) {
    const item = interaction.options.getString("item");
    const user = interaction.user;
    const embed = new EmbedBuilder();
    if (item === "axe") {
      const wood = await get(`${user.id}_wood`);
      const stone = await get(`${user.id}_stone`);
      if (wood < 5 || stone < 10 || (wood === null && stone === null)) {
        await interaction.reply({
          content: "You don't have enough materials to craft this item!\nYou need: 5 wood and 10 stone.",
          ephemeral: true,
        });
      } else if ((await get(`${user.id}_axe`)) >= 1) {
        await interaction.reply({
          content: "You already have an axe!",
          ephemeral: true,
        });
      } else {
        embed.setTitle("Axe crafted!");
        embed.setDescription(`<@${user.id}> crafted an ${emoji.axe} axe!`);
        embed.setColor(await get(`${user.id}_color`));
        await decr(`${user.id}`, "wood", 5);
        await decr(`${user.id}`, "stone", 10);
        await incr(`${user.id}`, "axe", 1);
        await interaction.reply({ embeds: [embed] });
      }
    } else if (item === "pickaxe") {
      const wood = await get(`${user.id}_wood`);
      const stone = await get(`${user.id}_stone`);
      if (wood < 25 || stone < 50 || (wood === null && stone === null)) {
        await interaction.reply({
          content: "You don't have enough materials to craft this item!\nYou need: 25 wood and 50 stone.",
          ephemeral: true,
        });
      } else if ((await get(`${user.id}_pickaxe`)) >= 1) {
        await interaction.reply({
          content: "You already have a pickaxe!",
          ephemeral: true,
        });
      } else {
        embed.setTitle("Pickaxe crafted!");
        embed.setDescription(`<@${user.id}> crafted a ${emoji.pickaxe} pickaxe!`);
        embed.setColor(await get(`${user.id}_color`));
        await decr(`${user.id}`, "wood", 25);
        await decr(`${user.id}`, "stone", 50);
        await incr(`${user.id}`, "pickaxe", 1);
        await interaction.reply({ embeds: [embed] });
      }
    }
  },
};
