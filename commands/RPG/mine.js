const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { set, get, incr, checkXP, cooldown, emoji, } = require("../../globals.js");
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

    if ((await get(`${user.id}_diamond`)) == null || (await get(`${user.id}_diamond`)) == "0" || (await get(`${user.id}_diamond`)) == "") {
      await set(`${user.id}_diamond`, 0);
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
      // 30% chance of getting a diamond as well.
      if (chance.bool({ likelihood: 30 })) {
        await incr(`${user.id}`, "diamond", 1);
        embed.setDescription(
          `<@${user.id}> mined some rocks and got **${emoji.stone}${stone}** and **${emoji.diamond}1**!${
            (await get(`${user.id}_xp_alerts`)) == "1" ? `\n+${emoji.level}${xp}` : ""
          } ${(await checkXP(user.id, xp)) == true ? ` ${emoji.levelUp} **Level up!** Check /levels.` : ""}`
        );
      } else {
        embed.setDescription(
          `<@${user.id}> mined some rocks and got **${emoji.stone}${stone}**.${(await get(`${user.id}_xp_alerts`)) == "1" ? `\n+${emoji.level}${xp}` : ""} ${
            (await checkXP(user.id, xp)) == true ? ` ${emoji.levelUp} **Level up!** Check /levels.` : ""
          }`
        );
      }
      embed.setColor(await get(`${user.id}_color`));
      await incr(`${user.id}`, "stone", stone);
      await cooldown.set(user.id, "mine", mineCooldownTime);
      await interaction.reply({ embeds: [embed] });
    }
  },
};
