const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { set, get, incr, decr, emoji } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("upgrade")
    .setDescription("Upgrade your stats.")
    .addSubcommand((subcommand) => subcommand.setName("view").setDescription("View all upgrades."))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("apply")
        .setDescription("Apply an upgrade.")
        .addStringOption((option) =>
          option.setName("upgrade").setDescription("The upgrade to apply.").setRequired(true).addChoices({ name: "Crit Multiplier", value: "critmulti" })
        )
    ),
  async execute(interaction) {
    const user = interaction.user;
    const critMultiLevel = Number(await get(`${user.id}_critMultiplierLevel`)) ?? 0;
    const critMultiMaxLevel = 10;
    const critMultiCost = 100 * (critMultiLevel + 1);
    const critMultiWingsCost = critMultiLevel + 1;
    if (interaction.options.getSubcommand() === "view") {
      const embed = new EmbedBuilder()
        .setTitle(`Available Upgrades`)
        .addFields({
          name: `${emoji.crit} Crit Multiplier (${critMultiLevel * 0.1 + 2}x)`,
          value: `Current level: ${critMultiLevel}${
            critMultiLevel !== critMultiMaxLevel ? `\nNext level: ${critMultiLevel + 1} (+0.1)\nCost: ${emoji.coins}${critMultiCost}` : ""
          }`,
          inline: false,
        })
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setColor(await get(`${interaction.user.id}_color`));
      await interaction.reply({ embeds: [embed] });
    } else if (interaction.options.getSubcommand() === "apply") {
      const upgrade = interaction.options.getString("upgrade");
      if (upgrade === "critmulti") {
        if (critMultiLevel === critMultiMaxLevel) {
          await interaction.reply({ content: `You have already maxed out this upgrade.`, ephemeral: true });
        } else {
          const coins = await get(`${user.id}_coins`);
          const demonWing = await get(`${user.id}_demonWing`);
          if (coins < critMultiCost || demonWing < critMultiWingsCost) {
            await interaction.reply({
              content: `You don't have enough coins or demon wings to upgrade your crit multiplier.\n**You need ${emoji.coins}${critMultiCost} and ${emoji.demonWing}${critMultiWingsCost}.**`,
              ephemeral: true,
            });
          } else {
            await incr(user.id, "critMultiplierLevel", 1);
            await set(`${user.id}_critMultiplier`, (await get(`${user.id}_critMultiplierLevel`)) * 0.1);
            await decr(user.id, "coins", critMultiCost);
            await decr(user.id, "demonWing", critMultiWingsCost);
            await interaction.reply({
              content: `You upgraded your crit multiplier to level ${critMultiLevel + 1} for ${emoji.coins}${critMultiCost} and ${emoji.demonWing}${critMultiWingsCost}.`,
              ephemeral: true,
            });
          }
        }
      }
    }
  },
};
