const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { get, incr, checkXP } = require("../../globals.js");
const chance = require("chance").Chance();
const { CommandCooldown, msToMinutes } = require("discord-command-cooldown");
const ms = require("ms");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mine")
    .setDescription("Mine for stone. Craft a pickaxe for more resources."),
  async execute(interaction) {
    const user = interaction.user;
    const pickaxe = await get(`${user.id}_pickaxe`);
    const embed = new EmbedBuilder();

    // If the user has a pickaxe, they mine faster, get more stone, and get more XP.
    const [mineCooldownTime, minStone, maxStone, xpAmount] =
      pickaxe >= 1 ? [ms("15s"), 10, 20, 20] : [ms("30s"), 5, 10, 10];

    const mineCooldown = new CommandCooldown("mine", mineCooldownTime);
    const stone = chance.integer({ min: minStone, max: maxStone });
    const xp = xpAmount;

    const userCooldowned = await mineCooldown.getUser(user.id);
    if (userCooldowned) {
      const timeLeft = msToMinutes(userCooldowned.msLeft, false);
      await interaction.reply({
        content: `You need to wait ${timeLeft.seconds}s before using this command again!`,
        ephemeral: true,
      });
    } else {
      embed.setTitle("Stone mined!");
      embed.setDescription(
        `<@${user.id}> mined some rocks and got **${stone} stone!**${
          (await get(`${user.id}_xp_alerts`)) == "1" ? `\n+${xp}XP` : ""
        } ${
          (await checkXP(user.id, xp)) == true
            ? ` :up: **Level up!** Check /levels.`
            : ""
        }`
      );
      embed.setColor(await get(`${user.id}_color`));
      await incr(`${user.id}`, "stone", stone);
      await incr(`${user.id}`, "commandsUsed", 1);
      await mineCooldown.addUser(user.id);
      await interaction.reply({ embeds: [embed] });
    }
  },
};
