const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { get, set, perc, emoji } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("achievements")
    .setDescription("Shows your/another user's achievements.")
    .addUserOption((option) => option.setName("user").setDescription("The member whose inventory you want to view").setRequired(false)),

  async execute(interaction) {
    const user = interaction.options.getUser("user") ?? interaction.user;

    // IMPORTANT: If you add more achievements, make sure to update the totalAchievements variable.
    const totalAchievements = 7;
    let userAchievements = 0;

    // Achievement variables.
    const dailyAchievement = await get(`${user.id}_daily_achievement`);
    const learnerAchievement = await get(`${user.id}_learner_achievement`);
    const fearedAchievement = await get(`${user.id}_feared_achievement`);
    const dedicatedAchievement = await get(`${user.id}_dedicated_achievement`);
    const aprilAchievement = await get(`${user.id}_april_achievement`);
    const rareAchievement = await get(`${user.id}_fishLegendaryAchievement`);
    const eventAchievement = await get(`${user.id}_eventParticipateAchievement`);

    // IMPORTANT: If you add more achievements, make sure to add them to this array.
    userAchievements = [dailyAchievement, learnerAchievement, fearedAchievement, dedicatedAchievement, rareAchievement, aprilAchievement, eventAchievement].filter(
      (achievement) => achievement == "true"
    ).length;

    if (!(await get(`${user.id}_daily_achievement`))) {
      await set(`${user.id}_daily_achievement`, false);
    }
    if (!(await get(`${user.id}_learner_achievement`))) {
      await set(`${user.id}_learner_achievement`, false);
    }
    if (!(await get(`${user.id}_feared_achievement`))) {
      await set(`${user.id}_feared_achievement`, false);
    }
    if (!(await get(`${user.id}_dedicated_achievement`))) {
      await set(`${user.id}_dedicated_achievement`, false);
    }
    if (!(await get(`${user.id}_fishLegendaryAchievement`))) {
      await set(`${user.id}_fishLegendaryAchievement`, false);
    }
    if (!(await get(`${user.id}_april_achievement`))) {
      await set(`${user.id}_april_achievement`, false);
    }
    if (!(await get(`${user.id}_eventParticipateAchievement`))) {
      await set(`${user.id}_eventParticipateAchievement`, false);
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
        `**__It Begins...__** ${dailyAchievement == "true" ? emoji.achievementUnlock : emoji.achievementLock}
Get your first daily reward.
Reward: ${emoji.coins}250

**__Learner__** ${learnerAchievement == "true" ? emoji.achievementUnlock : emoji.achievementLock}
View \`/commands\` for the first time.
Reward: ${emoji.coins}100

**__Feared__** ${fearedAchievement == "true" ? emoji.achievementUnlock : emoji.achievementLock}
Win 100 fights.
Reward: ${emoji.coins}1000

**__Dedicated__** ${dedicatedAchievement == "true" ? emoji.achievementUnlock : emoji.achievementLock}
Collect 30 daily rewards in a row without missing a day.
Reward: ${emoji.coins}500

**__It's rare, I think__** ${rareAchievement == "true" ? emoji.achievementUnlock : emoji.achievementLock}
Catch a legendary fish.
Reward: ${emoji.coins}300

**__April Fools!__** ${aprilAchievement == "true" ? emoji.achievementUnlock : emoji.achievementLock}
Use any command between 1st-3rd April.
Reward: ${emoji.coins}500

**__Just in Time.__** ${eventAchievement == "true" ? emoji.achievementUnlock : emoji.achievementLock}
Run a command during any event.
Reward: ${emoji.coins}250`
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 4096 }))
      .setFooter({
        text: `${userAchievements}/${totalAchievements} (${Math.trunc(perc(userAchievements, totalAchievements))}%)`,
      })
      .setColor((await get(`${interaction.user.id}_color`)) ?? "#2b2d31");

    await interaction.reply({ embeds: [embed] });
  },
};
