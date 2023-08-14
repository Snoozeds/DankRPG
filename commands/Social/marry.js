const { SlashCommandBuilder } = require("discord.js");
const { get, set, incr } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("marry")
    .setDescription("Starts a marriage request with another user.")
    .addUserOption((option) => option.setName("user").setDescription("The user you want to marry.").setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const author = interaction.user;
    if (user.id === interaction.user.id) {
      return interaction.reply({
        content: "Sorry, you can't marry yourself.",
        ephemeral: true,
      });
    } else {
      if ((await get(`${author.id}_marriageStatus`)) === "married") {
        return interaction.reply({
          content: "You are already married!",
          ephemeral: true,
        });
      }
      const isBlocked = await redis.lrange(`${user.id}_blockedUsers`, 0, -1);
      if (isBlocked !== null && isBlocked.includes(author.id)) {
        return interaction.reply({
          content: "You cannot marry this user.",
          ephemeral: true,
        });
      }
      if ((await get(`${author.id}_interactions`)) === null) {
        await set(`${author.id}_interactions`, "1");
      }
      if ((await get(`${user.id}_interactions`)) === null) {
        await set(`${user.id}_interactions`, "1");
      } else if ((await get(`${user.id}_interactions`)) === "0") {
        return interaction.reply({
          content: "This user has interactions disabled!",
          ephemeral: true,
        });
      }
      if ((await get(`${user.id}_marriageStatus`)) === "married") {
        return interaction.reply({
          content: "This user is already married!",
          ephemeral: true,
        });
      }
      if (user.id == "922909400941867128") {
        return interaction.reply({
          content: "<:ew:937451020534034525>",
          ephemeral: true,
        });
      }
      if (user.bot == true) {
        return interaction.reply({
          content: "You can't marry a bot!",
          ephemeral: true,
        });
      }
      await set(`${user.id}_marriageRequest`, author.id);
      await set(`${author.id}_marriageRequest`, user.id);
      await set(`${author.id}_sender`, "true");
      await set(`${user.id}_sender`, "false");
      return interaction.reply({
        content: "<@" + user.id + ">, " + author.username + " has requested to marry you!\nUse /accept to accept.",
      });
    }
  },
};
