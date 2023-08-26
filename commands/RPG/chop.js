const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { set, incr, get, checkXP, cooldown, emoji, quests } = require("../../globals");
const chance = require("chance").Chance();
const ms = require("ms");

module.exports = {
  data: new SlashCommandBuilder().setName("chop").setDescription("Chop down a tree to get wood. Craft an axe for more resources."),
  async execute(interaction) {
    const user = interaction.user;
    const axe = await get(`${user.id}_axe`);
    const axeEfficiencyLevel = Number(await get(`${user.id}_axeEfficiencyLevel`)) ?? 0;
    let questCompleted = false; // Used for the followUp message.

    // Command breaks if the user doesn't have wood, so this fixes that.
    if ((await get(`${user.id}_wood`)) == null || (await get(`${user.id}_wood`)) == "0" || (await get(`${user.id}_wood`)) == "") {
      await set(`${user.id}_wood`, 0);
    }

    // If the user has an axe, they chop faster, get more wood, and get more XP.
    const [chopCooldownTime, minWood, maxWood, xpAmount] = axe >= 1 ? [ms("15s"), 10, 20, 20] : [ms("30s"), 5, 10, 10];

    let wood = chance.integer({ min: minWood, max: maxWood })
    wood += axeEfficiencyLevel * 5;
    const xp = xpAmount;

    if (await cooldown.check(interaction.user.id, "chop")) {
      return interaction.reply({
        content: `You're on cooldown! Please wait ${ms(await cooldown.get(interaction.user.id, "chop"))} before using this command again.`,
        ephemeral: true,
      });
    } else {
      // Daily quest: Chop trees 10 times
      if (await quests.active(5)) {
        await incr(user.id, "treesChopped", "1");
        if ((await quests.completed(5, user.id)) === false && (await get(`${user.id}_treesChopped`)) >= 10) {
          await quests.complete(5, user.id);
          questCompleted = true;
        }
      }
      await cooldown.set(interaction.user.id, "chop", chopCooldownTime);
      const embed = new EmbedBuilder()
        .setTitle(`${emoji.axe} Wood chopped!`)
        .setDescription(
          `<@${user.id}> chopped down a tree and got **${emoji.wood}${wood}**${(await get(`${interaction.user.id}_xp_alerts`)) == "1" ? `\n+${emoji.level}${xp}` : ""} ${
            (await checkXP(interaction.user.id, xp)) == true ? ` ${emoji.levelUp} **Level up!** Check /levels.` : ""
          }`
        )
        .setColor(await get(`${user.id}_color`));
      await incr(user.id, "wood", wood);
      await interaction.reply({ embeds: [embed] });
      if (questCompleted) {
        await interaction.followUp({ content: `Congrats ${user.username}, you completed a quest and earned ${emoji.coins}150! Check /quests.` });
      }
    }
  },
};
