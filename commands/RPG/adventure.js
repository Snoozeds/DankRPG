const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { set, get, incr, checkXP, cooldown, emoji } = require("../../globals.js");
const ms = require("ms");
const chance = require("chance").Chance();

module.exports = {
  data: new SlashCommandBuilder().setName("adventure").setDescription("Starts an RPG adventure. 60% chance of getting coins, doesn't scale."),
  async execute(interaction) {
    const xp = chance.integer({ min: 10, max: 20 });
    if (await cooldown.check(interaction.user.id, "adventure")) {
      return interaction.reply({
        content: `You're on cooldown! Please wait ${ms(await cooldown.get(interaction.user.id, "adventure"))} before using this command again.`,
        ephemeral: true,
      });
    } else {
      await cooldown.set(interaction.user.id, "adventure", `${chance.integer({ min: 15, max: 20 })}s`);
      // 60% chance to get a random amount of coins.
      if (chance.bool({ likelihood: 60 }) == true) {
        const outcome = Math.floor(chance.normal({ mean: 30, dev: 5 })); // https://chancejs.com/miscellaneous/normal.html
        await incr(`${interaction.user.id}`, `coins`, outcome);
        if ((await get(`${interaction.user.id}_statsEnabled`)) === "1" || (await get(`${interaction.user.id}_statsEnabled`)) == null) {
          if ((await get(`${interaction.user.id}_adventure_coinsFoundTotal`)) == null || (await get(`${interaction.user.id}_adventure_coinsFoundTotal`)) == "") {
            await set(`${interaction.user.id}_adventure_coinsFoundTotal`, 0);
          }
          await incr(`${interaction.user.id}`, `adventure_coinsFoundTotal`, outcome);
        }
        const trueEmbed = new EmbedBuilder()
          .setTitle(`${interaction.user.username}'s adventure`)
          .setDescription(
            `<@${interaction.user.id}> starts an adventure.\nThey find **${emoji.coins}${outcome}**. They now have a balance of **${emoji.coins}${await get(
              `${interaction.user.id}_coins`
            )}**.${(await get(`${interaction.user.id}_xp_alerts`)) == "1" ? `\n+${emoji.level}${xp}` : ""} ${
              (await checkXP(interaction.user.id, xp)) == true ? ` ${emoji.levelUp} **Level up!** Check /levels.` : ""
            }`
          )
          .setColor((await get(`${interaction.user.id}_color`)) ?? "#2b2d31")
          .setTimestamp();
        await interaction.reply({ embeds: [trueEmbed] });
      } else {
        const falseEmbed = new EmbedBuilder()
          .setTitle(`${interaction.user.username}'s adventure`)
          .setDescription(`<@${interaction.user.id}> starts an adventure.\nThey find **Nothing**.`)
          .setColor((await get(`${interaction.user.id}_color`)) ?? "#2b2d31")
          .setTimestamp();
        await interaction.reply({ embeds: [falseEmbed] });
      }
      if ((await get(`${interaction.user.id}_statsEnabled`)) === "1" || (await get(`${interaction.user.id}_statsEnabled`)) == null) {
        if ((await get(`${interaction.user.id}_adventure_timesAdventuredTotal`)) == null || (await get(`${interaction.user.id}_adventure_timesAdventuredTotal`)) == "") {
          await set(`${interaction.user.id}_adventure_timesAdventuredTotal`, 0);
        }
        await incr(`${interaction.user.id}`, `adventure_timesAdventuredTotal`, 1);
      }
    }
  },
};
