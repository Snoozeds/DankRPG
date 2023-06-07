const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { get, incr } = require("../../globals.js");
const { promisify } = require("util");
const fs = require("fs");
const readFile = promisify(fs.readFile);

function formatCooldown(cooldown) {
  if (cooldown === null) {
    return "**Ready!**";
  } else if (Date.parse(cooldown) / 1000 < Date.now() / 1000) {
    return "**Ready!**";
  } else {
    return `<t:${Math.round(Date.parse(cooldown) / 1000)}:R>`;
  }
}

module.exports = {
  data: new SlashCommandBuilder().setName("cooldowns").setDescription("Shows all cooldowns"),

  async execute(interaction) {
    const { user } = interaction;

    try {
      const data = await readFile("./node_modules/discord-command-cooldown/activeTimeouts.json");
      const cd = JSON.parse(data);

      // Check if there are any cooldowns set
      const cooldownTypes = [
        { name: "Daily:", key: "daily" },
        { name: "Fight:", key: "fight" },
        { name: "Adventure:", key: "adventure" },
        { name: "Forage:", key: "forage" },
        { name: "Mine:", key: "mine" },
        { name: "Chop:", key: "chop" },
      ];
      const fields = cooldownTypes.map((type) => {
        const cooldown = cd.hasOwnProperty(type.key) ? cd[type.key][user.id]?.timeEnd ?? null : null;
        return {
          name: type.name,
          value: formatCooldown(cooldown),
          inline: true,
        };
      });

      const embed = new EmbedBuilder()
        .setTitle(`Cooldowns: ${user.username}`)
        .setColor(await get(`${user.id}_color`))
        .setFields(fields)
        .setThumbnail(
          user.displayAvatarURL({
            format: "jpg",
            size: 4096,
          })
        )
        .setTimestamp();

      await interaction.reply({
        embeds: [embed],
      });

      await incr(`${user.id}`, "commandsUsed", 1);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "An error occurred while fetching cooldowns.",
        ephemeral: true,
      });
    }
  },
};
