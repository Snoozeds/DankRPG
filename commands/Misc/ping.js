const { SlashCommandBuilder } = require("@discordjs/builders");
const { incr } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Responds with DankRPG's ping."),
  async execute(interaction) {
    const sent = await interaction.reply({
      content: "Pinging...",
      fetchReply: true,
    });
    await interaction.editReply(
      `**Websocket ping: \`${interaction.client.ws.ping}ms\`**`
    );
    await incr(`${interaction.user.id}`, "commandsUsed", 1);
  },
};
