const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const { get, set, decr, incr, resetStats, hpEmoji, attackEmoji, armorEmoji } = require("../../globals.js");

const { CommandCooldown, msToMinutes } = require("discord-command-cooldown");
const ms = require("ms");
const chance = require("chance").Chance();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("duel")
    .setDescription("Duel another player.")
    .addUserOption((option) => option.setName("user").setDescription("The user to duel.").setRequired(true)),
  async execute(interaction) {
    const user = interaction.user;
    // Cooldown
    const duelCommandCooldown = new CommandCooldown("duel", ms(`1h`));
    const duelCancelCooldown = new CommandCooldown("duelCancel", ms(`5m`));
    const userCooldowned = await duelCommandCooldown.getUser(user.id);
    const targetCooldowned = await duelCommandCooldown.getUser(interaction.options.getUser("user").id);
    const userCancelled = await duelCancelCooldown.getUser(user.id);

    if (userCooldowned) {
      const timeLeft = msToMinutes(userCooldowned.msLeft, false);
      return interaction.reply({
        content: `You need to wait ${timeLeft.minutes}m ${timeLeft.seconds}s before using this command again!`,
        ephemeral: true,
      });
    }

    if(targetCooldowned) {
      const timeLeft = msToMinutes(targetCooldowned.msLeft, false);
      return interaction.reply({
        content: `That user needs to wait ${timeLeft.minutes}m ${timeLeft.seconds}s before you can duel them.`,
        ephemeral: false,
      });
    }

    // Cooldown so users can't spam cancel duel requests.
    if (userCancelled) {
      const timeLeft = msToMinutes(userCancelled.msLeft, false);
      return interaction.reply({
        content: `You have cancelled a duel request recently. You need to wait ${timeLeft.seconds}s before using this command again.`,
        ephemeral: true,
      });
    }

    // Variables
    const userHealth = await get(`${user.id}_hp`);
    const userMaxHealth = await get(`${user.id}_max_hp`);
    const userArmor = await get(`${user.id}_armor`);
    const userDamage = await get(`${user.id}_damage`);
    const target = interaction.options.getUser("user");
    const targetHealth = await get(`${target.id}_hp`);
    const targetMaxHealth = await get(`${target.id}_max_hp`);
    const targetArmor = await get(`${target.id}_armor`);
    const targetDamage = await get(`${target.id}_damage`);

    // Check if users are in a duel already.
    // + Failsafe incase it bugs.
    if ((await get(`${user.id}_duel`)) === "true") {
      if (Date.now() - (await get(`${user.id}_duelTimestamp`)) < 900000) {
        return interaction.reply({
          content: `You are already in a duel or have sent a duel request. Please wait.\n> :information_source: If you are stuck in a duel, it will automatically end after 15 minutes.`,
          ephemeral: true,
        });
      } else {
        await set(`${user.id}_duel`, false);
      }
    }
    if ((await get(`${target.id}_duel`)) === "true") {
      if (Date.now() - (await get(`${target.id}_duelTimestamp`)) < 900000) {
        return interaction.reply({
          content: `That user is already in a duel or has sent their own duel request. Please wait.\n> :information_source: If the user is stuck in a duel, it will automatically end after 15 minutes.`,
          ephemeral: true,
        });
      } else {
        await set(`${target.id}_duel`, false);
      }
    }

    // Other checks
    if (target.bot === true) {
      return interaction.reply({
        content: "You can't duel a bot.",
        ephemeral: true,
      });
    }
    if (user.id === target.id) {
      return interaction.reply({
        content: "You can't duel yourself.",
        ephemeral: true,
      });
    }
    if (userHealth <= 0) {
      return interaction.reply({
        content: "You can't duel with no health.",
        ephemeral: true,
      });
    }
    if ((await get(`${target.id}_interactions`)) === "0") {
      return interaction.reply({
        content: "That user has disabled interactions.",
        ephemeral: true,
      });
    }
    if (targetHealth <= 0) {
      return interaction.reply({
        content: "You can't duel a user that has no health.",
        ephemeral: true,
      });
    }

    // Embed - Setup
    await set(`${user.id}_duel`, true);
    await set(`${user.id}_duelTimestamp`, Date.now());
    const setupEmbed = new EmbedBuilder()
      .setTitle("Duel Setup")
      .setDescription(`### ${user.username} has challenged ${target.username} to a duel.`)
      .addFields(
        {
          name: `${user.username}'s Stats`,
          value: `${hpEmoji}${userHealth}/${userMaxHealth}\n${armorEmoji}${userArmor}\n${attackEmoji}${userDamage} (${userDamage * 5} damage)`,
          inline: true,
        },
        {
          name: `${target.username}'s Stats`,
          value: `${hpEmoji}${targetHealth}/${targetMaxHealth}\n${armorEmoji}${targetArmor}\n${attackEmoji}${targetDamage} (${targetDamage * 5} damage)`,
          inline: true,
        },
        {
          name: `Rules:`,
          value: `- The first person to reach 0 health loses. **It is highly recommended to own a lifesaver.**\n- Defending will divide damage by your armor stat.\n - If you do not have armor, or your armor is 1, damage will be divided by 2 when defending.\n- You may try to escape, but will not recieve any rewards for doing so.\n - Escape chance increases by 5% for each failed attempt, and caps once it goes past 60%.\n- You have 1 hour to respond to this duel. If you do not respond within 1 hour, the duel will be cancelled.\n- The winner of the duel will receive 250 coins.`,
        }
      )
      .setColor(await get(`${user.id}_color`));

    // Buttons - Setup
    const yesButton = new ButtonBuilder().setCustomId("yes").setLabel("Yes").setStyle(ButtonStyle.Success);
    const noButton = new ButtonBuilder().setCustomId("no").setLabel("No").setStyle(ButtonStyle.Danger);
    const userCancel = new ButtonBuilder().setCustomId("userCancel").setLabel(`Cancel duel request`).setStyle(ButtonStyle.Danger);
    const row = new ActionRowBuilder().addComponents(yesButton, noButton, userCancel);

    const setup = await interaction.reply({
      content: `<@${target.id}>, you have been challenged to a duel! Do you accept this duel?\nYou have 1 hour to respond.\n\n**Please note this command is in beta, and bugs may occur. If you encounter any bugs, feel free to join the [Discord server](https://discord.gg/Cc3xBSpWeB) and report them.**`,
      embeds: [setupEmbed],
      components: [row],
    });

    // Await button click
    const collectorFilter = (i) => i.user.id === target.id; // Only allow the target to respond.
    const cancelFilter = (i) => i.user.id === user.id; // Only allow the user to cancel their duel request.

    const cancelCollector = setup.createMessageComponentCollector({
      filter: cancelFilter,
      time: 3600000, // 1 hour
    });

    // Handle user cancelling their duel request
    cancelCollector.on("collect", async (cancelInteraction) => {
      if (cancelInteraction.customId === "userCancel") {
        await cancelInteraction.update({
          content: `<@${target.id}>, ${user.username} has cancelled their duel request.`,
          components: [],
          embeds: [],
        });
        await set(`${user.id}_duel`, false);
        await duelCancelCooldown.addUser(user.id);
        cancelCollector.stop();
      }
    });

    // Wait 1 hour for a response on target accepting or declining the duel.
    try {
      const confirmation = await setup.awaitMessageComponent({
        filter: collectorFilter,
        time: 3600000, // 1 hour
      });

      // Duel start
      confirmation.deferUpdate();
      if (confirmation.customId === "yes") {
        const embed = new EmbedBuilder()
          .setTitle("Duel")
          .setDescription(`**${user.username}** and **${target.username}** are now dueling.`)
          .addFields(
            // Variables may be updated before the request is accepted, so we need to get the updated values.
            {
              name: `${user.username}'s Stats:`,
              value: `${hpEmoji}${await get(`${user.id}_hp`)}/${await get(`${user.id}_max_hp`)}\n${armorEmoji}${await get(`${user.id}_armor`)}`,
              inline: true,
            },
            {
              name: `${target.username}'s Stats:`,
              value: `${hpEmoji}${await get(`${target.id}_hp`)}/${await get(`${target.id}_max_hp`)}\n${armorEmoji}${await get(`${target.id}_armor`)}`,
              inline: true,
            }
          )
          .setColor(await get(`${user.id}_color`));
        await set(`${target.id}_duel`, true);
        await set(`${target.id}_duelTimestamp`, Date.now());
        await duelCommandCooldown.addUser(user.id);
        await duelCommandCooldown.addUser(target.id);

        let lastAction = `${user.username} started a duel.`; // For the embed description

        // Handle defending.
        let userDefended = false;
        let targetDefended = false;

        // The code will attempt to attack twice, for some ungodly reason. No idea why, so here's a bandaid fix. I've spent hours trying to fix this, so.
        // It works like this: Attack once, set userAttacked to true.
        // Then the code tries to attack again (for some reason), but userAttacked is true, so we return false to indicate that the duel is ongoing.
        // Same thing for defending.
        let userAttacked = false;
        let targetAttacked = false;
        let userDefending = false;
        let targetDefending = false;

        // Function to update the duel state
        const updateDuel = async (currentUser, currentOpponent, action) => {
          const userATK = Number(await get(`${user.id}_damage`)) * 5;
          const targetATK = Number(await get(`${target.id}_damage`)) * 5;

          // Check if current user or opponent has reached 0 health
          if ((await get(`${user.id}_hp`)) <= 0) {
            // User loses
            if ((await get(`${user.id}_lifesaver`)) >= "1") {
              await interaction.editReply({
                content: `\n**${target.username} wins!**\n\n${user.username} dies, but uses a lifesaver and is revived with 1HP.\n${target.username} receives 250 coins.\n<@${user.id}>, **you should heal.**`,
                components: [],
                embeds: [],
              });
              await set(`${user.id}_duel`, false);
              await set(`${target.id}_duel`, false);
              await set(`${user.id}_hp`, 1);
              await decr(`${user.id}`, `lifesaver`, 1);
              await incr(`${target.id}`, `coins`, 250);
              return true; // Indicate that the duel has ended
            } else {
              await interaction.editReply({
                content: `${user.username} dies and has **no lifesaver!**\n${target.username} receives 250 coins.`,
                components: [],
                embeds: [],
              });
              await set(`${user.id}_duel`, false);
              await set(`${target.id}_duel`, false);
              await incr(`${target.id}`, `coins`, 250);
              await resetStats(user.id);
              return true; // Indicate that the duel has ended
            }
          }

          if ((await get(`${target.id}_hp`)) <= 0) {
            // Target loses
            if ((await get(`${target.id}_lifesaver`)) >= "1") {
              await interaction.editReply({
                content: `**${user.username} wins!**\n\n${target.username} dies, but uses a lifesaver and is revived with 1HP.\n${user.username} receives 250 coins.\n<@${target.id}>, **you should heal.**`,
                components: [],
                embeds: [],
              });
              await set(`${user.id}_duel`, false);
              await set(`${target.id}_duel`, false);
              await set(`${target.id}_hp`, 1);
              await decr(`${target.id}`, `lifesaver`, 1);
              await incr(`${user.id}`, `coins`, 250);
              return true; // Indicate that the duel has ended
            } else {
              await interaction.editReply({
                content: `${target.username} dies and has **no lifesaver!**\n${user.username} receives 250 coins.`,
                components: [],
                embeds: [],
              });
              await set(`${user.id}_duel`, false);
              await set(`${target.id}_duel`, false);
              await incr(`${user.id}`, `coins`, 250);
              await resetStats(target.id);
              return true; // Indicate that the duel has ended
            }
          }

          // Update health based on action
          if (action === "attack") {
            if (currentUser === user) {
              // Target attacks user
              if (!userDefended) {
                if (!userAttacked) {
                  await decr(user.id, "hp", targetATK);
                  lastAction = `${target.username} attacked ${user.username} for ${targetATK} damage.`;
                  userAttacked = true;
                } else {
                  userAttacked = false;
                  return false; // Indicate that the duel is ongoing
                }
              } else {
                const armor = await get(`${user.id}_armor`);
                let damage;
                if (!userDefending) {
                  if (armor == 0 || armor == 1) {
                    damage = Math.floor(targetATK / 2);
                  } else {
                    damage = Math.floor(targetATK / armor);
                  }
                  if (isFinite(damage)) {
                    await decr(user.id, "hp", damage);
                    lastAction = `${user.username} defended against ${target.username}'s attack, but still took ${damage} damage.`;
                  } else {
                    const damage = Math.floor(targetATK / 2);
                    await decr(user.id, "hp", damage);
                    lastAction = `${user.username} defended against ${target.username}'s attack, but still took ${Math.floor(targetATK / 2)} damage.`;
                  }
                  userDefending = true;
                } else {
                  userDefending = false;
                  userDefended = false;
                  return false; // Indicate that the duel is ongoing
                }
              }
            } else {
              // User attacks target
              if (!targetDefended) {
                if (!targetAttacked) {
                  await decr(target.id, "hp", userATK);
                  lastAction = `${user.username} attacked ${target.username} for ${userATK} damage.`;
                  targetAttacked = true;
                } else {
                  targetAttacked = false;
                  return false; // Indicate that the duel is ongoing
                }
              } else {
                if (!targetDefending) {
                  const armor = await get(`${target.id}_armor`);
                  let damage;
                  if (armor == 0 || armor == 1) {
                    damage = Math.floor(userATK / 2);
                  } else {
                    damage = Math.floor(userATK / armor);
                  }
                  if (isFinite(damage)) {
                    await decr(target.id, "hp", damage);
                    lastAction = `${target.username} defended against ${user.username}'s attack, but still took ${damage} damage.`;
                  } else {
                    const damage = Math.floor(userATK / 2);
                    await decr(target.id, "hp", damage);
                    lastAction = `${target.username} defended against ${user.username}'s attack, but still took ${Math.floor(userATK / 2)} damage.`;
                  }
                  targetDefending = true;
                } else {
                  targetDefending = false;
                  targetDefended = false;
                  return false; // Indicate that the duel is ongoing
                }
              }
            }
          } else if (action === "defend") {
            if (currentUser === user) {
              // Target defends against user's attack
              targetDefended = true;
              lastAction = `${target.username} is defending against ${user.username}'s attack.`;
            } else {
              // User defends against target's attack
              userDefended = true;
              lastAction = `${user.username} is defending against ${target.username}'s attack.`;
            }
          } else if (action === "escape") {
            if (currentUser === user) {
              // Target tries to escape (not successful)
              lastAction = `${target.username} tried to escape, but failed.`;
              return false; // Indicate that the duel is ongoing
            } else {
              // User tries to escape (not successful)
              lastAction = `${user.username} tried to escape, but failed.`;
              return false; // Indicate that the duel is ongoing
            }
          }

          // Get the updated health values for the embed.
          // Users may level up before the duel request is accepted, so we also need to get the updated damage, armor and max_hp values.
          const currentUserHealth = await get(`${user.id}_hp`);
          const currentUserMaxHealth = await get(`${user.id}_max_hp`);
          const currentUserArmor = await get(`${user.id}_armor`);
          const currentUserDamage = await get(`${user.id}_damage`);
          const currentTargetHealth = await get(`${target.id}_hp`);
          const currentTargetMaxHealth = await get(`${target.id}_max_hp`);
          const currentTargetArmor = await get(`${target.id}_armor`);
          const currentTargetDamage = await get(`${target.id}_damage`);

          // Update the embed with updated health values
          embed.spliceFields(0, 3);
          embed.addFields(
            {
              name: `${user.username}'s Stats`,
              value: `${hpEmoji}${currentUserHealth}/${currentUserMaxHealth}\n${armorEmoji}${currentUserArmor}\n${attackEmoji}${currentUserDamage} (${
                currentUserDamage * 5
              } damage)`,
              inline: true,
            },
            {
              name: `${target.username}'s Stats`,
              value: `${hpEmoji}${currentTargetHealth}/${currentTargetMaxHealth}\n${armorEmoji}${currentTargetArmor}\n${attackEmoji}${currentTargetDamage} (${
                currentTargetDamage * 5
              } damage)`,
              inline: true,
            },
            {
              name: `Actions`,
              value: `Choose your next action:`,
            }
          );
          // Return false to indicate that the duel is ongoing
          return false;
        };

        // Loop for the duel actions
        let currentUser = user;
        let currentOpponent = target;
        let escapeChance = Math.round(chance.normal({ mean: 0.3, dev: 0.09 }) * 100); // Nearest whole number

        while (true) {
          embed.setDescription(`Last action: ${lastAction}`);
          embed.setThumbnail(`${currentOpponent.displayAvatarURL()}`);

          await interaction.editReply({
            content: `<@${currentOpponent.id}>, it is your turn.\n`,
          });

          // Buttons - Actions
          const attackButton = new ButtonBuilder().setCustomId("attack").setLabel("Attack").setStyle(ButtonStyle.Primary);
          const defendButton = new ButtonBuilder().setCustomId("defend").setLabel("Defend").setStyle(ButtonStyle.Primary);
          const escapeButton = new ButtonBuilder().setCustomId("escape").setLabel(`Escape (${escapeChance}%)`).setStyle(ButtonStyle.Danger);
          const actionRow = new ActionRowBuilder().addComponents(attackButton, defendButton, escapeButton);

          // Edit the embed with the new buttons
          const updatedMessage = await interaction.editReply({
            embeds: [embed],
            components: [actionRow],
          });

          const turnFilter = (i) => i.user.id === currentOpponent.id;

          // Await button click for the current turn
          const turnConfirmation = await updatedMessage.awaitMessageComponent({
            filter: turnFilter,
            time: 600000, // 10 minutes
          });

          turnConfirmation.deferUpdate();

          // Handle the button click
          if (turnConfirmation.customId === "attack") {
            await updateDuel(currentUser, currentOpponent, "attack");
          } else if (turnConfirmation.customId === "defend") {
            await updateDuel(currentUser, currentOpponent, "defend");
          } else if (turnConfirmation.customId === "escape") {
            if (chance.bool({ likelihood: escapeChance })) {
              // Escape successful
              await interaction.editReply({
                content: `<@${currentUser.id}>, ${currentOpponent.username} has escaped! The duel is over.`,
                components: [],
              });
              await set(`${user.id}_duel`, false);
              await set(`${target.id}_duel`, false);
              break;
            } else {
              // Escape failed
              await updateDuel(currentUser, currentOpponent, "escape");
              if (escapeChance < 60) escapeChance += 5; // Increase escape chance by 5% for the next turn
            }
          }
          // Update the duel state, check winner
          const duelEnded = await updateDuel(currentUser, currentOpponent, turnConfirmation.customId);
          if (duelEnded) {
            break; // Exit the loop if the duel has ended
          }

          // Switch current user and opponent for the next turn
          [currentUser, currentOpponent] = [currentOpponent, currentUser];
        }
      } else {
        // Duel declined
        await interaction.editReply({
          content: `**${target.username} declined the duel.**`,
          components: [],
        });
        await set(`${user.id}_duel`, false);
        await set(`${target.id}_duel`, false);
      }
    } catch (error) {
      // Duel timed out
      await interaction.editReply({
        content: `${target.username} did not respond in time. The duel has been cancelled.`,
        components: [],
      });
      await set(`${user.id}_duel`, false);
      await set(`${target.id}_duel`, false);
      if (!(error instanceof Discord.InteractionCollectorError)) {
        // If the error is not an InteractionCollectorError, log it.
        console.log(error);
      }
    }
  },
};
