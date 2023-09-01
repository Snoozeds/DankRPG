const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { set, get, incr, checkXP, cooldown, emoji, quests } = require("../../globals.js");
const chance = require("chance").Chance();
const ms = require("ms");

module.exports = {
  data: new SlashCommandBuilder().setName("mine").setDescription("Mine for stone. Craft a pickaxe for more resources."),
  async execute(interaction) {
    const user = interaction.user;
    const pickaxe = await get(`${user.id}_pickaxe`);
    const pickaxeEfficiencyLevel = Number(await get(`${user.id}_pickaxeEfficiencyLevel`)) ?? 0;
    const embed = new EmbedBuilder();

    if ((await get(`${user.id}_stone`)) == null || (await get(`${user.id}_stone`)) == "0" || (await get(`${user.id}_stone`)) == "") {
      await set(`${user.id}_stone`, 0);
    }

    if ((await get(`${user.id}_diamond`)) == null || (await get(`${user.id}_diamond`)) == "0" || (await get(`${user.id}_diamond`)) == "") {
      await set(`${user.id}_diamond`, 0);
    }

    // If the user has a pickaxe, they mine faster, get more stone, and get more XP.
    const [mineCooldownTime, minStone, maxStone, xpAmount] = pickaxe >= 1 ? [ms("15s"), 10, 20, 20] : [ms("30s"), 5, 10, 10];

    let stone = chance.integer({ min: minStone, max: maxStone });
    stone += pickaxeEfficiencyLevel * 5;
    const xp = xpAmount;

    // Daily quests
    // 1. Find a diamond
    // 2. Mine rocks 10 times
    let diamondQuestCompleted = false;
    let rocksQuestCompleted = false;

    if (await cooldown.check(user.id, "mine")) {
      return interaction.reply({
        content: `You need to wait ${ms(await cooldown.get(user.id, "mine"))} before you can mine again.`,
        ephemeral: true,
      });
    } else {
      embed.setTitle(`${emoji.pickaxe} Stone mined!`);
      // 30% chance of getting a diamond as well.
      if (chance.bool({ likelihood: 30 })) {
        await incr(`${user.id}`, "diamond", 1);
        embed.setDescription(
          `<@${user.id}> mined some rocks and got **${emoji.stone}${stone}** and **${emoji.diamond}1**!${
            (await get(`${user.id}_xp_alerts`)) == "1" ? `\n+${emoji.level}${xp}` : ""
          } ${(await checkXP(user.id, xp)) == true ? ` ${emoji.levelUp} **Level up!** Check /levels.` : ""}`
        );

        if ((await get(`${interaction.user.id}_statsEnabled`)) === "1" || (await get(`${interaction.user.id}_statsEnabled`)) == null) {
          if ((await get(`${user.id}_mine_diamondsFoundTotal`)) == null || (await get(`${user.id}_mine_diamondsFoundTotal`)) == "") {
            await set(`${user.id}_mine_diamondsFoundTotal`, 0);
          }
          await incr(user.id, "mine_diamondsFoundTotal", 1);
        }

        // Daily quest: Find a diamond
        if (await quests.active(1)) {
          if ((await quests.completed(1, user.id)) === false) {
            await quests.complete(1, user.id);
            diamondQuestCompleted = true;
          }
        }
      } else {
        embed.setDescription(
          `<@${user.id}> mined some rocks and got **${emoji.stone}${stone}**.${(await get(`${user.id}_xp_alerts`)) == "1" ? `\n+${emoji.level}${xp}` : ""} ${
            (await checkXP(user.id, xp)) == true ? ` ${emoji.levelUp} **Level up!** Check /levels.` : ""
          }`
        );
      }
      embed.setColor(await get(`${user.id}_color`));
      await incr(`${user.id}`, "stone", stone);
      await cooldown.set(user.id, "mine", mineCooldownTime);
      await interaction.reply({ embeds: [embed] });

      // Daily quest: Find a diamond
      if (diamondQuestCompleted) {
        await interaction.followUp({ content: `Congrats ${user.username}, you completed a quest and earned ${emoji.coins}100! Check /quests.` });
      }

      // Daily quest: Mine rocks 10 times
      if (await quests.active(6)) {
        await incr(user.id, "rocksMined", "1");
        if ((await quests.completed(6, user.id)) === false && (await get(`${user.id}_rocksMined`)) >= 10) {
          await quests.complete(6, user.id);
          questCompleted = true;
        }
      }

      if (rocksQuestCompleted) {
        await interaction.followUp({ content: `Congrats ${user.username}, you completed a quest and earned ${emoji.coins}150! Check /quests.` });
      }
    }

    if ((await get(`${interaction.user.id}_statsEnabled`)) == "1" || (await get(`${interaction.user.id}_statsEnabled`)) == null) {
      if ((await get(`${user.id}_mine_timesMinedTotal`)) == null || (await get(`${user.id}_mine_timesMinedTotal`)) == "") {
        await set(`${user.id}_mine_timesMinedTotal`, 0);
      }
      if ((await get(`${user.id}_mine_stoneCollectedTotal`)) == null || (await get(`${user.id}_mine_stoneCollectedTotal`)) == "") {
        await set(`${user.id}_mine_stoneCollectedTotal`, 0);
      }
      await incr(user.id, "mine_timesMinedTotal", 1);
      await incr(user.id, "mine_stoneCollectedTotal", stone);
    }
  },
};
