const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { set, get, incr, checkXP, cooldown, stoneEmoji, levelEmoji, levelUpEmoji } = require("../../globals.js");
const chance = require("chance").Chance();
const ms = require("ms");

module.exports = {
  data: new SlashCommandBuilder().setName("mine").setDescription("Mine for stone. Craft a pickaxe for more resources."),
  async execute(interaction) {
    const user = interaction.user;
    const pickaxe = await get(`${user.id}_pickaxe`);
    const embed = new EmbedBuilder();

    if ((await get(`${user.id}_stone`)) == null || (await get(`${user.id}_stone`)) == "0" || (await get(`${user.id}_stone`)) == "") {
      await set(`${user.id}_stone`, 0);
    }

    // If the user has a pickaxe, they mine faster, get more stone, and get more XP.
    const [mineCooldownTime, minStone, maxStone, xpAmount] = pickaxe >= 1 ? [ms("15s"), 10, 20, 20] : [ms("30s"), 5, 10, 10];

    const stone = chance.integer({ min: minStone, max: maxStone });
    const xp = xpAmount;

    if (await cooldown.check(user.id, "mine")) {
      return interaction.reply({
        content: `You need to wait ${ms(await cooldown.get(user.id, "mine"))} before you can mine again.`,
        ephemeral: true,
      });
    } else {
      embed.setTitle("Stone mined!");
      embed.setDescription(
        `<@${user.id}> mined some rocks and got **${stoneEmoji}${stone}!**${(await get(`${user.id}_xp_alerts`)) == "1" ? `\n+${levelEmoji}${xp}` : ""} ${
          (await checkXP(user.id, xp)) == true ? ` ${levelUpEmoji} **Level up!** Check /levels.` : ""
        }`
      );
      embed.setColor(await get(`${user.id}_color`));
      await incr(`${user.id}`, "stone", stone);
      await cooldown.set(user.id, "mine", mineCooldownTime);
      await interaction.reply({ embeds: [embed] });
    }
  },
};
