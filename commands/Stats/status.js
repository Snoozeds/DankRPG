const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { get, emoji } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("View your/another user's status.")
    .addUserOption((option) => option.setName("user").setDescription("The user you want to see the status of.").setRequired(false)),
  async execute(interaction) {
    const user = interaction.options.getUser("user") ?? interaction.user;
    const embed = new EmbedBuilder()
      .setTitle(`Status: ${user.username}`)
      .addFields(
        {
          name: `${emoji.hp} MaxHP (${await get(`${user.id}_max_hp`)})`,
          value: `The maximum amount of health points ${user.username} can have.`,
          inline: false,
        },
        {
          name: `${emoji.hp} HP (${await get(`${user.id}_hp`)})`,
          value: `${user.username}'s current health points.`,
          inline: false,
        },
        {
          name: `${emoji.armor} Armor (${await get(`${user.id}_armor`)})`,
          value: `Reduces ${user.username}'s damage taken in fights.`,
          inline: false,
        },
        {
          name: `${emoji.attack} Damage (${await get(`${user.id}_damage`)})`,
          value: `Increases the damage ${user.username} deals in fights.`,
          inline: false,
        },
        {
          name: `${emoji.crit} Crit Chance (${10 + Number(await get(`${user.id}_critChance`))}%)`,
          value: `The chance to do a "critical hit" in fights.`,
          inline: false,
        },
        {
          name: `${emoji.crit} Crit Multiplier (${2 + Number(await get(`${user.id}_critMultiplier`))})`,
          value: `The multiplier applied to damage when a critical hit is dealt.`,
          inline: false,
        },
        {
          name: `${emoji.level} Level (${await get(`${user.id}_level`)})`,
          value: `MaxHP, HP, armor, and damage increase as level increases. Level up by using RPG commands. The max level is 25.`,
          inline: false,
        }
      )
      .setColor((await get(`${interaction.user.id}_color`)) ?? "#2b2d31")
      .setFooter({ text: "Requested by " + interaction.user.username })
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 4096 }))
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};
