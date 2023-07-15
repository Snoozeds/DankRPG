const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { incr, get, checkXP } = require("../../globals");
const chance = require("chance").Chance();
const { CommandCooldown, msToMinutes } = require("discord-command-cooldown");
const ms = require("ms");

module.exports = {
  data: new SlashCommandBuilder().setName("chop").setDescription("Chop down a tree to get wood. Craft an axe for more resources."),
  async execute(interaction) {
    const user = interaction.user;
    const axe = await get(`${user.id}_axe`);

    // If the user has an axe, they chop faster, get more wood, and get more XP.
    const [chopCooldownTime, minWood, maxWood, xpAmount] = axe >= 1 ? [ms("15s"), 10, 20, 20] : [ms("30s"), 5, 10, 10];

    const chopCooldown = new CommandCooldown("chop", chopCooldownTime);
    const wood = chance.integer({ min: minWood, max: maxWood });
    const xp = xpAmount;
    const userCooldowned = await chopCooldown.getUser(user.id);

    if (userCooldowned) {
      const timeLeft = msToMinutes(userCooldowned.msLeft, false);
      await interaction.reply({
        content: `You need to wait ${timeLeft.seconds}s before using this command again!`,
        ephemeral: true,
      });
    } else {
      await chopCooldown.addUser(interaction.user.id);
      const embed = new EmbedBuilder()
        .setTitle("Wood chopped!")
        .setDescription(
          `<@${user.id}> chopped down a tree and got **${wood} wood!**${(await get(`${interaction.user.id}_xp_alerts`)) == "1" ? `\n+${xp}XP` : ""} ${
            (await checkXP(interaction.user.id, xp)) == true ? ` :up: **Level up!** Check /levels.` : ""
          }`
        )
        .setColor(await get(`${user.id}_color`));
      await incr(`${user.id}`, "wood", wood);
      await interaction.reply({ embeds: [embed] });
    }
  },
};
