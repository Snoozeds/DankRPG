const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const { set, get, incr, decr, emoji } = require("../../globals.js");

async function confirmUpgrade(interaction, upgradeType, currentLevel, maxLevel, cost, wingsCost) {
  const user = interaction.user;
  const buyConfirmation = await get(`${user.id}_buyConfirmation`);
  const coins = await get(`${user.id}_coins`);
  const demonWing = await get(`${user.id}_demonWing`);

  if (buyConfirmation === "1" || buyConfirmation === "null") {
    const collectorFilter = (i) => i.user.id === user.id;
    const yes = new ButtonBuilder().setCustomId("yes").setLabel("Yes").setStyle(ButtonStyle.Success);
    const no = new ButtonBuilder().setCustomId("no").setLabel("No").setStyle(ButtonStyle.Danger);
    const row = new ActionRowBuilder().addComponents(yes, no);

    if (coins < cost || demonWing < wingsCost) {
      await interaction.reply({
        content: `You don't have enough coins or demon wings to upgrade your ${upgradeType}.\n**You need ${emoji.coins}${cost} and ${emoji.demonWing}${wingsCost}.**`,
        ephemeral: true,
      });
    }

    if (currentLevel === maxLevel) {
      await interaction.reply({
        content: `You have already maxed out this upgrade.`,
        ephemeral: true,
      });
    }

    const reply = await interaction.reply({
      content: `Are you sure you want to upgrade your ${upgradeType} to level ${currentLevel + 1} for ${emoji.coins}${cost} and ${emoji.demonWing}${wingsCost}?`,
      components: [row],
    });

    try {
      const confirmation = await reply.awaitMessageComponent({ filter: collectorFilter, time: 60000 });
      if (confirmation.customId === "yes") {
        const coins = await get(`${user.id}_coins`);
        const demonWing = await get(`${user.id}_demonWing`);
        if (coins < cost || demonWing < wingsCost) {
          await interaction.editReply({
            content: `You don't have enough coins or demon wings to upgrade your ${upgradeType}.\n**You need ${emoji.coins}${cost} and ${emoji.demonWing}${wingsCost}.**`,
            components: [],
          });
        } else {
          await incr(user.id, `${upgradeType}Level`, 1);
          await decr(user.id, "coins", cost);
          await decr(user.id, "demonWing", wingsCost);
          await interaction.editReply({
            content: `You upgraded your ${upgradeType} to level ${currentLevel + 1} for ${emoji.coins}${cost} and ${emoji.demonWing}${wingsCost}.`,
            components: [],
          });
        }
      } else if (confirmation.customId === "no") {
        await interaction.editReply({ content: `Cancelled upgrading.`, components: [] });
      }
    } catch (err) {
      await interaction.editReply({ content: `You took too long to respond. Cancelling.`, components: [] });
    }
  } else {
    const coins = await get(`${user.id}_coins`);
    const demonWing = await get(`${user.id}_demonWing`);
    if (coins < cost || demonWing < wingsCost) {
      await interaction.reply({
        content: `You don't have enough coins or demon wings to upgrade your ${upgradeType}.\n**You need ${emoji.coins}${cost} and ${emoji.demonWing}${wingsCost}.**`,
        ephemeral: true,
      });
    } else {
      await incr(user.id, `${upgradeType}Level`, 1);
      await set(`${user.id}_${upgradeType}`, (await get(`${user.id}_${upgradeType}Level`)) * 0.1);
      await decr(user.id, "coins", cost);
      await decr(user.id, "demonWing", wingsCost);
      await interaction.reply({
        content: `You upgraded your ${upgradeType} to level ${currentLevel + 1} for ${emoji.coins}${cost} and ${emoji.demonWing}${wingsCost}.`,
        ephemeral: true,
      });
    }
  }
}

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

    if (interaction.options.getSubcommand() === "apply") {
      const upgrade = interaction.options.getString("upgrade");

      if (upgrade === "critmulti") {
        const critMultiLevel = Number(await get(`${user.id}_critMultiplierLevel`)) ?? 0;
        const critMultiMaxLevel = 10;
        const critMultiCost = 100 * (critMultiLevel + 1);
        const critMultiWingsCost = critMultiLevel + 1;

        if (critMultiLevel === critMultiMaxLevel) {
          await interaction.reply({ content: `You have already maxed out this upgrade.`, ephemeral: true });
        } else {
          await confirmUpgrade(interaction, "critMultiplier", critMultiLevel, critMultiMaxLevel, critMultiCost, critMultiWingsCost);
        }
      } else if (upgrade === "axe") {
        const axeEfficiencyLevel = Number(await get(`${user.id}_axeEfficiencyLevel`)) ?? 0;
        const axeEfficiencyMaxLevel = 5;
        const axeEfficiencyCost = 100 * (axeEfficiencyLevel + 1);
        const axeEfficiencyWingsCost = axeEfficiencyLevel + 1;

        if (axeEfficiencyLevel === axeEfficiencyMaxLevel) {
          await interaction.reply({ content: `You have already maxed out this upgrade.`, ephemeral: true });
        } else {
          await confirmUpgrade(interaction, "axeEfficiency", axeEfficiencyLevel, axeEfficiencyMaxLevel, axeEfficiencyCost, axeEfficiencyWingsCost);
        }
      } else if (upgrade === "pickaxe") {
        const pickaxeEfficiencyLevel = Number(await get(`${user.id}_pickaxeEfficiencyLevel`)) ?? 0;
        const pickaxeEfficiencyMaxLevel = 5;
        const pickaxeEfficiencyCost = 100 * (pickaxeEfficiencyLevel + 1);
        const pickaxeEfficiencyWingsCost = pickaxeEfficiencyLevel + 1;

        if (pickaxeEfficiencyLevel === pickaxeEfficiencyMaxLevel) {
          await interaction.reply({ content: `You have already maxed out this upgrade.`, ephemeral: true });
        } else {
          await confirmUpgrade(interaction, "pickaxeEfficiency", pickaxeEfficiencyLevel, pickaxeEfficiencyMaxLevel, pickaxeEfficiencyCost, pickaxeEfficiencyWingsCost);
        }
      }
    } else if (interaction.options.getSubcommand() === "view") {
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
    }
  },
};
