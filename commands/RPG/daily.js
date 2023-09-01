const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { set, get, incr, checkXP, cooldown, emoji } = require("../../globals.js");
const ms = require("ms");

module.exports = {
  data: new SlashCommandBuilder().setName("daily").setDescription("Claim your daily reward."),
  async execute(interaction) {
    // Variables
    const user = interaction.user;
    const xp = 100; // XP to give per daily reward

    // Variables for the daily streak system
    const lastDaily = await get(`${user.id}_lastDaily`);
    const currentTimestamp = Date.now();

    // Cooldown - 24 hours
    if (await cooldown.check(user.id, "daily")) {
      const hours = Math.floor((await cooldown.get(user.id, "daily")) / 3600000);
      const minutes = Math.floor((await cooldown.get(user.id, "daily")) / 60000) % 60;
      const seconds = Math.floor((await cooldown.get(user.id, "daily")) / 1000) % 60;
      return interaction.reply({
        content: `Your daily reward is not ready yet. Please wait ${hours}h ${minutes}m ${seconds}s.`,
        ephemeral: true,
      });
    } else {
      // If the last daily reward was collected more than 48 hours ago, reset the streak.
      if (lastDaily != null && currentTimestamp - lastDaily > ms("48h")) {
        await set(`${user.id}_dailyStreak`, 0);
      }

      // "It Begins..." achievement: Collect your first daily reward.
      let achievementUnlocked = false;

      // "Dedicated" achievement: Collect 30 daily rewards in a row without missing a day.
      let dedicatedUnlocked = false;

      const dailyStreak = (await get(`${user.id}_dailyStreak`)) || 0;

      if ((await get(`${interaction.user.id}_statsEnabled`)) === "1" || (await get(`${interaction.user.id}_statsEnabled`)) == null) {
        const longestStreak = await get(`${user.id}_longestStreak`);
        if (longestStreak == null || longestStreak == "") await set(`${user.id}_longestStreak`, 0);
        if (dailyStreak > longestStreak) {
          await set(`${user.id}_longestStreak`, dailyStreak);
        }
      }

      // Maximum streak is 30 days
      if (dailyStreak >= 30) {
        // Dedicated achievement
        const hasDedicated = await get(`${user.id}_dedicated_achievement`);
        if (hasDedicated == null || hasDedicated == "false") {
          await incr(`${user.id}`, `coins`, 500);
          await set(`${user.id}_dedicated_achievement`, true);
          dedicatedUnlocked = true;
        }
        // Reset streak
        await set(`${user.id}_dailyStreak`, 0);
      } else {
        await incr(user.id, `dailyStreak`, 1);
      }

      const baseCoins = 500;
      let coinsReward = baseCoins;

      // Streak bonus
      const streakPercentage = 5 * dailyStreak;
      coinsReward += Math.floor((coinsReward * streakPercentage) / 100); // 5% per day, max percentage is 150% (30 days.)

      if ((await get(`${user.id}_daily_achievement`)) == null || (await get(`${user.id}_daily_achievement`)) == "false") {
        await incr(`${user.id}`, `coins`, 250);
        await set(`${user.id}_daily_achievement`, true);
        achievementUnlocked = true;
      }

      await incr(`${user.id}`, `coins`, coinsReward);
      await set(`${user.id}_lastDaily`, currentTimestamp);
      const embed = new EmbedBuilder()
        .setTitle("Daily Reward")
        .setDescription(
          `You collected your daily reward of ${emoji.coins}**${coinsReward}**. ${dailyStreak > 0 ? `Streak: ${dailyStreak} days.` : ""}\nYou now have ${
            emoji.coins
          }**${await get(`${user.id}_coins`)}**. ${(await get(`${user.id}_xp_alerts`)) == "1" ? `\n+${emoji.level}${xp}` : ""} ${
            (await checkXP(user.id, xp)) == true ? ` ${emoji.levelUp} **Level up!** Check /levels.` : ""
          }`
        )
        .setColor(await get(`${user.id}_color`) ?? "#2b2d31");
      await cooldown.set(user.id, "daily", "24h");

      const achievementEmbed = new EmbedBuilder()
        .setTitle("Achievement Unlocked!")
        .setDescription(`${emoji.achievementUnlock} You unlocked the **It Begins** achievement! (+${emoji.coins}**250**.)`)
        .setColor(await get(`${user.id}_color`) ?? "#2b2d31");

      const dedicatedEmbed = new EmbedBuilder()
        .setTitle("Achievement Unlocked!")
        .setDescription(`${emoji.achievementUnlock} You unlocked the **Dedicated** achievement, ${user.username}! (+${emoji.coins}**500**.)`)
        .setColor(await get(`${user.id}_color`) ?? "#2b2d31");

      if (achievementUnlocked) {
        await interaction.reply({ embeds: [achievementEmbed, embed] });
      } else {
        await interaction.reply({ embeds: [embed] });
      }

      if (dedicatedUnlocked) {
        await interaction.followUp({ embeds: [dedicatedEmbed] });
      }

      if ((await get(`${interaction.user.id}_statsEnabled`)) === "1" || (await get(`${interaction.user.id}_statsEnabled`)) == null) {
        if ((await get(`${user.id}_daily_timesDailyClaimedTotal`)) == null || (await get(`${user.id}_daily_timesDailyClaimedTotal`)) == "") {
          await set(`${user.id}_daily_timesDailyClaimedTotal`, 0);
        }
        await incr(user.id, "daily_timesDailyClaimedTotal", 1);
      }
    }
  },
};
