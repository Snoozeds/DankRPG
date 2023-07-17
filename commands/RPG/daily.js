const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { set, get, coinEmoji, incr, checkXP, cooldown } = require("../../globals.js");
const ms = require("ms");

module.exports = {
  data: new SlashCommandBuilder().setName("daily").setDescription("Claim your daily reward."),
  async execute(interaction) {
    if (await cooldown.check(interaction.user.id, "daily")) {
      const hours = Math.floor((await cooldown.get(interaction.user.id, "daily")) / 3600000);
      const minutes = Math.floor((await cooldown.get(interaction.user.id, "daily")) / 60000) % 60;
      const seconds = Math.floor((await cooldown.get(interaction.user.id, "daily")) / 1000) % 60;
      return interaction.reply({
        content: `Your daily reward is not ready yet. Please wait ${hours}h ${minutes}m ${seconds}s.`,
        ephemeral: true,
      });
    } else {
      await cooldown.set(interaction.user.id, "daily", "24h");
      const xp = 100;
      let achievementUnlocked = false;
      await incr(`${interaction.user.id}`, `coins`, 250);
      if ((await get(`${interaction.user.id}_daily_achievement`)) == null) {
        await incr(`${interaction.user.id}`, `coins`, 250);
        await set(`${interaction.user.id}_daily_achievement`, true);
        achievementUnlocked = true;
      }

      const embed = new EmbedBuilder()
        .setTitle("Daily Reward")
        .setDescription(
          `:white_check_mark: You collected your daily reward of ${coinEmoji}**250**. You now have ${coinEmoji}**${await get(`${interaction.user.id}_coins`)}**. ${
            (await get(`${interaction.user.id}_xp_alerts`)) == "1" ? `\n+${xp}XP` : ""
          } ${(await checkXP(interaction.user.id, xp)) == true ? ` :up: **Level up!** Check /levels.` : ""}`
        )
        .setColor(await get(`${interaction.user.id}_color`));

      const achievementEmbed = new EmbedBuilder()
        .setTitle("Achievement Unlocked!")
        .setDescription(`:white_check_mark: You unlocked the **It Begins** achievement! (+${coinEmoji}**250**.)`)
        .setColor(await get(`${interaction.user.id}_color`));

      achievementUnlocked == true ? interaction.reply({ embeds: [achievementEmbed, embed] }) : interaction.reply({ embeds: [embed] });
    }
  },
};
