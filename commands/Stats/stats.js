const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { get, hpEmoji, armorEmoji, attackEmoji, levelEmoji } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder().setName("stats").setDescription("View your stats."),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("Stats")
      .addFields(
        {
          name: `${hpEmoji} MaxHP (${await get(`${interaction.user.id}_max_hp`)})`,
          value: `The maximum amount of health points you can have.`,
          inline: false,
        },
        {
          name: `${hpEmoji} HP (${await get(`${interaction.user.id}_hp`)})`,
          value: `Your current health points.`,
          inline: false,
        },
        {
          name: `${armorEmoji} Armor (${await get(`${interaction.user.id}_armor`)})`,
          value: `Reduces your damage taken in fights.`,
          inline: false,
        },
        {
          name: `${attackEmoji} Damage (${await get(`${interaction.user.id}_damage`)})`,
          value: `Increases the damage you deal in fights.`,
          inline: false,
        },
        {
          name: `${levelEmoji} Level (${await get(`${interaction.user.id}_level`)})`,
          value: `Your stats increase as you level up. Level up by using RPG commands.`,
          inline: false,
        }
      )
      .setColor(await get(`${interaction.user.id}_color`))
      .setFooter({ text: "Requested by " + interaction.user.username })
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};
