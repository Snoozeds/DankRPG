const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { get, set, incr, perc, falseEmoji, trueEmoji, coinEmoji } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("achievements")
    .setDescription("Shows your/another user's achievements.")
    .addUserOption((option) => option.setName("user").setDescription("The member whose inventory you want to view").setRequired(false)),

  async execute(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;
    const totalAchievements = 3;
    let userAchievements = 0;

    const dailyAchievement = await get(`${user.id}_daily_achievement`);
    const learnerAchievement = await get(`${user.id}_learner_achievement`);
    const aprilAchievement = await get(`${user.id}_april_achievement`);

    userAchievements = [dailyAchievement, learnerAchievement, aprilAchievement].filter((achievement) => achievement == "true").length;

    if (!(await get(`${user.id}_daily_achievement`))) {
      await set(`${user.id}_daily_achievement`, `${falseEmoji}`);
    }
    if (!(await get(`${user.id}_learner_achievement`))) {
      await set(`${user.id}_learner_achievement`, `${falseEmoji}`);
    }
    if (!(await get(`${user.id}_april_achievement`))) {
      await set(`${user.id}_april_achievement`, `${falseEmoji}`);
    }

    // In the past, I used to use the emoji themselves as the value, but now I use "true" and "false" instead.
    // This has changed due to not being able to update the emoji shown in the embed.
    if ((await get(`${user.id}_daily_achievement`)) === "<:Locked:899050875916541963>") {
      await set(`${user.id}_daily_achievement`, false);
    }
    if ((await get(`${user.id}_learner_achievement`)) === "<:Locked:899050875916541963>") {
      await set(`${user.id}_learner_achievement`, false);
    }
    if ((await get(`${user.id}_april_achievement`)) === "<:Locked:899050875916541963>") {
      await set(`${user.id}_april_achievement`, false);
    }

    if ((await get(`${user.id}_daily_achievement`)) === "<:Unlocked:899050875719393281>") {
      await set(`${user.id}_daily_achievement`, true);
    }
    if ((await get(`${user.id}_learner_achievement`)) === "<:Unlocked:899050875719393281>") {
      await set(`${user.id}_learner_achievement`, true);
    }
    if ((await get(`${user.id}_april_achievement`)) === "<:Unlocked:899050875719393281>") {
      await set(`${user.id}_april_achievement`, true);
    }

    if (user.bot) {
      return interaction.reply({
        content: "Bots don't have achievements.",
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Achievements`)
      .setDescription(
        `**__It Begins...__** ${dailyAchievement == "true" ? trueEmoji : falseEmoji}
Get your first daily reward.
Reward: ${coinEmoji}250

**__Learner__** ${learnerAchievement == "true" ? trueEmoji : falseEmoji}
View \`/commands\` for the first time.
Reward: ${coinEmoji}100

**__April Fools!__** ${aprilAchievement == "true" ? trueEmoji : falseEmoji}
Use any command between 1st-3rd April.
Reward: ${coinEmoji}500`
      )
      .setThumbnail(user.displayAvatarURL({ format: "jpg", size: 4096 }))
      .setFooter({
        text: `${userAchievements}/${totalAchievements} (${Math.trunc(perc(userAchievements, totalAchievements))}%)`,
      })
      .setColor(await get(`${user.id}_color`));

    await interaction.reply({ embeds: [embed] });
    await incr(`${interaction.user.id}`, "commandsUsed", 1);
  },
};
