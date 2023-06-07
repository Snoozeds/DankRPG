const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { request } = require("undici");
const { get, incr } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder().setName("neko").setDescription("Sends a random neko image"),
  async execute(interaction) {
    const { body } = await request("https://nekos.rest/api/neko");
    const data = await body.json();
    const user = interaction.user;
    const embed = new EmbedBuilder()
      .setTitle(":cat:")
      .setDescription(`[Source](${data.output.source}) | [Artist](${data.output.artist})`)
      .setImage(data.output.url)
      .setFooter({ text: "nekos.rest" })
      .setColor(await get(`${user.id}_color`))
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
    await incr(`${interaction.user.id}`, "commandsUsed", 1);
  },
};
