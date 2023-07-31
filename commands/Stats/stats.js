const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { get, hpEmoji, armorEmoji, attackEmoji, critEmoji, levelEmoji } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("View your/another user's stats.")
    .addUserOption((option) => option.setName("user").setDescription("The user to view stats for.").setRequired(false)),
  async execute(interaction) {
    const user = interaction.options.getUser("user") ?? interaction.user;
    const embed = new EmbedBuilder()
      .setTitle(`Stats: ${user.username}`)
      .addFields(
        {
          name: `${hpEmoji} MaxHP (${await get(`${user.id}_max_hp`)})`,
          value: `The maximum amount of health points ${user.username} can have.`,
          inline: false,
        },
        {
          name: `${hpEmoji} HP (${await get(`${user.id}_hp`)})`,
          value: `${user.username}'s current health points.`,
          inline: false,
        },
        {
          name: `${armorEmoji} Armor (${await get(`${user.id}_armor`)})`,
          value: `Reduces ${user.username}'s damage taken in fights.`,
          inline: false,
        },
        {
          name: `${attackEmoji} Damage (${await get(`${user.id}_damage`)})`,
          value: `Increases the damage ${user.username} deals in fights.`,
          inline: false,
        },
        {
          name: `${critEmoji} Crit Chance (10%)`,
          value: `The chance to do a "critical hit" in fights. Critical hits deal double damage.`,
          inline: false,
        },
        {
          name: `${levelEmoji} Level (${await get(`${user.id}_level`)})`,
          value: `MaxHP, HP, armor, and damage increase as level increases. Level up by using RPG commands. The max level is 25.`,
          inline: false,
        }
      )
      .setColor(await get(`${interaction.user.id}_color`))
      .setFooter({ text: "Requested by " + interaction.user.username })
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 4096 }))
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};
