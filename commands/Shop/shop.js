const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { get, incr, coinEmoji } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("View all available items."),
  async execute(interaction) {
    const user = interaction.user;
    const embed = new EmbedBuilder()
      .setTitle("Shop")
      .setDescription(
        `Your balance: **${coinEmoji} ${await get(`${user.id}_coins`)}**`
      )
      .setColor(await get(`${user.id}_color`))
      .setFields([
        {
          name: `Lifesaver (Owned: ${await get(`${user.id}_lifesaver`)})`,
          value: `Cost: ${coinEmoji}**500**\nSaves you from death. Used automatically.`,
          inline: false,
        },
        {
          name: `Stone Ring`,
          value: `Cost: ${coinEmoji}**1500**\nIncreases your Armor stat by 1.`,
          inline: false,
        },
      ])
      .setFooter({ text: "Use /buy <item> to buy an item." });
    await interaction.reply({ embeds: [embed] });
    await incr(`${interaction.user.id}`, "commandsUsed", 1);
  },
};
