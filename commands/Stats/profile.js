const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const {
  get,
  coinEmoji,
  hpEmoji,
  armorEmoji,
  attackEmoji,
  incr,
  set,
} = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("View your or another user's rpg profile.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The member whose profile you want to view")
        .setRequired(false)
    ),
  async execute(interaction) {
    const target = interaction.options.getUser("user") ?? interaction.user;
    if ((await get(`${target.id}_hasStarted`)) === null) {
      await interaction.reply({
        content: "This user hasn't ran /start yet!",
        ephemeral: true,
      });
    } else {
      const profile = new EmbedBuilder()
        .setTitle(`${target.username}'s Profile`)
        .setFields([
          {
            name: "Coins",
            value: `**${coinEmoji} ${await get(`${target.id}_coins`)}**`,
            inline: true,
          },
          {
            name: "HP",
            value: `**${hpEmoji} ${await get(`${target.id}_hp`)}**`,
            inline: true,
          },
          {
            name: "Armor",
            value: `**${armorEmoji} ${await get(`${target.id}_armor`)}**`,
            inline: true,
          },
          {
            name: "Damage",
            value: `**${attackEmoji} ${await get(`${target.id}_damage`)}**`,
            inline: true,
          },
          {
            name: "Level",
            value: `**${await get(`${target.id}_level`)}** **(${await get(
              `${target.id}_xp`
            )}XP)**`,
            inline: true,
          },
          {
            name: "Commands Used",
            value: `**${await get(`${target.id}_commandsUsed`)}**`,
            inline: true,
          },
        ])
        .setThumbnail(target.displayAvatarURL({ format: "jpg", size: 4096 }))
        .setColor(await get(`${target.id}_color`))
        .setFooter({ text: "Requested by " + interaction.user.username })
        .setTimestamp();
      await interaction.reply({ embeds: [profile] });
      await incr(`${interaction.user.id}`, "commandsUsed", 1);
    }
  },
};
