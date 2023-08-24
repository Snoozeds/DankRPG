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
          option
            .setName("upgrade")
            .setDescription("The upgrade to apply.")
            .addChoices({ name: "Crit Multiplier", value: "critmulti" }, { name: "Axe Efficiency", value: "axe" }, { name: "Pickaxe Efficiency", value: "pickaxe" })
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const user = interaction.user;
    const critMultiLevel = Number(await get(`${user.id}_critMultiplierLevel`)) ?? 0;
    const critMultiMaxLevel = 10;
    const critMultiCost = 100 * (critMultiLevel + 1);
    const critMultiWingsCost = critMultiLevel + 1;

    const axeEfficiencyLevel = Number(await get(`${user.id}_axeEfficiencyLevel`)) ?? 0;
    const axeEfficiencyMaxLevel = 5;
    const axeEfficiencyCost = 100 * (axeEfficiencyLevel + 1);
    const axeEfficiencyWingsCost = axeEfficiencyLevel + 1;

    const pickaxeEfficiencyLevel = Number(await get(`${user.id}_pickaxeEfficiencyLevel`)) ?? 0;
    const pickaxeEfficiencyMaxLevel = 5;
    const pickaxeEfficiencyCost = 100 * (pickaxeEfficiencyLevel + 1);
    const pickaxeEfficiencyWingsCost = pickaxeEfficiencyLevel + 1;

    if (interaction.options.getSubcommand() === "view") {
      const embed = new EmbedBuilder()
        .setTitle(`Available Upgrades`)
        .setDescription(`You currently have ${(await get(`${user.id}_demonWing`)) > 0 ? `${emoji.demonWing} **${await get(`${user.id}_demonWing`)}**` : "no demon wings."}`)
        .addFields(
          {
            name: `${emoji.crit} Crit Damage Multiplier (${critMultiLevel * 0.1 + 2}x)`,
            value: `Current level: ${critMultiLevel}${
              critMultiLevel !== critMultiMaxLevel
                ? `\nNext level: ${critMultiLevel + 1} (+0.1)\n${emoji.coins} **${critMultiCost}** ${emoji.demonWing} **${critMultiWingsCost}**`
                : ""
            }`,
            inline: false,
          },
          {
            name: `${emoji.axe} Axe Efficiency (+ ${emoji.wood}${axeEfficiencyLevel * 5})`,
            value: `Current level: ${axeEfficiencyLevel}${
              axeEfficiencyLevel !== axeEfficiencyMaxLevel
                ? `\nNext level: ${axeEfficiencyLevel + 1}\n${emoji.coins} **${axeEfficiencyCost}** ${emoji.demonWing} **${axeEfficiencyWingsCost}**`
                : ""
            }`,
            inline: false,
          },
          {
            name: `${emoji.pickaxe} Pickaxe Efficiency (+ ${emoji.stone}${pickaxeEfficiencyLevel * 5})`,
            value: `Current level: ${pickaxeEfficiencyLevel}${
              pickaxeEfficiencyLevel !== pickaxeEfficiencyMaxLevel
                ? `\nNext level: ${pickaxeEfficiencyLevel + 1}\n${emoji.coins} **${pickaxeEfficiencyCost}** ${emoji.demonWing} **${pickaxeEfficiencyWingsCost}**`
                : ""
            }`,
            inline: false,
          }
        )
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `Tip: You can find more demon wings by fighting.` })
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

      if (upgrade === "axe") {
        if (axeEfficiencyLevel === axeEfficiencyMaxLevel) {
          await interaction.reply({ content: `You have already maxed out this upgrade.`, ephemeral: true });
        } else {
          const coins = await get(`${user.id}_coins`);
          const demonWing = await get(`${user.id}_demonWing`);
          if (coins < axeEfficiencyCost || demonWing < axeEfficiencyWingsCost) {
            await interaction.reply({
              content: `You don't have enough coins or demon wings to upgrade your axe efficiency.\n**You need ${emoji.coins}${axeEfficiencyCost} and ${emoji.demonWing}${axeEfficiencyWingsCost}.**`,
              ephemeral: true,
            });
          } else {
            await incr(user.id, "axeEfficiencyLevel", 1);
            await set(`${user.id}_axeEfficiency`, (await get(`${user.id}_axeEfficiencyLevel`)) * 0.1);
            await decr(user.id, "coins", axeEfficiencyCost);
            await decr(user.id, "demonWing", axeEfficiencyWingsCost);
            await interaction.reply({
              content: `You upgraded your axe efficiency to level ${axeEfficiencyLevel + 1} for ${emoji.coins}${axeEfficiencyCost} and ${
                emoji.demonWing
              }${axeEfficiencyWingsCost}.`,
              ephemeral: true,
            });
          }
        }
      }

      if (upgrade === "pickaxe") {
        if (pickaxeEfficiencyLevel === pickaxeEfficiencyMaxLevel) {
          await interaction.reply({ content: `You have already maxed out this upgrade.`, ephemeral: true });
        } else {
          const coins = await get(`${user.id}_coins`);
          const demonWing = await get(`${user.id}_demonWing`);
          if (coins < pickaxeEfficiencyCost || demonWing < pickaxeEfficiencyWingsCost) {
            await interaction.reply({
              content: `You don't have enough coins or demon wings to upgrade your pickaxe efficiency.\n**You need ${emoji.coins}${pickaxeEfficiencyCost} and ${emoji.demonWing}${pickaxeEfficiencyWingsCost}.**`,
              ephemeral: true,
            });
          } else {
            await incr(user.id, "pickaxeEfficiencyLevel", 1);
            await set(`${user.id}_pickaxeEfficiency`, (await get(`${user.id}_pickaxeEfficiencyLevel`)) * 0.1);
            await decr(user.id, "coins", pickaxeEfficiencyCost);
            await decr(user.id, "demonWing", pickaxeEfficiencyWingsCost);
            await interaction.reply({
              content: `You upgraded your pickaxe efficiency to level ${pickaxeEfficiencyLevel + 1} for ${emoji.coins}${pickaxeEfficiencyCost} and ${
                emoji.demonWing
              }${pickaxeEfficiencyWingsCost}.`,
              ephemeral: true,
            });
          }
        }
      }
    }
  },
};
