const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { get } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("marriage")
    .setDescription("Shows your/another user's marriage status.")
    .addUserOption((option) => option.setName("user").setDescription("The user you want to check the marriage status of.").setRequired(false)),
  async execute(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;
    const marriageStatus = await get(`${user.id}_marriageStatus`);
    const marriageRequest = await get(`${user.id}_marriageRequest`);
    const marriageTime = await get(`${user.id}_marriageTime`);

    if (marriageStatus == null || marriageStatus == "single") {
      return interaction.reply({
        content: "This user is not married!",
        ephemeral: true,
      });
    }
    if (marriageStatus === "married") {
      const embed = new EmbedBuilder()
        .setTitle(`Marriage Status: ${user.username}`)
        .setDescription(`Marriage stats:`)
        .setFields(
          { name: "Married to:", value: `<@${marriageRequest}>`, inline: true },
          {
            name: "Married since:",
            value: `<t:${marriageTime}:R>`,
            inline: true,
          },
          {
            name: "Anniversaries reached:",
            value: `${marriageTime > 3155760000 ? "**1 month**\n**1 year**" : marriageTime > 262980000 ? "**1 month**" : "None"}`,
          }
        )
        .setColor((await get(`${interaction.user.id}_color`)) ?? "#2b2d31")
        .setTimestamp()
        .setThumbnail(user.displayAvatarURL({ format: "jpg", size: 4096 }));
      return interaction.reply({ embeds: [embed] });
    }
  },
};
