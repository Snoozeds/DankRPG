const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { get, coinEmoji, incr, checkXP, cooldown, levelUpEmoji } = require("../../globals.js");
const ms = require("ms");
const chance = require("chance").Chance();

module.exports = {
  data: new SlashCommandBuilder().setName("adventure").setDescription("Starts an RPG adventure. Random chance of getting coins, doesn't scale."),
  async execute(interaction) {
    const xp = chance.integer({ min: 10, max: 25 });
    if(await cooldown.check(interaction.user.id, "adventure")) {
      return interaction.reply({
        content: `You're on cooldown! Please wait ${ms(await cooldown.get(interaction.user.id, "adventure"))} before using this command again.`,
        ephemeral: true,
      });
    } else {
      await cooldown.set(interaction.user.id, "adventure", `${chance.integer({ min: 20, max: 30})}s`);
      // 50% chance to get a random amount of coins.
      if (chance.bool({ likelihood: 50 }) == true) {
        const outcome = Math.floor(chance.normal({ mean: 15, dev: 5 })); // https://chancejs.com/miscellaneous/normal.html
        await incr(`${interaction.user.id}`, `coins`, outcome);
        const trueEmbed = new EmbedBuilder()
          .setTitle(`${interaction.user.username}'s adventure`)
          .setDescription(
            `<@${interaction.user.id}> starts an adventure.\nThey find **${coinEmoji}${outcome}**. They now have a balance of **${coinEmoji}${await get(
              `${interaction.user.id}_coins`
            )}**.${(await get(`${interaction.user.id}_xp_alerts`)) == "1" ? `\n+${xp}XP` : ""} ${
              (await checkXP(interaction.user.id, xp)) == true ? ` ${levelUpEmoji} **Level up!** Check /levels.` : ""
            }`
          )
          .setColor(await get(`${interaction.user.id}_color`))
          .setTimestamp();
        await interaction.reply({ embeds: [trueEmbed] });
      } else {
        const falseEmbed = new EmbedBuilder()
          .setTitle(`${interaction.user.username}'s adventure`)
          .setDescription(`<@${interaction.user.id}> starts an adventure.\nThey find **Nothing**.`)
          .setColor(await get(`${interaction.user.id}_color`))
          .setTimestamp();
        await interaction.reply({ embeds: [falseEmbed] });
      }
    }
  },
};
