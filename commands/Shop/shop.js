const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ComponentType,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const {
  get,
  coinEmoji,
  stoneRingEmoji,
  lifesaverEmoji,
  hpEmoji,
  armorEmoji,
} = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("Buy items from the shop."),
  async execute(interaction) {
    const user = interaction.user;

    // We have to defer the reply. Discord gets mad otherwise.
    await interaction.deferReply();

    const select = new StringSelectMenuBuilder()
      .setCustomId("shop")
      .setPlaceholder("Select an item to buy")
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel("Health items")
          .setDescription("Items that restore your health.")
          .setValue("health")
          .setEmoji(hpEmoji),

        new StringSelectMenuOptionBuilder()
          .setLabel("Equipment")
          .setDescription("Items that increase your stats.")
          .setValue("equipment")
          .setEmoji(armorEmoji)
      );

    const row = new ActionRowBuilder().addComponents(select);

    const reply = await interaction.editReply({
      content: "Select a category to view items.",
      components: [row],
    });

    const filter = (i) => i.user.id === user.id;
    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      filter: filter,
      time: 3_600_000, // the collector will remain active for 1 hour (3600000 ms.)
    });

    // interaction.editReply will edit the embed correctly but Discord will say the select menu interaction failed.
    // as such, we must use i.update.
    collector.on("collect", async (i) => {
      if (i.customId === "shop") {
        if (i.values[0] === "health") {
          const embed = new EmbedBuilder()
            .setTitle("Health items")
            .setDescription(
              `Your balance: **${coinEmoji}${await get(`${user.id}_coins`)}**`
            )
            .addFields({
              name: `${lifesaverEmoji} Lifesaver (Owned: ${
                (await get(`${user.id}_lifesaver`)) || 0
              })`,
              value: `**Cost: ${coinEmoji}500**\nSaves you from death. Used automatically.\nid: lifesaver`,
            })
            .setFooter({ text: "Use /buy <id> to buy an item." })
            .setColor(await get(`${user.id}_color`));
          await i.update({
            content: "",
            embeds: [embed],
            components: [row],
          });
        } else if (i.values[0] === "equipment") {
          const embed = new EmbedBuilder()
            .setTitle("Equipment")
            .setDescription(
              `Your balance: **${coinEmoji}${await get(`${user.id}_coins`)}**`
            )
            .addFields({
              name: `${stoneRingEmoji} Stone Ring (Owned: ${
                (await get(`${user.id}_stoneRing`)) || 0
              })`,
              value: `**Cost: ${coinEmoji}1500**\nIncreases your Armor stat by 1.\nid: stonering`,
              inline: false,
            })
            .setFooter({ text: "Use /buy <id> to buy an item." })
            .setColor(await get(`${user.id}_color`));
          await i.update({
            content: "",
            embeds: [embed],
            components: [row],
          });
        }
      }
    });
  },
};
