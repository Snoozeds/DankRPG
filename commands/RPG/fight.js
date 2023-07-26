const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { set, get, incr, decr, cooldown, coinEmoji, hpEmoji, armorEmoji, attackEmoji, levelEmoji, levelUpEmoji, resetStats, checkXP, trueEmoji } = require("../../globals.js");
const ms = require("ms");
const chance = require("chance").Chance();

module.exports = {
  data: new SlashCommandBuilder().setName("fight").setDescription("Turn-based fight system. Rewards and difficulty scale with your level."),
  async execute(interaction) {
    const user = interaction.user;

    // Get random enemy
    const enemyType = require("./enemies.json").enemyTypes;
    const enemy = enemyType[Math.floor(Math.random() * enemyType.length)];

    // Get user stats
    const userLevel = await get(`${user.id}_level`);
    const userArmor = await get(`${user.id}_armor`);
    const userDamage = (await get(`${user.id}_damage`)) * 2;

    let userDefending = false;
    let fightEnded = false;

    // Calculate enemy stats
    let enemyHP = Math.floor(chance.integer({ min: userLevel * 15, max: userLevel * 30 }));
    const enemyMaxHP = enemyHP;
    const enemyArmor = Math.floor(chance.integer({ min: userArmor / 4, max: userArmor / 3 }));
    const enemyDamage = Math.floor(chance.integer({ min: userDamage / 2, max: userDamage }) - userDamage * (userArmor / 100));

    // Used for the 'Feared' achievement
    const fightsWon = Number(await get(`${user.id}_fights_won`));

    // Check if user is on cooldown
    if (await cooldown.check(user.id, "fight")) {
      return interaction.reply({
        content: `You need to wait ${ms(await cooldown.get(interaction.user.id, "fight"))} before you can fight again.`,
        ephemeral: true,
      });
    } else {
      // Cooldown
      await cooldown.set(user.id, "fight", `${chance.integer({ min: 25, max: 35})}s`);

      // Inital reply for buttons
      // Embed
      const embed = new EmbedBuilder()
        .setTitle(`Fighting ${enemy}`)
        .setDescription(`You are fighting a ${enemy}!`)
        .setColor(await get(`${user.id}_color`))
        .addFields(
          { name: `${hpEmoji} Your HP`, value: `${await get(`${user.id}_hp`)}/${await get(`${user.id}_max_hp`)}`, inline: true },
          { name: `${armorEmoji} Your Armor`, value: `${await get(`${user.id}_armor`)}`, inline: true },
          { name: `${attackEmoji} Your Damage`, value: `${(await get(`${user.id}_damage`)) * 2}`, inline: true },
          { name: `${hpEmoji} Enemy HP`, value: `${enemyHP}/${enemyMaxHP}`, inline: true },
          { name: `${armorEmoji} Enemy Armor`, value: `${enemyArmor}`, inline: true },
          { name: `${attackEmoji} Enemy Damage`, value: `${enemyDamage}`, inline: true }
        );

      // Buttons
      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("attack").setLabel("Attack").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("defend").setLabel("Defend").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("flee").setLabel("Flee").setStyle(ButtonStyle.Danger)
      );

      // Send initial reply
      const reply = await interaction.reply({
        embeds: [embed],
        components: [buttons],
        fetchReply: true,
      });

      async function playerAttacks() {
        // Variables
        const userDamage = (await get(`${user.id}_damage`)) * 2;

        // Calculate damage
        // "Crit" hit support. 25% chance to do double damage.
        const damage = chance.string({ pool: "1234" }) === "1" ? userDamage * 2 : userDamage;

        // Check if enemy would die
        if (enemyHP - damage <= 0) {
          // Enemy dies
          enemyHP = 0;
          fightEnd(false);
        }

        // Enemy takes damage
        enemyHP -= damage;

        // Update embed
        embed.setDescription(`You attacked the ${enemy} for ${damage} damage!`);
        embed.spliceFields(3, 1, { name: `${hpEmoji} Enemy HP`, value: `${Math.max(0, enemyHP)}/${enemyMaxHP}`, inline: true });

        // Update reply
        interaction.editReply({
          embeds: [embed],
          components: [buttons],
        });
      }

      async function playerDefends() {
        // Variables
        userDefending = true;

        // Update embed
        embed.setDescription(`You are defending!`);
        embed.spliceFields(1, 1, { name: `${armorEmoji} Your Armor`, value: `${await get(`${user.id}_armor`)} (Defending)`, inline: true });

        // Update reply
        interaction.editReply({
          embeds: [embed],
          components: [buttons],
        });
      }

      async function playerFlees() {
        // Variables
        const userCoins = await get(`${user.id}_coins`);

        // Lose 1-2% of coins
        const coins = chance.integer({ min: Math.floor(userCoins / 100), max: Math.floor(userCoins / 50) });

        // Update embed
        embed.setDescription(`You fled from the ${enemy} **but lost ${coinEmoji}${coins} while running away!**`);

        await decr(user.id, "coins", coins);

        // Update reply
        interaction.editReply({
          embeds: [embed],
          components: [],
        });
      }

      async function enemyAttacks() {
        // User variables
        const userHP = await get(`${user.id}_hp`);
        const userArmor = await get(`${user.id}_armor`);

        // Calculate damage
        const damage = enemyDamage;

        // Check if user would die
        if (userHP - damage <= 0) {
          // User dies
          await set(`${user.id}_hp`, 0);
          fightEnd(true);
        }

        // Check if user is defending
        if (userDefending) {
          // User takes damage
          await decr(user.id, "hp", Math.floor(damage - userArmor / 2));
          userDefending = false;
          embed.spliceFields(1, 1, { name: `${armorEmoji} Your Armor`, value: `${await get(`${user.id}_armor`)}`, inline: true });
          embed.setDescription(`The ${enemy} attacked you for ${Math.floor(damage - userArmor / 2)} damage!`);
          embed.spliceFields(0, 1, { name: `${hpEmoji} Your HP`, value: `${await get(`${user.id}_hp`)}/${await get(`${user.id}_max_hp`)}`, inline: true });
        } else {
          // User takes damage
          await decr(user.id, "hp", damage);
          embed.setDescription(`The ${enemy} attacked you for ${damage} damage!`);
          embed.spliceFields(0, 1, { name: `${hpEmoji} Your HP`, value: `${await get(`${user.id}_hp`)}/${await get(`${user.id}_max_hp`)}`, inline: true });
        }
        

        // Update reply
        interaction.editReply({
          embeds: [embed],
          components: [buttons],
        });
      }

      async function fightEnd(playerDied) {
        // playerDied = true if player died, false if enemy died

        fightEnded = true;

        // Calculate coins based off level
        const userLevel = await get(`${user.id}_level`);
        const coins = chance.integer({ min: userLevel * 13, max: userLevel * 20 });

        // Calculate XP
        const xp = chance.integer({ min: userLevel * 5, max: userLevel * 7 });

        // if player died
        if (playerDied) {
          if (await get(`${user.id}_lifesaver`)) {
            await decr(`${user.id}_lifesaver`, 1);
            await set(`${user.id}_hp`, 1);
            await interaction.followUp({
              content: `You died but your lifesaver saved you! You now have 1 HP.`,
              ephemeral: true,
            });
            collector.stop();
            return;
          } else if(await get(`${user.id}_lifesaver`) === 0) {
            await interaction.followUp({
              content: `You died! You have no lifesavers and get your stats reset.`,
              ephemeral: true,
            });
            await resetStats(user.id);
            collector.stop();
            return;
          }
          // Update embed
          await interaction.followUp({
            content: `You died! You have no lifesavers and get your stats reset.`,
            ephemeral: true,
          });
          await resetStats(user.id);
          collector.stop();

          // Disable buttons
          buttons.components.forEach((button) => {
            button.setDisabled(true);
          });
          return;
        }

        // if enemy died
        if (!playerDied) {
          // XP
          const xpAlerts = await get(`${user.id}_xp_alerts`);
          const xpMessage = xpAlerts === "1" ? `\n+ ${levelEmoji}**${xp}**\n` : "";
          const levelUpMessage = (await checkXP(user.id, xp)) === true ? ` ${levelUpEmoji} **Level up!** Check /levels.\n` : "";
          const coinsMessage = coins > 0 ? `+ ${coinEmoji}**${coins}**\n` : ""; // If coins is somehow 0, don't show it.
          const achievement = await get(`${user.id}_feared_achievement`) === "true";
          const achievementUnlocked = fightsWon >= 100 && !achievement;
          const achievementMessage = achievementUnlocked ? `Congrats, you unlocked the **Feared** achievement! (+${coinEmoji}1000)` : "";

          if(achievementUnlocked) {
            await set(`${user.id}_feared_achievement`, true);
            await incr(user.id, "coins", 1000);
          }

          // Update reply
          await interaction.editReply({
            content: `You killed the ${enemy}!\n**Rewards:** ${xpMessage}${levelUpMessage}${coinsMessage}${achievementMessage}`,
            components: [],
          });

          // Give rewards
          await incr(user.id, "coins", coins);
          await incr(user.id, "fights_won", 1);

          await collector.stop();
          return;
        }

        // Disable buttons
        buttons.components.forEach((button) => {
          button.setDisabled(true);
        });
      }

      // Button collector
      const filter = (i) => i.user.id === user.id;
      const collector = reply.createMessageComponentCollector({ filter, time: 60000 });

      collector.on("collect", async (i) => {
        // User attacks
        if (i.customId === "attack") {
          // Hacky way to make the button not say "This interaction failed" due to the embed not being edited in the collector.
          await i.reply({
            content: `You attacked.`,
            ephemeral: true,
          });
          // remove buttons so user can't attack before enemy attacks.
          buttons.components.forEach((button) => {
            button.setDisabled(true);
          });
          await playerAttacks();
          setTimeout(async () => {
            if (fightEnded) return;
            await enemyAttacks();
          }, 3000);

          // User defends
        } else if (i.customId === "defend") {
          // Hacky way to make the button not say "This interaction failed" due to the embed not being edited in the collector.
          await i.reply({
            content: "You are defending.",
            ephemeral: true,
          });
          // remove buttons so user can't attack before enemy attacks.
          buttons.components.forEach((button) => {
            button.setDisabled(true);
          });
          await playerDefends();
          setTimeout(async () => {
            if (fightEnded) return;
            await enemyAttacks();
          }, 3000);
        } else if (i.customId === "flee") {
          await playerFlees();
          collector.stop();
        }

        if (!fightEnded) {
          buttons.components.forEach((button) => {
            button.setDisabled(false);
          });
        }
      });

      collector.on("end", async (i) => {
        if (i.size === 0) {
          await interaction.editReply({
            content: "You didn't respond in time!",
            components: [],
            ephemeral: true,
          });

          // Disable buttons
          buttons.components.forEach((button) => {
            button.setDisabled(true);
          });
        }
      });
    }
  },
};
