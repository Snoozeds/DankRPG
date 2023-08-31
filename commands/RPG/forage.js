const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { get, set, incr, cooldown, emoji, quests } = require("../../globals.js");
const chance = require("chance").Chance();
const ms = require("ms");

module.exports = {
  data: new SlashCommandBuilder().setName("forage").setDescription("Forages for items in the wilderness."),
  async execute(interaction) {
    const user = interaction.user;

    // Used for the followUp message.
    let questCompleted = false;

    // The command errors if the user's items are not defined (null.)
    const items = ["stone", "wood", "diamond"];

    for (const item of items) {
      if (!(await get(`${user.id}_${item}`))) {
        await set(`${user.id}_${item}`, 0);
      }
    }

    if (await cooldown.check(user.id, "forage")) {
      return interaction.reply({
        content: `You need to wait ${ms(await cooldown.get(user.id, "forage"))} before you can forage again.`,
        ephemeral: true,
      });
    } else {
      const rare = chance.weighted([true, false], [10, 90]); // 10% chance of getting a diamond
      const embed = new EmbedBuilder()
        .setTitle("Foraging...")
        .setDescription(`<@${user.id}> goes foraging in the wilderness.`)
        .setColor(await get(`${user.id}_color`));
      if (rare) {
        // Daily quest: Find a diamond
        if (await quests.active(1)) {
          if ((await quests.completed(1, user.id)) === false) {
            await quests.complete(1, user.id);
            questCompleted = true;
          }
        }
        embed.setFields({
          name: "Diamond",
          value: `You found 1x ${emoji.diamond}**Diamond**!`,
        });
        await incr(user.id, "diamond", 1);
      } else {
        const amount = chance.integer({ min: 3, max: 5 });
        const set = chance.weighted(["wood", "stone"], [40, 60]);
        embed.setFields({
          name: `${set}`,
          value: `You found ${amount} **${set}**!`,
        });
        await incr(user.id, set, amount);
      }
      await interaction.reply({ embeds: [embed] });
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
        await incr(interaction.user.id, "forage_itemsFoundTotal", 1);
        if (rare) {
          if ((await get(`${user.id}_forage_diamondsFoundTotal`)) == null || (await get(`${user.id}_forage_diamondsFoundTotal`)) == "") {
            await set(`${user.id}_forage_diamondsFoundTotal`, 0);
          }
          await incr(interaction.user.id, "forage_diamondsFoundTotal", 1);
        }
      }
      await cooldown.set(user.id, "forage", "30s");
    }
  },
};
