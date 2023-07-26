const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { set, get, coinEmoji, incr, checkXP, cooldown, levelUpEmoji } = require("../../globals.js");
const ms = require("ms");

module.exports = {
  data: new SlashCommandBuilder().setName("daily").setDescription("Claim your daily reward."),
  async execute(interaction) {
    const user = interaction.user;
    if (await cooldown.check(user.id, "daily")) {
      const hours = Math.floor((await cooldown.get(user.id, "daily")) / 3600000);
      const minutes = Math.floor((await cooldown.get(user.id, "daily")) / 60000) % 60;
      const seconds = Math.floor((await cooldown.get(user.id, "daily")) / 1000) % 60;
      return interaction.reply({
        content: `Your daily reward is not ready yet. Please wait ${hours}h ${minutes}m ${seconds}s.`,
        ephemeral: true,
      });
    } else {
      await cooldown.set(user.id, "daily", "24h");
      const xp = 100;
      let achievementUnlocked = false;
      await incr(`${user.id}`, `coins`, 250);
      if ((await get(`${user.id}_daily_achievement`)) == null || (await get(`${user.id}_daily_achievement`)) == "false") {
        await incr(`${user.id}`, `coins`, 250);
        await set(`${user.id}_daily_achievement`, true);
        achievementUnlocked = true;
      }

      const embed = new EmbedBuilder()
        .setTitle("Daily Reward")
        .setDescription(
          `:white_check_mark: You collected your daily reward of ${coinEmoji}**250**. You now have ${coinEmoji}**${await get(`${user.id}_coins`)}**. ${
            (await get(`${user.id}_xp_alerts`)) == "1" ? `\n+${xp}XP` : ""
          } ${(await checkXP(user.id, xp)) == true ? ` ${levelUpEmoji} **Level up!** Check /levels.` : ""}`
        )
        .setColor(await get(`${user.id}_color`));

      const achievementEmbed = new EmbedBuilder()
        .setTitle("Achievement Unlocked!")
        .setDescription(`:white_check_mark: You unlocked the **It Begins** achievement! (+${coinEmoji}**250**.)`)
        .setColor(await get(`${user.id}_color`));

      achievementUnlocked == true ? interaction.reply({ embeds: [achievementEmbed, embed] }) : interaction.reply({ embeds: [embed] });
    }
  },
};
