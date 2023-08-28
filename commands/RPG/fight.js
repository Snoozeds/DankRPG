const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { set, get, incr, decr, cooldown, emoji, resetStats, checkXP, quests } = require("../../globals.js");
const ms = require("ms");
const chance = require("chance").Chance();

module.exports = {
  data: new SlashCommandBuilder().setName("fight").setDescription("Turn-based fight system. Rewards and difficulty scale with your level."),
  async execute(interaction) {
    const user = interaction.user;

    // 10% chance for enemy to drop a demon wing.
    const demonWing = chance.bool({ likelihood: 10 });
    const demonWingMessage = demonWing ? `**__Item Drops:__**\n${emoji.demonWing}**You got a Demon Wing!**` : "";
    
    // Daily quests
    // Used for the followUp message.
    let demonQuestCompleted = false;
    let enemiesQuestCompleted = false;

    // Get random enemy
    const enemyType = require("./enemies.json").enemyTypes;
    const enemy = demonWing ? "Demon" : enemyType[Math.floor(Math.random() * enemyType.length)];

    // Get user stats
    const userLevel = await get(`${user.id}_level`);
    const userArmor = await get(`${user.id}_armor`);
    const userDamage = (await get(`${user.id}_damage`)) * 2;

    let userDefending = false;
    let fightEnded = false;

    // Calculate enemy stats
    let enemyHP = Math.floor(chance.integer({ min: userLevel * 15, max: userLevel * 27 }) + chance.integer({ min: userDamage * 1.5, max: userDamage * 2.5 }));
    const enemyMaxHP = enemyHP;
    const enemyArmor = Math.floor(chance.integer({ min: userArmor / 4, max: userArmor / 3 }));
    let enemyDamage = Math.floor(chance.integer({ min: userDamage / 3, max: userDamage / 2 }) - userDamage * (userArmor / 100));
    enemyDamage = Math.max(enemyDamage, 50); // ensure it doesn't go negative, minimum of 50 damage.

    // Used for the 'Feared' achievement
    const fightsWon = Number(await get(`${user.id}_fights_won`));

    // Used to stop enemy attacking after user dies.
    let userDied = false;

    // Check if user is on cooldown
    if (await cooldown.check(user.id, "fight")) {
      return interaction.reply({
        content: `You need to wait ${ms(await cooldown.get(interaction.user.id, "fight"))} before you can fight again.`,
        ephemeral: true,
      });
    } else {
      // Cooldown
      await cooldown.set(user.id, "fight", `${chance.integer({ min: 25, max: 35 })}s`);

      // Inital reply for buttons
      // Embed
      const embed = new EmbedBuilder()
        .setTitle(`Fighting ${enemy}`)
        .setDescription(`You are fighting a ${enemy}!`)
        .setColor(await get(`${user.id}_color`))
        .addFields(
          { name: `${emoji.hp} Your HP`, value: `${await get(`${user.id}_hp`)}/${await get(`${user.id}_max_hp`)}`, inline: true },
          { name: `${emoji.armor} Your Armor`, value: `${await get(`${user.id}_armor`)}`, inline: true },
          { name: `${emoji.attack} Your Damage`, value: `${(await get(`${user.id}_damage`)) * 2} | ${10 + Number(await get(`${user.id}_critChance`))}%`, inline: true },
          { name: `${emoji.hp} Enemy HP`, value: `${enemyHP}/${enemyMaxHP}`, inline: true },
          { name: `${emoji.armor} Enemy Armor`, value: `${enemyArmor}`, inline: true },
          { name: `${emoji.attack} Enemy Damage`, value: `${enemyDamage}`, inline: true }
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
        // "Crit" hit support. Chance is 10% + crit chance if the user has any weapons that give crit chance.
        const critMultiplier = 2 + Number(await get(`${user.id}_critMultiplier`));
        const likelihood = 10 + Number(await get(`${user.id}_critChance`));
        const damage = Math.floor(chance.bool({ likelihood: likelihood }) ? userDamage * critMultiplier : userDamage);

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
        embed.spliceFields(3, 1, { name: `${emoji.hp} Enemy HP`, value: `${Math.max(0, enemyHP)}/${enemyMaxHP}`, inline: true });

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
        embed.spliceFields(1, 1, { name: `${emoji.armor} Your Armor`, value: `${await get(`${user.id}_armor`)} (Defending)`, inline: true });

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
        embed.setDescription(`You fled from the ${enemy} **but lost ${emoji.coins}${coins} while running away!**`);

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
          await fightEnd(true);
        }

        // If user has died, stop enemy from attacking.
        if (userDied) return;

        // Check if user is defending
        if (userDefending) {
          // User takes damage
          await decr(user.id, "hp", Math.floor(damage - userArmor / 2));
          userDefending = false;
          embed.spliceFields(1, 1, { name: `${emoji.armor} Your Armor`, value: `${await get(`${user.id}_armor`)}`, inline: true });
          embed.setDescription(`The ${enemy} attacked you for ${Math.floor(damage - userArmor / 2)} damage!`);
          embed.spliceFields(0, 1, { name: `${emoji.hp} Your HP`, value: `${await get(`${user.id}_hp`)}/${await get(`${user.id}_max_hp`)}`, inline: true });
        } else {
          // User takes damage
          await decr(user.id, "hp", damage);
          embed.setDescription(`The ${enemy} attacked you for ${damage} damage!`);
          embed.spliceFields(0, 1, { name: `${emoji.hp} Your HP`, value: `${await get(`${user.id}_hp`)}/${await get(`${user.id}_max_hp`)}`, inline: true });
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
        const multiplier = chance.integer({ min: 100, max: 140 }) / 100; // 1.0 - 1.4
        let coins = Math.round(30 * Math.pow(multiplier, userLevel - 1));

        // Cap of 2000 coins so people can't farm coins too easily, breaking the economy :-)
        if (coins > 2000) {
          coins = 2000;
        }

        // Calculate XP
        const xp = chance.integer({ min: userLevel * 5, max: userLevel * 7 });

        // If player died
        if (playerDied) {
          userDied = true;
          if (await get(`${user.id}_lifesaver`)) {
            await decr(user.id, "lifesaver", 1);
            await set(`${user.id}_hp`, 1);
            await interaction.editReply({
              content: `You died but your lifesaver saved you! You now have 1 HP.`,
              components: [],
            });
            collector.stop();
            return;
          } else if ((await get(`${user.id}_lifesaver`)) === 0) {
            await interaction.editReply({
              content: `You died! You have no lifesavers and get your stats reset.`,
              components: [],
            });
            await resetStats(user.id);
            collector.stop();
            return;
          }
          // Update embed
          await interaction.editReply({
            content: `You died! You have no lifesavers and get your stats reset.`,
            components: [],
          });
          await resetStats(user.id);
          collector.stop();

          // Disable buttons
          buttons.components.forEach((button) => {
            button.setDisabled(true);
          });
          return;
        }

        // If enemy died
        if (!playerDied) {
          // Rewards
          const xpAlerts = await get(`${user.id}_xp_alerts`);
          const xpMessage = xpAlerts === "1" ? `\n+ ${emoji.level}**${xp}**\n` : "";
          const levelUpMessage = (await checkXP(user.id, xp)) === true ? ` ${emoji.levelUp} **Level up!** Check /levels.\n` : "";
          const coinsMessage = `+ ${emoji.coins}**${coins}**\n`;
          const achievement = (await get(`${user.id}_feared_achievement`)) === "true";
          const achievementUnlocked = fightsWon >= 100 && !achievement;
          const achievementMessage = achievementUnlocked ? `Congrats, you unlocked the **Feared** achievement! (+${emoji.coins}1000)` : "";

          // Check if user unlocked the 'Feared' achievement.
          if (achievementUnlocked) {
            await set(`${user.id}_feared_achievement`, true);
            await incr(user.id, "coins", 1000);
          }

          // Update reply
          await interaction.editReply({
            content: `You killed the ${enemy}!\n**__Rewards:__**${xpMessage}${levelUpMessage}${coinsMessage}${achievementMessage}${demonWingMessage}`,
            components: [],
          });

          // Give rewards
          await incr(user.id, "coins", coins);
          await incr(user.id, "fights_won", 1);
          if (demonWing) {
            await incr(user.id, "demonWing", 1);

            // Daily quest: Find a demon wing
            if (await quests.active(2)) {
              if ((await quests.completed(2, user.id)) === false) {
                await quests.complete(2, user.id);
                demonQuestCompleted = true;
              }
            }
          }

          // Daily quest: Kill 10 enemies in /fight
          if (await quests.active(3)) {
            await incr(user.id, "enemiesKilled", "1");
            if ((await quests.completed(3, user.id)) === false && (await get(`${user.id}_enemiesKilled`)) >= 10) {
              await quests.complete(3, user.id);
              enemiesQuestCompleted = true;
            }
          }

          await collector.stop();
          if (demonQuestCompleted) {
            await interaction.followUp({ content: `Congrats ${user.username}, you completed a quest and earned ${emoji.coins}150! Check /quests.` });
          }
          return;
        }

        // Disable buttons
        buttons.components.forEach((button) => {
          button.setDisabled(true);
        });
      }

      // Button collector
      const filter = (i) => i.user.id === user.id;
      const collector = reply.createMessageComponentCollector({ filter, time: 25000 }); // 25 seconds

      collector.on("collect", async (i) => {
        // User attacks
        if (i.customId === "attack") {
          // let discord know we received the interaction
          i.deferUpdate();
          // remove buttons so user can't attack before enemy attacks.
          buttons.components.forEach((button) => {
            button.setDisabled(true);
          });
          await playerAttacks();
          setTimeout(async () => {
            if (fightEnded) return;
            if (userDied) return;
            await enemyAttacks();
          }, 2000);

          // User defends
        } else if (i.customId === "defend") {
          // let discord know we received the interaction
          i.deferUpdate();
          // remove buttons so user can't attack before enemy attacks.
          buttons.components.forEach((button) => {
            button.setDisabled(true);
          });
          await playerDefends();
          setTimeout(async () => {
            if (fightEnded) return;
            if (userDied) return;
            await enemyAttacks();
          }, 2000);
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
