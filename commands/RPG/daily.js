const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { set, get, coinEmoji, incr, checkXP } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder().setName("daily").setDescription("Claim your daily reward."),
  async execute(interaction) {
    const { CommandCooldown, msToMinutes } = require("discord-command-cooldown");
    const ms = require("ms");
    const dailyCommandCooldown = new CommandCooldown("daily", ms("24h"));
    const userCooldowned = await dailyCommandCooldown.getUser(interaction.user.id);
    if (userCooldowned) {
      const timeLeft = msToMinutes(userCooldowned.msLeft, false);
      await interaction.reply({
        content: `You need to wait **${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s** before running daily again!`,
        ephmeral: true,
      });
    } else {
      await dailyCommandCooldown.addUser(interaction.user.id);
      const xp = 100;
      let achievementUnlocked = false;
      await incr(`${interaction.user.id}`, `coins`, 250);
      if ((await get(`${interaction.user.id}_daily_achievement`)) == null || false) {
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
      await incr(`${interaction.user.id}`, "commandsUsed", 1);
    }
  },
};
