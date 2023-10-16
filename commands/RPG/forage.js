const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { get, set, incr, cooldown, emoji, quests } = require("../../globals.js");
const chance = require("chance").Chance();
const ms = require("ms");

module.exports = {
  data: new SlashCommandBuilder().setName("forage").setDescription("Forages for items in the wilderness."),
  async execute(interaction) {
    const user = interaction.user;
    let itemsFound = 0;

    // Used for the followUp message.
    let questCompleted = false;

    // The command errors if the user's items are not defined (null.)
    const items = ["stone", "wood", "diamond", "demonWing"];

    for (const item of items) {
      if (!(await get(`${user.id}_${item}`))) {
        await set(`${user.id}_${item}`, 0);
      }
    }

    // Variables
    let diamondChance = 10;
    let demonWingChance = 5;
    let luckBonusMessage = "";

    // Handle luck bonus increasing chances
    (await get(`${user.id}_luckBonus`)) > 0 ? (diamondChance += Number(await get(`${user.id}_luckBonus`))) : (diamondChance += 0);
    (await get(`${user.id}_luckBonus`)) > 0 ? (demonWingChance += Number(await get(`${user.id}_luckBonus`))) : (demonWingChance += 0);
    (await get(`${user.id}_luckBonus`)) > 0 ? (luckBonusMessage = `\n(+${await get(`${user.id}_luckBonus`)}% Luck Bonus active)`) : (luckBonusMessage = "");

    // Roll chances
    const rare = chance.weighted([true, false], [diamondChance, 100 - diamondChance]); // 10% chance of getting a diamond.
    const demonWing = chance.weighted([true, false], [demonWingChance, 100 - demonWingChance]); // 5% chance of getting a demon wing.

    if (await cooldown.check(user.id, "forage")) {
      return interaction.reply({
        content: `You need to wait ${ms(await cooldown.get(user.id, "forage"))} before you can forage again.`,
        ephemeral: true,
      });
    } else {
      await cooldown.set(user.id, "forage", "30s");

      // Initial embed
      const embed = new EmbedBuilder()
        .setTitle("Foraging...")
        .setDescription(`<@${user.id}> goes foraging in the wilderness.${luckBonusMessage}`)
        .setColor((await get(`${user.id}_color`)) ?? "#2b2d31");

      // Found a Diamond
      if (rare) {
        // Daily quest: Find a diamond
        if (await quests.active(1)) {
          if ((await quests.completed(1, user.id)) === false) {
            await quests.complete(1, user.id);
            questCompleted = true;
          }
        }
        embed.addFields({
          name: "Diamond",
          value: `You found 1x ${emoji.diamond}**Diamond**!`,
        });
        await incr(user.id, "diamond", 1);
        itemsFound += 1;
      }

      // Found a demonWing
      if (demonWing) {
        embed.addFields({
          name: "Demon Wing",
          value: `You found 1x ${emoji.demonWing}**Demon Wing**!`,
        });
        await incr(user.id, "demonWing", 1);
        itemsFound++;
      }

      // Wood & Stone
      const amount = chance.integer({ min: 3, max: 5 });
      const set = chance.weighted(["wood", "stone"], [40, 60]);
      embed.addFields({
        name: `${set}`,
        value: `You found ${amount} **${set}**!`,
      });
      await incr(user.id, set, amount);
      itemsFound += amount;
      await interaction.reply({ embeds: [embed] });
    }
    // Daily quest: Find a diamond
    if (questCompleted) {
      await interaction.followUp({ content: `Congrats ${user.username}, you completed a quest and earned ${emoji.coins}100! Check /quests.` });
    }

    if ((await get(`${interaction.user.id}_statsEnabled`)) === "1" || (await get(`${interaction.user.id}_statsEnabled`)) == null) {
      if ((await get(`${user.id}_forage_timesForagedTotal`)) == null || (await get(`${user.id}_forage_timesForagedTotal`)) == "") {
        await set(`${user.id}_forage_timesForagedTotal`, 0);
      }
      if ((await get(`${user.id}_forage_itemsFoundTotal`)) == null || (await get(`${user.id}_forage_itemsFoundTotal`)) == "") {
        await set(`${user.id}_forage_itemsFoundTotal`, 0);
      }
      await incr(interaction.user.id, "forage_timesForagedTotal", 1);
      await incr(interaction.user.id, "forage_itemsFoundTotal", itemsFound);

      if (rare) {
        if ((await get(`${user.id}_forage_diamondsFoundTotal`)) == null || (await get(`${user.id}_forage_diamondsFoundTotal`)) == "") {
          await set(`${user.id}_forage_diamondsFoundTotal`, 0);
        }
        await incr(interaction.user.id, "forage_diamondsFoundTotal", 1);
      }
      if (demonWing) {
        if ((await get(`${user.id}_forage_demonWingsFoundTotal`)) == null || (await get(`${user.id}_forage_demonWingsFoundTotal`)) == "") {
          await set(`${user.id}_forage_demonWingsFoundTotal`, 0);
        }
        await incr(interaction.user.id, "forage_demonWingsFoundTotal", 1);
      }
    }
  },
};
