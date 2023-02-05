const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const {
  get,
  set,
  incr,
  perc,
  falseEmoji,
  trueEmoji,
  coinEmoji,
} = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("achievements")
    .setDescription("Shows your/another user's achievements.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The member who's inventory you want to view")
        .setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;
    const totalAchievements = 2;
    let userAchievements = 0;

    const dailyAchievement = await get(`${user.id}_daily_achievement`);
    const learnerAchievement = await get(`${user.id}_learner_achievement`);

    userAchievements = [dailyAchievement, learnerAchievement].filter(
      (achievement) => achievement === `${trueEmoji}`
    ).length;

    if ((await get(`${user.id}_daily_achievement`)) === null) {
      set(`${user.id}_daily_achievement`, `${falseEmoji}`);
    }
    if ((await get(`${user.id}_learner_achievement`)) === null) {
      set(`${user.id}_learner_achievement`, `${falseEmoji}`);
    }

    if (user.bot) {
      return interaction.reply({
        content: "Bots don't have achievements.",
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}\'s Achievements`)
      .setDescription(
        `**__It Begins...__** ${await get(
          `${user.id}_daily_achievement`
        )}\nGet your first daily reward.\nReward: ${coinEmoji}250
        
        **__Learner__** ${await get(
          `${user.id}_learner_achievement`
        )}\nView \`/commands\` for the first time.\nReward: ${coinEmoji}100\n`
      )
      .setThumbnail(user.displayAvatarURL({ format: "jpg", size: 4096 }))
      .setFooter({
        text: `${userAchievements}/${totalAchievements} (${perc(
          userAchievements,
          totalAchievements
        )}%)`,
      })
      .setColor(await get(`${user.id}_color`));

    await interaction.reply({ embeds: [embed] });
    await incr(`${interaction.user.id}`, "commandsUsed", 1);
  },
};
