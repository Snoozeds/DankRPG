const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { cooldown, get } = require("../../globals.js");
const fs = require("node:fs");
const path = require("node:path");

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
    const innCooldown = await cooldown.get(interaction.user.id, "inn");

    // Format the cooldown into a discord unix timestamp.
    function formatCooldown(cooldown) {
      if (cooldown == null || cooldown === 0) {
        return "**Ready!**";
      } else {
        return `<t:${Math.round((Date.now() + cooldown) / 1000)}:R>`;
      }
    }

    // Get the ID of a command. Used for mentioning the command in field names.
    // See "deploy-commands.js" to see how commands are stored.
    const getCommandId = (commandName) => {
      // Read the JSON file containing the command IDs
      const commandDataPath = path.join(__dirname, "..", "..", "command_data", "commands.json");
      const commandData = fs.readFileSync(commandDataPath, "utf8");
      const data = JSON.parse(commandData);

      // Retrieve the command ID from the parsed data
      const command = data.find((cmd) => cmd.name === commandName);
      return command ? command.id : null; // Return null if the command is not found
    };

    const fields = [
      {
        name: `</daily:${await getCommandId("daily")}>`,
        value: formatCooldown(dailyCooldown),
        inline: true,
      },
      {
        name: `</fight:${await getCommandId("fight")}>`,
        value: formatCooldown(fightCooldown),
        inline: true,
      },
      {
        name: `</adventure:${await getCommandId("adventure")}>`,
        value: formatCooldown(adventureCooldown),
        inline: true,
      },
      {
        name: `</forage:${await getCommandId("forage")}>`,
        value: formatCooldown(forageCooldown),
        inline: true,
      },
      {
        name: `</mine:${await getCommandId("mine")}>`,
        value: formatCooldown(mineCooldown),
        inline: true,
      },
      {
        name: `</chop:${await getCommandId("chop")}>`,
        value: formatCooldown(chopCooldown),
        inline: true,
      },
      {
        name: `</duel:${await getCommandId("duel")}>`,
        value: formatCooldown(duelCooldown),
        inline: true,
      },
      {
        name: `</fish:${await getCommandId("fish")}>`,
        value: formatCooldown(fishCooldown),
        inline: true,
      },
      {
        name: `</inn:${await getCommandId("inn")}>`,
        value: formatCooldown(innCooldown),
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
