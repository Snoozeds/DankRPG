const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { get, set, incr } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("inventory")
    .setDescription("Shows your/another user's inventory.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The member whose inventory you want to view")
        .setRequired(false)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;
    (await get(`${user.id}_lifesaver`)) === null
      ? set(`${user.id}_lifesaver`, 0)
      : null;
    (await get(`${user.id}_diamond`)) === null
      ? set(`${user.id}_diamond`, 0)
      : null;
    (await get(`${user.id}_wood`)) === null ? set(`${user.id}_wood`, 0) : null;
    (await get(`${user.id}_stone`)) === null
      ? set(`${user.id}_stone`, 0)
      : null;
    const embed = new EmbedBuilder()
      .setTitle(`${interaction.user.username}'s Inventory`)
      .setDescription(
        `Lifesavers: ${await get(
          `${user.id}_lifesaver`
        )}\nDiamonds: ${await get(`${user.id}_diamond`)}\nStone: ${await get(
          `${user.id}_stone`
        )}\nWood: ${await get(`${user.id}_wood`)}`
      )
      .setThumbnail(
        interaction.user.displayAvatarURL({ format: "jpg", size: 4096 })
      )
      .setColor(await get(`${interaction.user.id}_color`))
      .setFooter({ text: "Requested by " + interaction.user.username })
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
    await incr(`${interaction.user.id}`, "commandsUsed", 1);
  },
};
