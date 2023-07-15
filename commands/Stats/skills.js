const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { get, incr, hpEmoji, armorEmoji, attackEmoji } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder().setName("skills").setDescription("Explains your skills."),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("Skills")
      .addFields(
        {
          name: `${hpEmoji} MaxHP (${await get(`${interaction.user.id}_max_hp`)})`,
          value: `The maximum amount of HP you can have.`,
          inline: false,
        },
        {
          name: `${hpEmoji} HP (${await get(`${interaction.user.id}_hp`)})`,
          value: `Your current HP.`,
          inline: false,
        },
        {
          name: `${armorEmoji} Armor (${await get(`${interaction.user.id}_armor`)})`,
          value: `Reduces your damage taken **(armor \* 100%)**.`,
          inline: false,
        },
        {
          name: `${attackEmoji} Damage (${await get(`${interaction.user.id}_damage`)})`,
          value: `Increases your chance of winning fights.`,
          inline: false,
        },
        {
          name: `:up: Level (${await get(`${interaction.user.id}_level`)})`,
          value: `You gain more rewards per level. You gain XP by using commands.`,
          inline: false,
        }
      )
      .setColor(await get(`${interaction.user.id}_color`))
      .setFooter({ text: "Requested by " + interaction.user.username })
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};
