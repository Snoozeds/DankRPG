const { SlashCommandBuilder, EmbedBuilder, Embed } = require("discord.js");
const { get, emoji } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder().setName("quests").setDescription("View your daily quests"),
  async execute(interaction) {
    const questsString = await get("quests");
    const quests = JSON.parse(questsString); // Get the quests from the key

    if (!quests) {
      return interaction.reply({ content: "There are no quests available right now. Please check back later.", ephemeral: true });
    }

    // Check if the user has completed the questID
    const completed = await redis.lrange(`${interaction.user.id}_questsCompleted`, 0, -1);
    const completedIDs = completed.map((quest) => JSON.parse(quest).id);

    // Sort quests, with completed quests at the bottom
    quests.sort((a, b) => {
      const aCompleted = completedIDs.includes(a.id);
      const bCompleted = completedIDs.includes(b.id);
      if (aCompleted && !bCompleted) return 1; // Put completed quests at the bottom
      if (!aCompleted && bCompleted) return -1; // Put completed quests at the bottom
      return 0;
    });

    const embed = new EmbedBuilder()
      .setTitle(`${emoji.questScroll} Today's Quests`)
      .setDescription("Complete these quests to earn some rewards!\n**They reset every midnight UTC.**")
      .setFields(
        quests.map((quest) => {
          const { description, reward, id } = quest;
          const questDescription = description || "No description available";
          return { name: questDescription, value: `Reward: ${emoji.coins}${reward}\nCompleted: ${completedIDs.includes(id) ? "Yes" : "No"}` };
        })
      )
      .setColor(await get(`${interaction.user.id}_color`));

    return interaction.reply({ embeds: [embed] });
  },
};