const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { get, set, incr, decr, hpEmoji, coinEmoji, checkXP, resetStats } = require("../../globals.js");
const chance = require("chance").Chance();

module.exports = {
  data: new SlashCommandBuilder().setName("fight").setDescription("Start a fight. Rewards and damage increase per level. Higher chance of winning per damage."),
  async execute(interaction) {
    // Define enemy type here so it can be random.
    const enemyTypes = require("./enemies.json").enemyTypes;
    const enemy = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];

    // User who ran the command.
    const user = interaction.user;

    // User's MaxHP.
    const hp = await get(`${user.id}_max_hp`);

    // User's Lost HP BEFORE armor is calculated.
    const hpLoss = Math.floor(chance.integer({ min: hp / 7, max: hp / 6 }));

    // User's Lost HP AFTER armor is calculated.
    const hpLossT = hpLoss - (await get(`${user.id}_armor`));

    // User's coins reward.
    const coins = Math.floor(chance.integer({ min: hp / 5, max: hp / 4 }));

    // User's XP reward.
    const xp = Math.floor(chance.integer({ min: hp / 10, max: hp / 6 }));

    // User's new HP and Coins amount after the fight. Used for the embed.
    const newHP = (await get(`${user.id}_hp`)) - hpLossT;
    const newCoins = Number(await get(`${user.id}_coins`)) + coins;

    // User's success rate for the fight.
    const successrate = (await get(`${user.id}_damage`)) * 4;

    const { CommandCooldown, msToMinutes } = require("discord-command-cooldown");
    const ms = require("ms");
    const fightCommandCooldown = new CommandCooldown("fight", ms(`${chance.integer({ min: 10, max: 20 })}s`));
    const userCooldowned = await fightCommandCooldown.getUser(interaction.user.id);
    if (userCooldowned) {
      const timeLeft = msToMinutes(userCooldowned.msLeft, false);
      await interaction.reply({
        content: `You need to wait ${timeLeft.seconds}s before using this command again!`,
        ephemeral: true,
      });
    } else {
      // Die condition
      if ((await get(`${user.id}_hp`)) <= hpLossT) {
        if ((await get(`${user.id}_lifesaver`)) >= 1) {
          await decr(`${user.id}_lifesaver`, 1);
          await interaction.reply({
            content: `You died, but you used a lifesaver! Your stats stay the same.\n**You should heal.**`,
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: `You died! You lose everything.`,
          });
          await resetStats(user.id);
        }
      } else {
        await fightCommandCooldown.addUser(interaction.user.id);
        if (
          chance.bool({
            likelihood: 0 + successrate,
          }) === true
        ) {
          // Chance of winning increases with damage (damage * 4)
          if (newHP < hpLossT) {
            const embed = new EmbedBuilder()
              .setTitle(`Fight against ${enemy}!`)
              .setDescription(
                `You start a fight.\n**\\- ${hpLossT} ${hpEmoji} (${newHP}) :warning:**\n**+ ${coins} ${coinEmoji} (${newCoins})**${
                  (await get(`${interaction.user.id}_xp_alerts`)) == "1" ? `\n**+ ${xp}XP**` : ""
                } ${(await checkXP(interaction.user.id, xp)) == true ? ` :up: **Level up!** Check /levels.` : ""}`
              )
              .setColor(await get(`${user.id}_color`));
            await decr(user.id, "hp", hpLossT);
            await incr(user.id, "coins", coins);
            await incr(user.id, "commandsUsed", 1);
            await interaction.reply({
              embeds: [embed],
            });
          } else {
            const embed = new EmbedBuilder()
              .setTitle(`Fight against ${enemy}!`)
              .setDescription(
                `You start a fight.\n**\\- ${hpLossT} ${hpEmoji} (${newHP})**\n**+ ${coins} ${coinEmoji} (${newCoins})**${
                  (await get(`${interaction.user.id}_xp_alerts`)) == "1" ? `\n**+ ${xp}XP**` : ""
                } ${(await checkXP(interaction.user.id, xp)) == true ? ` :up: **Level up!** Check /levels.` : ""}`
              )
              .setColor(await get(`${user.id}_color`));
            await decr(user.id, "hp", hpLossT);
            await incr(user.id, "coins", coins);
            await incr(user.id, "commandsUsed", 1);
            await interaction.reply({
              embeds: [embed],
            });
          }
        } else {
          if (newHP < hpLossT) {
            const embed = new EmbedBuilder()
              .setTitle(`Fight against ${enemy}!`)
              .setDescription(`You start a fight.\n**You lose your fight!**\n**\\- ${hpLossT} ${hpEmoji}(${newHP}) :warning:**`)
              .setColor(await get(`${user.id}_color`));
            await decr(user.id, "hp", hpLossT);
            await incr(user.id, "commandsUsed", 1);
            await interaction.reply({
              embeds: [embed],
            });
          } else {
            const embed = new EmbedBuilder()
              .setTitle(`Fight against ${enemy}!`)
              .setDescription(`You start a fight.\n**You lose your fight!**\n**\\- ${hpLossT} ${hpEmoji}(${newHP})**`)
              .setColor(await get(`${user.id}_color`));
            await decr(user.id, "hp", hpLossT);
            await incr(user.id, "commandsUsed", 1);
            await interaction.reply({
              embeds: [embed],
            });
          }
        }
      }
    }
  },
};
