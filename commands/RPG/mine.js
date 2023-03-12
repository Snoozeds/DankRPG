const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { get, incr, checkXP } = require("../../globals.js");
const chance = require("chance").Chance();
const { CommandCooldown, msToMinutes } = require("discord-command-cooldown");
const ms = require("ms");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mine")
    .setDescription("Mine for stone. Requires a pickaxe."),
  async execute(interaction) {
    const mineCooldown = new CommandCooldown("mine", ms("15s"));
    const userCooldowned = await mineCooldown.getUser(interaction.user.id);
    if (userCooldowned) {
      const timeLeft = msToMinutes(userCooldowned.msLeft, false);
      await interaction.reply({
        content: `You need to wait ${timeLeft.seconds}s before using this command again!`,
        ephemeral: true,
      });
    }
    const user = interaction.user;
    const pickaxe = await get(`${user.id}_pickaxe`);
    const xp = 10;
    const embed = new EmbedBuilder();
    if (pickaxe >= 1) {
      const stone = chance.integer({ min: 5, max: 10 });
      embed.setTitle("Stone mined!");
      embed.setDescription(
        `<@${user.id}> mined some rocks and got **${stone} stone!**${
          (await get(`${interaction.user.id}_xp_alerts`)) == "1"
            ? `\n+${xp}XP`
            : ""
        } ${
          (await checkXP(interaction.user.id, xp)) == true
            ? ` :up: **Level up!** Check /levels.`
            : ""
        }`
      );
      embed.setColor(await get(`${user.id}_color`));
      await incr(`${user.id}`, "stone", stone);
      await incr(`${user.id}`, "xp", xp);
      await incr(`${user.id}`, "commandsUsed", 1);
      await interaction.reply({ embeds: [embed] });
    } else if (pickaxe === null) {
      await interaction.reply({
        content:
          "You don't have a pickaxe to mine!\nYou can /craft one with 25 wood and 50 stone.",
        ephemeral: true,
      });
    }
  },
};
