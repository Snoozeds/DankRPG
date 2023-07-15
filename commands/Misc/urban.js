const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { request } = require("undici");
const { get, incr } = require("../../globals");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("urban")
    .setDescription("[NSFW] Define a term from Urban Dictionary.")
    .addStringOption((option) => option.setName("term").setDescription("The term to define").setRequired(true))
    .setNSFW(true),
  async execute(interaction) {
    const term = interaction.options.getString("term");
    const query = new URLSearchParams({ term });
    const trim = (str, max) => (str.length > max ? `${str.slice(0, max - 3)}...` : str);
    const dictResult = await request(`https://api.urbandictionary.com/v0/define?${query}`);
    const { list } = await dictResult.body.json();
    const [answer] = list;
    const user = interaction.user;

    if (interaction.channel.nsfw === false) {
      return interaction.reply({
        content: `This command can only be used in NSFW channels!`,
        ephemeral: true,
      });
    }

    if (!list.length) {
      return interaction.reply(`No results found for **${term}**.`);
    }

    const embed = new EmbedBuilder()
      .setTitle(list[0].word)
      // I prefer to use the URL this way, as the API uses a http redirect.
      .setURL(`https://www.urbandictionary.com/define.php?term=${encodeURIComponent(term)}`)
      .setDescription(`Uploaded by: ${answer.author}\n\n${trim(answer.definition.replace(/[\[\]]+/g, ""), 1024)}`)
      .addFields(
        {
          name: "Example",
          value: trim(answer.example.replace(/[\[\]]+/g, ""), 1024),
        },
        { name: ":thumbsup:", value: `${answer.thumbs_up}`, inline: true },
        { name: ":thumbsdown:", value: `${answer.thumbs_down}`, inline: true }
      )
      .setColor(await get(`${user.id}_color`));
    await interaction.reply({ embeds: [embed] });
    await incr(`${interaction.user.id}`, "commandsUsed", 1);
  },
};
