const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { cooldown, get } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder().setName("cooldowns").setDescription("View your active cooldowns."),
  async execute(interaction) {
    const dailyCooldown = await cooldown.get(interaction.user.id, "daily");
    const fightCooldown = await cooldown.get(interaction.user.id, "fight");
    const adventureCooldown = await cooldown.get(interaction.user.id, "adventure");
    const forageCooldown = await cooldown.get(interaction.user.id, "forage");
    const mineCooldown = await cooldown.get(interaction.user.id, "mine");
    const chopCooldown = await cooldown.get(interaction.user.id, "chop");
    const duelCooldown = await cooldown.get(interaction.user.id, "duel");
    const fishCooldown = await cooldown.get(interaction.user.id, "fish");

    function formatCooldown(cooldown) {
      if (cooldown == null || cooldown === 0) {
        return "**Ready!**";
      } else {
        return `<t:${Math.round((Date.now() + cooldown) / 1000)}:R>`;
      }
    }

    const fields = [
      {
        name: "Daily",
        value: formatCooldown(dailyCooldown),
        inline: true,
      },
      {
        name: "Fight",
        value: formatCooldown(fightCooldown),
        inline: true,
      },
      {
        name: "Adventure",
        value: formatCooldown(adventureCooldown),
        inline: true,
      },
      {
        name: "Forage",
        value: formatCooldown(forageCooldown),
        inline: true,
      },
      {
        name: "Mine",
        value: formatCooldown(mineCooldown),
        inline: true,
      },
      {
        name: "Chop",
        value: formatCooldown(chopCooldown),
        inline: true,
      },
      {
        name: "Duel",
        value: formatCooldown(duelCooldown),
        inline: true,
      },
      {
        name: "Fish",
        value: formatCooldown(fishCooldown),
        inline: true,
      },
    ];

    const embed = new EmbedBuilder()
      .setTitle("Cooldowns")
      .setDescription("You can use these commands again at the following times.")
      .setFields(fields)
      .setColor((await get(`${interaction.user.id}_color`)) ?? "#2b2d31")
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }));

    await interaction.reply({ embeds: [embed] });
  },
};
