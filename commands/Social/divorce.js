const { SlashCommandBuilder } = require("discord.js");
const { set, get, incr } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("divorce")
    .setDescription("Divorce your spouse"),
  async execute(interaction) {
    const user = interaction.user;
    const spouse = await get(`${user.id}_marriedTo`);
    if (spouse == null) {
      return interaction.reply({
        content: "You are not married!",
        ephemeral: true,
      });
    } else {
      await set(`${user.id}_marriageStatus`, "single");
      await set(`${user.id}_marriageTime`, null);
      await set(`${user.id}_marriageRequest`, null);
      await set(`${user.id}_sender`, null);
      await set(`${spouse}_marriageStatus`, "single");
      await set(`${spouse}_marriedTo`, null);
      await set(`${spouse}_marriageTime`, null);
      await set(`${spouse}_sender`, null);
      await set(`${spouse}_marriageRequest`, null);
      await set(`${user.id}_marriedTo`, null);
      await incr(`${interaction.user.id}`, "commandsUsed", 1);
      return interaction.reply({
        content: "You are now divorced from <@" + spouse + ">.",
      });
    }
  },
};
