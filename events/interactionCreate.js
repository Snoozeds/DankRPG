const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { set, get, decr, incr, resetStats, emoji, cooldown, shopImage, quests, events } = require("../globals.js");
const fs = require("node:fs");
const chance = require("chance").Chance();

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction) {
    if (interaction.isCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      // If the command doesn't exist, log it and return.
      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found. Make sure the file exists.`);
        return;
      }

      // "Start" the user, setting default variables.
      if ((await redis.get(`${interaction.user.id}_hasStarted`)) !== "1") {
        await redis.set(`${interaction.user.id}_coins`, "0");
        await redis.set(`${interaction.user.id}_hp`, "100");
        await redis.set(`${interaction.user.id}_max_hp`, "100");
        await redis.set(`${interaction.user.id}_armor`, "0");
        await redis.set(`${interaction.user.id}_damage`, "5");
        await redis.set(`${interaction.user.id}_xp`, "0");
        await redis.set(`${interaction.user.id}_xp_needed`, "100");
        await redis.set(`${interaction.user.id}_level_xp`, "100");
        await redis.set(`${interaction.user.id}_next_level`, 2);
        await redis.set(`${interaction.user.id}_level`, "1");
        await redis.set(`${interaction.user.id}_hasStarted`, "1");
        await redis.set(`${interaction.user.id}_color`, "#2b2d31");
        await redis.set(`${interaction.user.id}_xp_alerts`, "1");
        await redis.set(`${interaction.user.id}_commandsUsed`, "1");

        await command.execute(interaction);
        return;
      }

      // Achievement for April Fools. (1st-3rd April)
      // Remember that JavaScript counts months from 0.

      if ((await redis.get(`${interaction.user.id}_april_achievement`)) !== null && (await redis.get(`${interaction.user.id}_april_achievement`)) != true) {
        const today = new Date();
        const start = new Date(Date.UTC(today.getUTCFullYear(), 3, 1)); // April 1st, UTC
        const end = new Date(Date.UTC(today.getUTCFullYear(), 3, 3)); // April 3rd, UTC
        if (today >= start && today <= end) {
          redis.set(`${interaction.user.id}_april_achievement`, true);
          redis.incrby(`${interaction.user.id}_coins`, 500);
        }
      }

      // Execute the slash command and increase stats, give pet rewards, etc.
      try {
        // Update stats
        if ((await get(`${interaction.user.id}_statsEnabled`)) === "1" || (await get(`${interaction.user.id}_statsEnabled`)) == null) {
          if ((await get(`${interaction.user.id}_commandsUsed`)) == null || (await get(`${interaction.user.id}_commandsUsed`)) == "") {
            await set(`${interaction.user.id}_commandsUsed`, "0");
          }
          await incr(`${interaction.user.id}`, "commandsUsed", 1);
        }

        // Actually execute the command
        await command.execute(interaction);

        // Pet rewards
        const lastRunTimestamp = await get(`${interaction.user.id}_commandLastRunTimestamp`);
        if (lastRunTimestamp !== null && lastRunTimestamp !== "") {
          const timeDifference = Date.now() - lastRunTimestamp;
          // If the user has been away for more than 30 minutes, give them a chance to get pet rewards.
          if (timeDifference > 1800000 && (await get(`${interaction.user.id}_petHappiness_${await get(`${interaction.user.id}_petEquipped`)}`)) != 0) {
            const equippedPet = await get(`${interaction.user.id}_petEquipped`);
            const happiness = await get(`${interaction.user.id}_petHappiness_${equippedPet}`);

            // Rewards per pet and their percentage chance (if the pet's happiness is above 50%)
            let rewards = [
              {
                name: "cat",
                healthPotion: 15,
                coins: 0,
              },
              {
                name: "dog",
                healthPotion: 17,
                coins: 20,
              },
              {
                name: "duck",
                healthPotion: 20,
                coins: 25,
              },
            ];

            if (happiness <= 50) {
              rewards = [
                {
                  name: "cat",
                  healthPotion: 10,
                  coins: 0,
                },
                {
                  name: "dog",
                  healthPotion: 12,
                  coins: 15,
                },
                {
                  name: "duck",
                  healthPotion: 15,
                  coins: 20,
                },
              ];
            }

            if (happiness <= 25) {
              rewards = [
                {
                  name: "cat",
                  healthPotion: 5,
                  coins: 0,
                },
                {
                  name: "dog",
                  healthPotion: 9,
                  coins: 10,
                },
                {
                  name: "duck",
                  healthPotion: 10,
                  coins: 15,
                },
              ];
            }

            if (happiness === 0) {
              rewards = [
                {
                  name: "cat",
                  healthPotion: 0,
                  coins: 0,
                },
                {
                  name: "dog",
                  healthPotion: 0,
                  coins: 0,
                },
                {
                  name: "duck",
                  healthPotion: 0,
                  coins: 0,
                },
              ];
            }

            // Get the pet's rewards from the rewards array.
            const petRewards = rewards.find((pet) => pet.name === equippedPet);
            const coinLikelihood = petRewards.coins;
            const potionLikelihood = petRewards.healthPotion;

            // Calculate amounts
            const coinRewardMultiplier = Math.floor(timeDifference / (5 * 60 * 1000)); // Increase rewards by 1% per 5 minutes away.
            let coinAmount = Math.min(chance.integer({ min: 30, max: 40 }) + coinRewardMultiplier * 10, 130); // max of 130 coins (1 hour of max 20)
            const potionRewardMultiplier = Math.floor(timeDifference / (10 * 60 * 1000));
            let potionAmount = Math.min(1 + potionRewardMultiplier * 2, 2); // max of 2 potions.

            // Chances
            let coinsRewarded = false;
            let potionRewarded = false;
            if (petRewards.coins !== 0) {
              coinsRewarded = chance.bool({ likelihood: coinLikelihood });
            }
            if (petRewards.healthPotion !== 0) {
              potionRewarded = chance.bool({ likelihood: potionLikelihood });
            }

            // Give the user coins.
            if (coinsRewarded) {
              await incr(`${interaction.user.id}`, "coins", coinAmount);
            }

            // Give the user a health potion.
            if (potionRewarded) {
              await incr(`${interaction.user.id}`, "healthPotion", potionAmount);
            }

            // Reset the timestamp.
            await set(`${interaction.user.id}_commandLastRunTimestamp`, Date.now());

            let replyMessage = "";

            if (potionRewarded) {
              replyMessage += `Your pet ${equippedPet} has found you ${
                potionAmount === 1 ? `a ${emoji.healthPotion}` : `${potionAmount} ${emoji.healthPotion}`
              } while you were away!`;
            }

            if (coinsRewarded) {
              replyMessage += `\nYour pet ${equippedPet} has found you **${emoji.coins} ${coinAmount}** while you were away!`;
            }

            if (replyMessage !== "") await interaction.followUp({ content: replyMessage, ephemeral: true });
          }

          // If the user has a pet equipped, set the timestamp. It must be set AFTER the rewards are given, otherwise it interferes with it.
          if ((await get(`${interaction.user.id}_petEquipped`)) !== null && (await get(`${interaction.user.id}_petEquipped`)) !== "") {
            // This is used to reward the user with pet rewards when they go idle.
            // This is only used if the user has a pet equipped.
            await set(`${interaction.user.id}_commandLastRunTimestamp`, Date.now());
          }
        }

        // Seasonal events
        // Halloween
        if (await events.active("halloween")) {
          if (chance.bool({ likelihood: 10 })) {
            await interaction.followUp({ content: `You found **1x** ${emoji.candy}Candy from running a command during the Halloween event.` });
            await incr(user.id, "candy", 1);
          }
        }
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
        // The user will see this if an error occurs. Can be good for reporting bugs.
      }
    } else if (interaction.isButton()) {
      const customId = interaction.customId;
      const [buttonAction, userId, targetId] = customId.split("-"); // Used for duels.
      const isAuthor = interaction.message.interaction.user.id === interaction.user.id;
      const isTarget = interaction.user.id === targetId;
      const isUser = interaction.user.id === userId; // Do not confuse with isAuthor, this is used for duels.
      const user = interaction.user;
      const client = interaction.client;

      // Used for the commands menu in /qm.
      // See ../deploy-commands for how the command IDs are stored.
      const getCommandId = (commandName) => {
        // Read the JSON file containing the command IDs
        const commandData = fs.readFileSync("./command_data/commands.json", "utf8");
        const data = JSON.parse(commandData);

        // Retrieve the command ID from the parsed data
        const command = data.find((cmd) => cmd.name === commandName);
        return command ? command.id : null; // Return null if the command is not found
      };

      // Quick menu: Commands
      if (customId === "qm_commands" && isAuthor) {
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("commands_images").setLabel("Images").setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId("commands_misc").setLabel("Misc").setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId("commands_rpg").setLabel("RPG").setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId("commands_shop").setLabel("Shop").setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId("commands_social").setLabel("Social").setStyle(ButtonStyle.Secondary)
        );

        // Discord only allows 5 buttons per row, so we need to split the buttons into 2 rows.
        const row2 = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("commands_stats").setLabel("Stats").setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId("qm_commandsBack").setEmoji("⬅️").setStyle(ButtonStyle.Primary)
        );
        await interaction.update({ components: [row, row2] });
      } else if (customId === "commands_images" && isAuthor) {
        const embed = new EmbedBuilder()
          .setTitle(`Commands: Images`)
          .setDescription(
            `**Images:**
  </avatar:${await getCommandId("avatar")}> - Shows your/another user's avatar.
  </banner:${await getCommandId("banner")}> - Shows your/another user's banner.
  </changemymind:${await getCommandId("changemymind")}> - Change my mind.`
          )
          .setColor((await get(`${user.id}_color`)) ?? "#2b2d31");
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("qm_commandsBack").setEmoji("⬅️").setStyle(ButtonStyle.Primary));
        await interaction.update({ embeds: [embed], components: [row] });
      } else if (customId === "commands_misc" && isAuthor) {
        const embed = new EmbedBuilder()
          .setTitle(`Commands: Misc`)
          .setDescription(
            `**Misc:**
  </8ball:${await getCommandId("8ball")}> - Ask the magic 8ball a question.
  </commands:${await getCommandId("commands")}> - Shows all available commands.
  </ping:${await getCommandId("ping")}> - Shows the bot's ping.
  </qm:${await getCommandId("qm")}> - Quickly access menus and commands.
  </report:${await getCommandId("report")}> - Send a bug report, suggestion, or user report to the developer.
  </settings view:${await getCommandId("settings")}> - View your current settings.
  </settings embedcolor:${await getCommandId("settings")}> - Change the embed color.
  </settings xpalerts:${await getCommandId("settings")}> - Toggle XP alerts.
  </settings interactions:${await getCommandId("settings")}> - Toggle interactions.
  </settings hpdisplay:${await getCommandId("settings")}> - Change how HP is displayed to you in /profile.
  </settings leveldisplay:${await getCommandId("settings")}> - Change how level is displayed to you in /profile.
  </settings confirmations:${await getCommandId("settings")}> - Toggle the type of confirmations you get when performing certain actions.
  </settings statistics:${await getCommandId("settings")}> - Toggle stat collection (used in \`stats\` and \`profile\`.)
  </settings reset:${await getCommandId("settings")}> - Reset your settings.
  </time:${await getCommandId("time")}> - Get the current time for a timezone.
  </uptime:${await getCommandId("uptime")}> - Shows the bot's uptime.
  </vote:${await getCommandId("vote")} - Vote on top.gg to earn rewards and help the bot reach more users.`
          )
          .setColor((await get(`${user.id}_color`)) ?? "#2b2d31");
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("qm_commandsBack").setEmoji("⬅️").setStyle(ButtonStyle.Primary));
        await interaction.update({ embeds: [embed], components: [row] });
      } else if (customId === "commands_rpg" && isAuthor) {
        const embed = new EmbedBuilder()
          .setTitle(`Commands: RPG`)
          .setDescription(
            `**RPG:**
  </adventure:${await getCommandId("adventure")}> - Go on an adventure and encounter random events for coins. Requires energy.
  </chop:${await getCommandId("chop")}> - Chop down a tree to get wood. Requires an axe.
  </daily:${await getCommandId("daily")}> - Claim your daily reward.
  </duel:${await getCommandId("duel")}> - Duel another user for coins.
  </fight:${await getCommandId("fight")}> - Turn-based fight system. Rewards and difficulty scale with your level.
  </fish:${await getCommandId("fish")}> - Go fishing (requires at least a Basic Fishing Rod.)
  </forage:${await getCommandId("forage")}> - Forage for items in the wilderness.
  </inn:${await getCommandId("inn")}> - Rest at the inn to instantly gain 10 energy. 12 hour cooldown.
  </mine:${await getCommandId("mine")}> - Mine for stone. Craft a pickaxe to mine faster.`
          )
          .setColor((await get(`${user.id}_color`)) ?? "#2b2d31");
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("qm_commandsBack").setEmoji("⬅️").setStyle(ButtonStyle.Primary));
        await interaction.update({ embeds: [embed], components: [row] });
      } else if (customId === "commands_shop" && isAuthor) {
        const embed = new EmbedBuilder()
          .setTitle(`Commands: Shop`)
          .setDescription(
            `**Shop:**
  </buy:${await getCommandId("buy")}> - Buy an item from the shop.
  </craft:${await getCommandId("craft")}> - Craft an item with the materials you have.
  </equip:${await getCommandId("equip")}> - Equip an item from your inventory.
  </heal:${await getCommandId("heal")}> - Heal yourself for 1 Coin per 1HP.
  </hp:${await getCommandId("hp")}> - Checks how much it costs to heal to MaxHP.
  </sell:${await getCommandId("sell")}> - Sell an item from your inventory.
  </shop:${await getCommandId("shop")}> - Shows the shop.
  </pet alerts:${await getCommandId("pet")}> - Toggle pet alerts.
  </pet buy:${await getCommandId("pet")}> - Buy an item from the pet shop.
  </pet equip:${await getCommandId("pet")}> - Equip a pet.
  </pet feed:${await getCommandId("pet")}> - Feed your pet with pet food.
  </pet shop:${await getCommandId("pet")}> - Shows the pet shop.
  </pet status:${await getCommandId("pet")}> - Shows your pet's status.
  </pet wash:${await getCommandId("pet")}> - Wash your pet with pet shampoo.
  </pet unequip:${await getCommandId("pet")}> - Unequip your pet.
  </unequip:${await getCommandId("unequip")}> - Unequip an item from your inventory.
  </upgrade apply:${await getCommandId("upgrade")}> - Apply an upgrade.
  </upgrade view:${await getCommandId("upgrade")}> - View all upgrades.
  </use:${await getCommandId("use")}> - Use an item from your inventory.`
          )
          .setColor((await get(`${user.id}_color`)) ?? "#2b2d31");
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("qm_commandsBack").setEmoji("⬅️").setStyle(ButtonStyle.Primary));
        await interaction.update({ embeds: [embed], components: [row] });
      } else if (customId === "commands_social" && isAuthor) {
        const embed = new EmbedBuilder()
          .setTitle(`Commands: Social`)
          .setDescription(
            `**Social:**
  </accept:${await getCommandId("accept")}> - Accept an ongoing marriage request.
  </block add:${await getCommandId("block")}> - Block a user.
  </block list:${await getCommandId("block")}> - List all blocked users.
  </block reset:${await getCommandId("block")}> - Unblocks ALL USERS.
  </divorce:${await getCommandId("divorce")}> - Divorce your partner.
  </marry:${await getCommandId("marry")}> - Propose to another user.`
          )
          .setColor((await get(`${user.id}_color`)) ?? "#2b2d31");
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("qm_commandsBack").setEmoji("⬅️").setStyle(ButtonStyle.Primary));
        await interaction.update({ embeds: [embed], components: [row] });
      } else if (customId === "commands_stats" && isAuthor) {
        const embed = new EmbedBuilder()
          .setTitle(`Commands: Stats`)
          .setDescription(
            `**Stats:**
  </achievements:${await getCommandId("achievements")}> - Shows your/another user's achievements.
  </cooldowns:${await getCommandId("cooldowns")}> - Shows your cooldowns.
  </equipped:${await getCommandId("equipped")}> - Shows your equipped items.
  </events:${await getCommandId("events")}> - View active and upcoming seasonal events.
  </info:${await getCommandId("info")}> - Shows information about the bot.
  </inventory:${await getCommandId("inventory")}> - Shows your/another user's inventory.
  </levels:${await getCommandId("levels")}> - Shows your/another user's levels.
  </profile:${await getCommandId("profile")}> - Shows your/another user's profile.
  </quests:${await getCommandId("quests")}> - View your daily quests.
  </serverinfo:${await getCommandId("serverinfo")}> - Shows info about the current server.
  </stats:${await getCommandId("stats")}> - View your/another user's stats.
  </userinfo:${await getCommandId("userinfo")}> - Shows information about you/another user.`
          )
          .setColor((await get(`${user.id}_color`)) ?? "#2b2d31");
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("qm_commandsBack").setEmoji("⬅️").setStyle(ButtonStyle.Primary));
        await interaction.update({ embeds: [embed], components: [row] });
      } else if (customId === "qm_commandsBack" && isAuthor) {
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("commands_images").setLabel("Images").setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId("commands_misc").setLabel("Misc").setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId("commands_rpg").setLabel("RPG").setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId("commands_shop").setLabel("Shop").setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId("commands_social").setLabel("Social").setStyle(ButtonStyle.Secondary)
        );

        // Discord only allows 5 buttons per row, so we need to split the buttons into 2 rows.
        const row2 = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("commands_stats").setLabel("Stats").setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId("qm_back").setEmoji("⬅️").setStyle(ButtonStyle.Primary)
        );

        await interaction.update({ components: [row, row2] });
      } else if (customId === "qm_back" && isAuthor) {
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("qm_commands").setLabel("Commands").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("qm_profile").setLabel("Profile").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("qm_inventory").setLabel("Inventory").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("qm_cooldowns").setLabel("Cooldowns").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("qm_quests").setLabel("Quests").setStyle(ButtonStyle.Primary)
        );

        let row2; // Discord only allows 5 buttons per row, so we need to make a second row if the user has a pet equipped.

        if ((await get(`${user.id}_petEquipped`)) != "" || (await get(`${user.id}_petEquipped`)) != null) {
          row2 = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("qm_pet").setLabel("Pet Status").setStyle(ButtonStyle.Primary));
        }

        if (!row2) {
          await interaction.update({ components: [row] });
        } else {
          await interaction.update({ components: [row, row2] });
        }
      }

      // Quick menu: Profile
      if (customId === "qm_profile" && isAuthor) {
        // Fixes commandsUsed not showing if the user has deleted their stats.
        if ((await get(`${user.id}_commandUsed`)) == null || (await get(`${user.id}_commandUsed`)) == "") {
          await set(`${user.id}_commandUsed`, "0");
        }
        const hpType = await get(`${interaction.user.id}_hp_display`);
        const xpType = await get(`${interaction.user.id}_level_display`);

        async function generateHpBar(hp, maxHP, bars) {
          const emptyBarMiddle = emoji.emptyBarMiddle;
          const emptyBarEnd = emoji.emptyBarEnd;

          const hpBarBegin = emoji.hpBarBegin;
          const hpBarMiddle = emoji.hpBarMiddle;
          const hpBarEnd = emoji.hpBarEnd;

          if (hp === maxHP) return hpBarBegin + hpBarMiddle.repeat(bars - 2) + hpBarEnd;

          // Calculate the percentage of HP
          const percentage = (hp / maxHP) * 100;

          // Calculate how many bars should be filled
          const filledBars = Math.round((percentage / 100) * (bars - 2)); // Subtract 2 for the bar ends.

          // Generate the bar
          const hpPart = hpBarMiddle.repeat(filledBars) + emptyBarMiddle.repeat(bars - 2 - filledBars);

          // Check if the hpPart should end with hpBarEnd or emptyBarEnd
          const finalPart = hpPart + (filledBars === bars - 2 ? hpBarEnd : emptyBarEnd);

          return hpBarBegin + finalPart;
        }

        async function generateLevelBar(xp, xpNeeded, bars) {
          const emptyBarMiddle = emoji.emptyBarMiddle;
          const emptyBarEnd = emoji.emptyBarEnd;

          const levelBarBegin = emoji.levelBarBegin;
          const levelBarMiddle = emoji.levelBarMiddle;
          const levelBarEnd = emoji.levelBarEnd;

          if (xp === xpNeeded) return levelBarBegin + levelBarMiddle.repeat(bars - 2) + levelBarEnd;

          // Calculate the percentage of XP
          const percentage = (xp / xpNeeded) * 100;

          // Calculate how many bars should be filled
          const filledBars = Math.round((percentage / 100) * (bars - 2)); // Subtract 2 for the bar ends.

          // Generate the bar
          const levelPart = levelBarMiddle.repeat(filledBars) + emptyBarMiddle.repeat(bars - 2 - filledBars);

          // Check if the levelPart should end with levelBarEnd or emptyBarEnd
          const finalPart = levelPart + (filledBars === bars - 2 ? levelBarEnd : emptyBarEnd);

          return levelBarBegin + finalPart;
        }

        // hpMessage set to the user's hpType setting.
        let hpName = "HP";
        let hpMessage = "";
        if (hpType === "hp" || hpType == null) {
          hpMessage = `**${emoji.hp} ${await get(`${user.id}_hp`)}**`;
        } else if (hpType === "hp/maxhp") {
          hpMessage = `**${emoji.hp} ${await get(`${user.id}_hp`)}/${await get(`${user.id}_max_hp`)}**`;
        } else if (hpType === "hp/maxhp%") {
          hpMessage = `**${emoji.hp} ${await get(`${user.id}_hp`)}/${await get(`${user.id}_max_hp`)} (${Math.round(
            ((await get(`${user.id}_hp`)) / (await get(`${user.id}_max_hp`))) * 100
          )}%)**`;
        } else if (hpType === "hp%") {
          hpMessage = `**${emoji.hp} ${await get(`${user.id}_hp`)} (${Math.round(((await get(`${user.id}_hp`)) / (await get(`${user.id}_max_hp`))) * 100)}%)**`;
        } else if (hpType === "hp/maxhpbar") {
          const hp = await get(`${user.id}_hp`);
          const maxHp = await get(`${user.id}_max_hp`);
          const percentage = (hp / maxHp) * 100;
          hpMessage = `**${emoji.hp} ${await generateHpBar(hp, maxHp, 10)}**`;
          hpName = `HP ${await get(`${user.id}_hp`)}/${await get(`${user.id}_max_hp`)} (${percentage.toFixed(2)}%)`;
        }
        // levelMessage set to the user's levelType setting.
        let levelMessage = "";
        let levelName = "Level";
        if (xpType === "level") {
          levelMessage = `**${emoji.level} ${await get(`${user.id}_level`)}**`;
        } else if (xpType === "level/xp" || xpType == null) {
          levelMessage = `**${emoji.level} ${await get(`${user.id}_level`)} | ${await get(`${user.id}_xp`)}XP**`;
        } else if (xpType === "level/xpnext") {
          levelMessage = `**${emoji.level} ${await get(`${user.id}_level`)} | ${await get(`${user.id}_xp`)}XP (${await get(`${user.id}_xp_needed`)})**`;
        } else if (xpType === "level/xpnextbar") {
          const xp = await get(`${user.id}_xp`);
          const xpNeeded = (await get(`${user.id}_level`)) * 100; // The amount of xp needed to level up.
          const percentage = (xp / xpNeeded) * 100;
          levelMessage = `**${emoji.level} ${await generateLevelBar(xp, xpNeeded, 10)}**`;
          levelName = `Level ${await get(`${user.id}_level`)} (${percentage.toFixed(2)}%)`;
        }

        let statsText = "";
        if ((await get(`${user.id}_statsEnabled`)) === "1" || (await get(`${user.id}_statsEnabled`)) == "" || (await get(`${user.id}_statsEnabled`)) == null) {
          statsText = `${(await get(`${user.id}_commandsUsed`)) ?? "0"}`;
        } else if ((await get(`${user.id}_statsEnabled`)) === "0") {
          statsText = `Stats disabled.`;
        }

        const embed = new EmbedBuilder()
          .setTitle(`Profile`)
          .setFields([
            {
              name: "Coins",
              value: `**${emoji.coins} ${await get(`${user.id}_coins`)}**`,
              inline: true,
            },
            {
              name: hpName,
              value: hpMessage,
              inline: true,
            },
            {
              name: "Armor",
              value: `**${emoji.armor} ${await get(`${user.id}_armor`)}**`,
              inline: true,
            },
            {
              name: "Damage",
              value: `**${emoji.attack} ${await get(`${user.id}_damage`)}**`,
              inline: true,
            },
            {
              name: levelName,
              value: levelMessage,
              inline: true,
            },
            {
              name: "Energy",
              value: `**${emoji.energy} ${(await get(`${user.id}_energy`)) ?? "0"}**`,
              inline: true,
            },
            {
              name: "Commands Used",
              value: statsText,
              inline: true,
            },
          ])
          .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 4096 }))
          .setColor((await get(`${user.id}_color`)) ?? "#2b2d31")
          .setFooter({ text: "Requested by " + interaction.user.username })
          .setTimestamp();

        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("qm_back").setEmoji("⬅️").setStyle(ButtonStyle.Primary));
        await interaction.update({ embeds: [embed], components: [row] });
      }

      // Quick menu: Inventory
      if (customId === "qm_inventory" && isAuthor) {
        // Define the prices of each item in the inventory.
        const inventoryPrices = {
          _lifesaver: 1000,
          _luckPotion: 500,
          _energyPotion: 350,
          _healthPotion: 0,
          _diamond: 250,
          _demonWing: 300,
          _wood: 1,
          _stone: 5,
        };

        // Set default values for inventory if they do not exist (null.)
        await setDefaultInventoryValues(user.id, "_lifesaver", 0);
        await setDefaultInventoryValues(user.id, "_diamond", 0);
        await setDefaultInventoryValues(user.id, "_wood", 0);
        await setDefaultInventoryValues(user.id, "_stone", 0);

        // Inventory arrays
        const inventoryItems = [
          {
            name: "Lifesaver",
            key: `${user.id}_lifesaver`,
            price: inventoryPrices._lifesaver,
            emoji: emoji.lifesaver,
          },
          {
            name: "Luck Potions",
            key: `${user.id}_luckPotion`,
            price: inventoryPrices._luckPotion,
            emoji: emoji.luckPotion,
          },
          {
            name: "Energy Potions",
            key: `${user.id}_energyPotion`,
            price: inventoryPrices._energyPotion,
            emoji: emoji.energyPotion,
          },
          {
            name: "Health Potions",
            key: `${user.id}_healthPotion`,
            price: inventoryPrices._healthPotion,
            emoji: emoji.healthPotion,
          },
          {
            name: "Diamonds",
            key: `${user.id}_diamond`,
            price: inventoryPrices._diamond,
            emoji: emoji.diamond,
          },
          {
            name: "Stone",
            key: `${user.id}_stone`,
            price: inventoryPrices._stone,
            emoji: emoji.stone,
          },
          {
            name: "Wood",
            key: `${user.id}_wood`,
            price: inventoryPrices._wood,
            emoji: emoji.wood,
          },
          {
            name: "Demon Wing",
            key: `${user.id}_demonWing`,
            price: inventoryPrices._demonWing,
            emoji: emoji.demonWing,
          },
        ];

        const armorItems = [
          {
            name: "Celestial Armor",
            key: `${user.id}_celestialArmor`,
            price: 30000,
            emoji: emoji.celestialArmor,
          },
          {
            name: "Sunforged Armor",
            key: `${user.id}_sunforgedArmor`,
            price: 22500,
            emoji: emoji.sunforgedArmor,
          },
          {
            name: "Glacial Armor",
            key: `${user.id}_glacialArmor`,
            price: 17500,
            emoji: emoji.glacialArmor,
          },
          {
            name: "Abyssal Armor",
            key: `${user.id}_abyssalArmor`,
            price: 13500,
            emoji: emoji.abyssalArmor,
          },
          {
            name: "Verdant Armor",
            key: `${user.id}_verdantArmor`,
            price: 10500,
            emoji: emoji.verdantArmor,
          },
          {
            name: "Sylvan Armor",
            key: `${user.id}_sylvanArmor`,
            price: 7500,
            emoji: emoji.sylvanArmor,
          },
          {
            name: "Topazine Armor",
            key: `${user.id}_topazineArmor`,
            price: 4500,
            emoji: emoji.topazineArmor,
          },
        ];

        const weaponItems = [
          {
            name: "Blade of the Dead",
            key: `${user.id}_bladeOfTheDead`,
            price: 37000,
            emoji: emoji.bladeOfTheDead,
          },
          {
            name: "Divine Wrath",
            key: `${user.id}_divineWrath`,
            price: 30000,
            emoji: emoji.divineWrath,
          },
          {
            name: "Umbral Eclipse",
            key: `${user.id}_umbralEclipse`,
            price: 23000,
            emoji: emoji.umbralEclipse,
          },
          {
            name: "Azureblade",
            key: `${user.id}_azureblade`,
            price: 17000,
            emoji: emoji.azureBlade,
          },
          {
            name: "Zephyr's Breeze",
            key: `${user.id}_zephyrsBreeze`,
            price: 13000,
            emoji: emoji.zephyrsBreeze,
          },
          {
            name: "Squire's Honor",
            key: `${user.id}_squiresHonor`,
            price: 7500,
            emoji: emoji.squiresHonor,
          },
          {
            name: "Crimson Dagger",
            key: `${user.id}_crimsonDagger`,
            price: 5000,
            emoji: emoji.crimsonDagger,
          },
        ];

        const fishingItems = [
          {
            name: "Best Fishing Rod",
            key: `${user.id}_bestFishingRod`,
            price: 10000,
            emoji: emoji.bestFishingRod,
          },
          {
            name: "Better Fishing Rod",
            key: `${user.id}_betterFishingRod`,
            price: 5000,
            emoji: emoji.betterFishingRod,
          },
          {
            name: "Basic Fishing Rod",
            key: `${user.id}_basicFishingRod`,
            price: 1000,
            emoji: emoji.basicFishingRod,
          },
          {
            name: "Fishing Bait",
            key: `${user.id}_fishingBait`,
            price: 50,
            emoji: emoji.fishingBait,
          },
        ];

        const fish = [
          {
            name: "Tilapia",
            key: `${user.id}_tilapia`,
            price: 45,
            emoji: emoji.tilapia,
          },
          {
            name: "Sardine",
            key: `${user.id}_sardine`,
            price: 45,
            emoji: emoji.sardine,
          },
          {
            name: "Perch",
            key: `${user.id}_perch`,
            price: 45,
            emoji: emoji.perch,
          },
          {
            name: "Anchovy",
            key: `${user.id}_anchovy`,
            price: 45,
            emoji: emoji.anchovy,
          },
          {
            name: "Spot",
            key: `${user.id}_spot`,
            price: 65,
            emoji: emoji.spot,
          },
          {
            name: "Rainbow Trout",
            key: `${user.id}_rainbowTrout`,
            price: 65,
            emoji: emoji.rainbowTrout,
          },
          {
            name: "Catfish",
            key: `${user.id}_catfish`,
            price: 65,
            emoji: emoji.catfish,
          },
          {
            name: "Pufferfish",
            key: `${user.id}_pufferfish`,
            price: 80,
            emoji: emoji.pufferfish,
          },
          {
            name: "Bass",
            key: `${user.id}_bass`,
            price: 80,
            emoji: emoji.bass,
          },
          {
            name: "Octopus",
            key: `${user.id}_octopus`,
            price: 100,
            emoji: emoji.octopus,
          },
        ];

        const petItems = [
          {
            name: "Cat Food",
            key: `${user.id}_catFoodUsesLeft`,
            price: 20, // As pet food has 5 uses but costs 100, the price here is 20.
            emoji: emoji.catFood,
          },
          {
            name: "Dog Food",
            key: `${user.id}_dogFoodUsesLeft`,
            price: 20,
            emoji: emoji.dogFood,
          },
          {
            name: "Duck Food",
            key: `${user.id}_duckFoodUsesLeft`,
            price: 20,
            emoji: emoji.duckFood,
          },
          {
            name: "Pet Shampoo",
            key: `${user.id}_petShampooUsesLeft`,
            price: 10, // As pet shampoo has 10 uses but costs 100, the price here is 10.
            emoji: emoji.petShampoo,
          },
        ];

        // Sort the inventory items by price.
        inventoryItems.sort((a, b) => b.price - a.price);
        armorItems.sort((a, b) => b.price - a.price);
        weaponItems.sort((a, b) => b.price - a.price);
        fishingItems.sort((a, b) => b.price - a.price);
        fish.sort((a, b) => b.price - a.price);
        petItems.sort((a, b) => b.price - a.price);

        let totalInventoryValue = 0; // The total coin value of the inventory.
        let totalWeaponValue = 0;
        let totalArmorValue = 0;
        let totalFishingValue = 0;
        let totalFishValue = 0;
        let totalMiscValue = 0;
        let totalPetItemValue = 0;

        // Loop through the weapon items and add them to the description.
        let weaponDescription = "";
        for (const item of weaponItems) {
          const value = await get(item.key);
          if (value && item.price && item.price > 0 && value > 0) {
            const itemValue = value * item.price;
            weaponDescription += `**${item.emoji} ${item.name}**: ${value} (${emoji.coins}${itemValue})\n`;
            totalInventoryValue += itemValue;
            totalWeaponValue += itemValue;
          } else if (value && value > 0) {
            weaponDescription += `**${item.emoji} ${item.name}**: ${value}\n`;
          }
        }

        // Loop through the armor items and add them to the description.
        let armorDescription = "";
        for (const item of armorItems) {
          const value = await get(item.key);
          if (value && item.price && item.price > 0 && value > 0) {
            const itemValue = value * item.price;
            armorDescription += `**${item.emoji} ${item.name}** (${emoji.coins}${itemValue})\n`;
            totalInventoryValue += itemValue;
            totalArmorValue += itemValue;
          } else if (value && value > 0) {
            armorDescription += `${item.name}: ${value}\n`;
          }
        }

        // Loop through the fishing items and add them to the description.
        let fishingDescription = "";
        for (const item of fishingItems) {
          const value = await get(item.key);
          if (value && item.price && item.price > 0 && value > 0) {
            const itemValue = value * item.price;
            // Add value to the description if the item is bait (can own multiple)
            if (item !== fishingItems[3]) {
              fishingDescription += `**${item.emoji} ${item.name}** (${emoji.coins}${itemValue})\n`;
            } else {
              fishingDescription += `**${item.emoji} ${item.name}**: ${value} (${emoji.coins}${itemValue})\n`;
            }
            totalInventoryValue += itemValue;
            totalFishingValue += itemValue;
          } else if (value && value > 0) {
            fishingDescription += `${item.name}: ${value}\n`;
          }
        }

        // Loop through the fish and add them to the description.
        let fishDescription = "";
        for (const item of fish) {
          const value = await get(item.key);
          if (value && item.price && item.price > 0 && value > 0) {
            const itemValue = value * item.price;
            fishDescription += `**${item.emoji} ${item.name}**: ${value} (${emoji.coins}${itemValue})\n`;
            totalInventoryValue += itemValue;
            totalFishValue += itemValue;
          } else if (value && value > 0) {
            fishDescription += `${item.name}: ${value}\n`;
          }
        }

        // Loop through the inventory items and add them to the description.
        let inventoryDescription = "";
        for (const item of inventoryItems) {
          const value = await get(item.key);
          if (value && item.price && item.price > 0 && value > 0) {
            const itemValue = value * item.price;
            inventoryDescription += `**${item.emoji} ${item.name}**: ${value} (${emoji.coins}${itemValue})\n`;
            totalInventoryValue += itemValue;
            totalMiscValue += itemValue;
          } else if (value && value > 0) {
            inventoryDescription += `**${item.emoji} ${item.name}**: ${value}\n`;
          }
        }

        let petDescription = "";
        for (const item of petItems) {
          const value = await get(item.key);
          if (value && item.price && item.price > 0 && value > 0) {
            const itemValue = value * item.price;
            petDescription += `**${item.emoji} ${item.name}**: ${value} (${emoji.coins}${itemValue})\n`;
            totalInventoryValue += itemValue;
            totalPetItemValue += itemValue;
          } else if (value && value > 0) {
            petDescription += `${item.name}: ${value}\n`;
          }
        }

        // Add the items to the embed, if there are any.
        inventoryDescription += armorDescription !== "" ? `\n**Armor** (${emoji.coins}${totalArmorValue ?? 0}):\n${armorDescription}` : "";
        inventoryDescription += weaponDescription !== "" ? `\n**Weapons** (${emoji.coins}${totalWeaponValue ?? 0}):\n${weaponDescription}` : "";
        inventoryDescription += fishingDescription !== "" ? `\n**Fishing** (${emoji.coins}${totalFishingValue ?? 0}):\n${fishingDescription}` : "";
        inventoryDescription += fishDescription !== "" ? `\n**Fish** (${emoji.coins}${totalFishValue ?? 0}):\n${fishDescription}` : "";
        inventoryDescription += petDescription !== "" ? `\n**Pet item uses left** (${emoji.coins}${totalPetItemValue ?? 0}):\n${petDescription}` : "";

        // If the inventory is empty, set the description to a default message.
        if (inventoryDescription === "") {
          inventoryDescription = "This user has an empty inventory.";
        }

        const embed = new EmbedBuilder()
          .setTitle(`${user.username}'s Inventory`)
          .setFields({
            name: "Total Inventory Value",
            value: `${emoji.coins}**${totalInventoryValue.toLocaleString()}**`,
            inline: true,
          })
          .setDescription(`**Items** (${emoji.coins}${totalMiscValue ?? 0}):\n${inventoryDescription}`)
          .setColor((await get(`${interaction.user.id}_color`)) ?? "#2b2d31")
          .setThumbnail(user.displayAvatarURL({ format: "jpg", size: 4096 }));

        async function setDefaultInventoryValues(id, key, value) {
          if ((await get(`${id}${key}`)) === null) {
            await set(`${id}${key}`, value);
          }
        }

        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("qm_back").setEmoji("⬅️").setStyle(ButtonStyle.Primary));
        await interaction.update({ embeds: [embed], components: [row] });
      }

      // Quick menu: Cooldowns
      if (customId === "qm_cooldowns" && isAuthor) {
        const dailyCooldown = await cooldown.get(interaction.user.id, "daily");
        const fightCooldown = await cooldown.get(interaction.user.id, "fight");
        const adventureCooldown = await cooldown.get(interaction.user.id, "adventure");
        const forageCooldown = await cooldown.get(interaction.user.id, "forage");
        const mineCooldown = await cooldown.get(interaction.user.id, "mine");
        const chopCooldown = await cooldown.get(interaction.user.id, "chop");
        const duelCooldown = await cooldown.get(interaction.user.id, "duel");
        const fishCooldown = await cooldown.get(interaction.user.id, "fish");
        const innCooldown = await cooldown.get(interaction.user.id, "inn");

        function formatCooldown(cooldown) {
          if (cooldown == null || cooldown === 0) {
            return "**Ready!**";
          } else {
            return `<t:${Math.round((Date.now() + cooldown) / 1000)}:R>`;
          }
        }

        const fields = [
          {
            name: `</daily:${await getCommandId("daily")}>`,
            value: formatCooldown(dailyCooldown),
            inline: true,
          },
          {
            name: `</fight:${await getCommandId("fight")}>`,
            value: formatCooldown(fightCooldown),
            inline: true,
          },
          {
            name: `</adventure:${await getCommandId("adventure")}>`,
            value: formatCooldown(adventureCooldown),
            inline: true,
          },
          {
            name: `</forage:${await getCommandId("forage")}>`,
            value: formatCooldown(forageCooldown),
            inline: true,
          },
          {
            name: `</mine:${await getCommandId("mine")}>`,
            value: formatCooldown(mineCooldown),
            inline: true,
          },
          {
            name: `</chop:${await getCommandId("chop")}>`,
            value: formatCooldown(chopCooldown),
            inline: true,
          },
          {
            name: `</duel:${await getCommandId("duel")}>`,
            value: formatCooldown(duelCooldown),
            inline: true,
          },
          {
            name: `</fish:${await getCommandId("fish")}>`,
            value: formatCooldown(fishCooldown),
            inline: true,
          },
          {
            name: `</inn:${await getCommandId("inn")}>`,
            value: formatCooldown(innCooldown),
            inline: true,
          },
        ];

        const embed = new EmbedBuilder()
          .setTitle("Cooldowns")
          .setDescription("You can use these commands again at the following times.")
          .setFields(fields)
          .setColor((await get(`${interaction.user.id}_color`)) ?? "#2b2d31")
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }));

        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("qm_back").setEmoji("⬅️").setStyle(ButtonStyle.Primary));
        await interaction.update({ embeds: [embed], components: [row] });
      }

      // Quick menu: Quests
      if (customId === "qm_quests" && isAuthor) {
        const questsString = await get("quests");
        const quests = JSON.parse(questsString); // Get the quests from the key

        if (!quests) {
          const embed = new EmbedBuilder()
            .setTitle("Quests")
            .setDescription("There are no quests available right now. Please check back later.")
            .setColor((await get(`${interaction.user.id}_color`)) ?? "#2b2d31");

          const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("qm_back").setEmoji("⬅️").setStyle(ButtonStyle.Primary));
          await interaction.update({ embeds: [embed], components: [row] });
        }

        // Check if the user has completed the questID
        const completed = await redis.lrange(`${interaction.user.id}_questsCompleted`, 0, -1);
        const completedIDs = completed.map((quest) => JSON.parse(quest).id);

        // Sort quests, with completed quests at the bottom
        quests.sort((a, b) => {
          const aCompleted = completedIDs.includes(a.id);
          const bCompleted = completedIDs.includes(b.id);
          if (aCompleted && !bCompleted) return 1; // Put completed quests at the bottom
          if (!aCompleted && bCompleted) return -1; // Put completed quests at the bottom
          return 0;
        });

        const embed = new EmbedBuilder()
          .setTitle(`${emoji.questScroll} Today's Quests`)
          .setDescription("Complete these quests to earn some rewards!\n**They reset every midnight UTC.**")
          .setFields(
            quests.map((quest) => {
              const { description, reward, id } = quest;
              const questDescription = description || "No description available";
              return { name: questDescription, value: `Reward: ${emoji.coins}${reward}\nCompleted: ${completedIDs.includes(id) ? "Yes" : "No"}` };
            })
          )
          .setColor((await get(`${interaction.user.id}_color`)) ?? "#2b2d31");

        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("qm_back").setEmoji("⬅️").setStyle(ButtonStyle.Primary));
        await interaction.update({ embeds: [embed], components: [row] });
      }

      // Quick menu: Pet Status
      if (customId === "qm_petStatus" && isAuthor) {
        const items = [
          {
            name: "cat",
            emoji: emoji.cat,
            variables: {
              owned: "catOwned",
            },
            price: 5000,
            allowMultiple: false,
          },
          {
            name: "dog",
            emoji: emoji.dog,
            variables: {
              owned: "dogOwned",
            },
            price: 10000,
            allowMultiple: false,
          },
          {
            name: "duck",
            emoji: emoji.duck,
            variables: {
              owned: "duckOwned",
            },
            price: 15000,
            allowMultiple: false,
          },
          {
            name: "catFood",
            emoji: emoji.catFood,
            variables: {
              owned: "catFood",
              usesLeft: "catFoodUsesLeft",
            },
            price: 100,
            allowMultiple: true,
            uses: 5,
          },
          {
            name: "dogFood",
            emoji: emoji.dogFood,
            variables: {
              owned: "dogFood",
              usesLeft: "dogFoodUsesLeft",
            },
            price: 100,
            allowMultiple: true,
            uses: 5,
          },
          {
            name: "duckFood",
            emoji: emoji.duckFood,
            variables: {
              owned: "duckFood",
              usesLeft: "duckFoodUsesLeft",
            },
            price: 100,
            allowMultiple: true,
            uses: 5,
          },
          {
            name: "petShampoo",
            emoji: emoji.petShampoo,
            variables: {
              owned: "petShampoo",
              usesLeft: "petShampooUsesLeft",
            },
            price: 100,
            allowMultiple: true,
            uses: 10,
          },
        ];

        const pet = await get(`${user.id}_petEquipped`);
        const petEmoji = items.find((i) => i.name === pet).emoji;
        let petUppercase = pet.charAt(0).toUpperCase() + pet.slice(1);
        const happiness = Number(await get(`${user.id}_petHappiness_${pet}`));
        const fullness = await get(`${user.id}_petFullness_${pet}`);
        const cleanliness = await get(`${user.id}_petCleanliness_${pet}`);
        let rewards = [
          {
            name: "cat",
            healthPotion: 15,
            coins: 0,
          },
          {
            name: "dog",
            healthPotion: 17,
            coins: 20,
          },
          {
            name: "duck",
            healthPotion: 20,
            coins: 25,
          },
        ];

        if (happiness <= 50) {
          rewards = [
            {
              name: "cat",
              healthPotion: 10,
              coins: 0,
            },
            {
              name: "dog",
              healthPotion: 12,
              coins: 15,
            },
            {
              name: "duck",
              healthPotion: 15,
              coins: 20,
            },
          ];
        } else if (happiness <= 25) {
          rewards = [
            {
              name: "cat",
              healthPotion: 5,
              coins: 0,
            },
            {
              name: "dog",
              healthPotion: 9,
              coins: 10,
            },
            {
              name: "duck",
              healthPotion: 10,
              coins: 15,
            },
          ];
        } else if (happiness <= 0) {
          rewards = [
            {
              name: "cat",
              healthPotion: 0,
              coins: 0,
            },
            {
              name: "dog",
              healthPotion: 0,
              coins: 0,
            },
            {
              name: "duck",
              healthPotion: 0,
              coins: 0,
            },
          ];
        }

        const petRewards = rewards.find((r) => r.name === pet);
        const healthPotionChance = happiness <= 0 ? 0 : petRewards.healthPotion;
        const coinsChance = happiness <= 0 ? 0 : petRewards.coins;
        const embed = new EmbedBuilder()
          .setTitle(`${petEmoji} ${petUppercase} status:`)
          .addFields(
            {
              name: `${emoji.petHappiness} Happiness`,
              value: `**${happiness}%**`,
              inline: true,
            },
            {
              name: `${emoji.petFullness} Fullness`,
              value: `**${fullness}% ${fullness === "0" ? `(You should feed your ${pet}!)` : ""}**`,
              inline: true,
            },
            {
              name: `${emoji.petCleanliness} Cleanliness`,
              value: `**${cleanliness}% ${cleanliness === "0" ? `(You should wash your ${pet}!)` : ""}**`,
              inline: true,
            },
            {
              name: `-`,
              value: `** **`,
              inline: false,
            },
            {
              name: `Current ${emoji.healthPotion} chance`,
              value: `**${healthPotionChance}%**`,
              inline: true,
            },
            {
              name: `Current ${emoji.coins} chance`,
              value: `**${coinsChance}%**`,
              inline: true,
            }
          )
          .setColor(`${(await get(`${user.id}_color`)) || "#2b2d31"}`)
          .setFooter({ text: `Rewards have a chance of being given after running a command after you have been away for more than 30m.` });

        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("qm_back").setEmoji("⬅️").setStyle(ButtonStyle.Primary));
        await interaction.update({ embeds: [embed], components: [row] });
      }

      // Fishing: cast
      if (customId === "fishing-cast" && isAuthor) {
        cooldown.set(interaction.user.id, "fish", "30s");

        if (!(await cooldown.check(user.id, "fishButtonTimeout"))) {
          return interaction.update({
            content: "These buttons have timed out, sorry. Please try running /fish again.",
            embeds: [],
            components: [],
          });
        }

        const embed = new EmbedBuilder()
          .setTitle("Fishing")
          .setDescription("You cast your line into the water...")
          .setColor((await get(`${interaction.user.id}_color`)) ?? "#2b2d31");

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("fishing-reel").setEmoji(emoji.fishReel).setStyle(ButtonStyle.Primary).setDisabled(true),
          new ButtonBuilder().setCustomId("fishing-cancel").setLabel("Leave").setStyle(ButtonStyle.Danger)
        );

        await interaction.update({ embeds: [embed], components: [row] });

        if ((await get(`${interaction.user.id}_statsEnabled`)) === "1" || (await get(`${interaction.user.id}_statsEnabled`)) == null) {
          if ((await get(`${interaction.user.id}_fish_timesFishedTotal`)) == null || (await get(`${interaction.user.id}_fish_timesFishedTotal`)) == "") {
            await set(`${interaction.user.id}_fish_timesFishedTotal`, 0);
          }
          await incr(interaction.user.id, "fish_timesFishedTotal", 1);
        }

        setTimeout(async () => {
          if ((await get(`${interaction.user.id}_fishCaught`)) !== "cancelled") {
            const embed = new EmbedBuilder()
              .setTitle("Fishing")
              .setDescription("**A fish bit!**")
              .setColor((await get(`${interaction.user.id}_color`)) ?? "#2b2d31");

            const row = new ActionRowBuilder().addComponents(
              new ButtonBuilder().setCustomId("fishing-reel").setEmoji(emoji.fishReel).setStyle(ButtonStyle.Primary),
              new ButtonBuilder().setCustomId("fishing-cancel").setLabel("Leave").setStyle(ButtonStyle.Danger)
            );

            await interaction.editReply({ embeds: [embed], components: [row] });

            // Set a timeout for the "fish got away" message
            setTimeout(async () => {
              if (!(await get(`${interaction.user.id}_fishCaught`)) && (await get(`${interaction.user.id}_fishCaught`)) !== "cancelled") {
                const embed = new EmbedBuilder()
                  .setTitle("Fishing")
                  .setDescription("**You didn't respond in time and the fish got away!**")
                  .setColor((await get(`${interaction.user.id}_color`)) ?? "#2b2d31");

                await interaction.editReply({ embeds: [embed], components: [] });
              }
            }, 2000);
          }
        }, chance.integer({ min: 3000, max: 5000 }));
      }

      // Fishing: reel
      if (customId === "fishing-reel" && isAuthor) {
        const fishingRodEquipped = await get(`${interaction.user.id}_fishingRodEquipped`);
        const fishingBaitEquipped = await get(`${interaction.user.id}_fishingBaitEquipped`);
        const fishingBait = await get(`${interaction.user.id}_fishingBait`);

        // Default fishing chances for no bait, lowest rod (in %)
        let fishChances = {
          commonFish: 65,
          uncommonFish: 25,
          rareFish: 8,
          legendaryFish: 2,
        };

        if (fishingRodEquipped === "betterFishingRod") {
          fishChances = {
            commonFish: 50,
            uncommonFish: 30,
            rareFish: 15,
            legendaryFish: 5,
          };
        } else if (fishingRodEquipped === "bestFishingRod") {
          fishChances = {
            commonFish: 30,
            uncommonFish: 35,
            rareFish: 20,
            legendaryFish: 15,
          };
        }

        if (fishingRodEquipped === "basicFishingRod" && fishingBaitEquipped == 1 && fishingBait > 0) {
          fishChances = {
            commonFish: 60,
            uncommonFish: 30,
            rareFish: 8,
            legendaryFish: 2,
          };
        } else if (fishingRodEquipped === "betterFishingRod" && fishingBaitEquipped == 1 && fishingBait > 0) {
          fishChances = {
            commonFish: 45,
            uncommonFish: 25,
            rareFish: 20,
            legendaryFish: 10,
          };
        } else if (fishingRodEquipped === "bestFishingRod" && fishingBaitEquipped == 1 && fishingBait > 0) {
          fishChances = {
            commonFish: 25,
            uncommonFish: 30,
            rareFish: 25,
            legendaryFish: 20,
          };
        }

        // Fish : Rarity
        const fishes = {
          tilapia: "commonFish",
          sardine: "commonFish",
          perch: "commonFish",
          anchovy: "commonFish",
          spot: "uncommonFish",
          rainbowTrout: "uncommonFish",
          catfish: "uncommonFish",
          pufferfish: "rareFish",
          bass: "rareFish",
          octopus: "rareFish",
        };

        // Calculate fish rarity using fishChances
        const fishRarity = chance.weighted(
          ["commonFish", "uncommonFish", "rareFish", "legendaryFish"],
          [fishChances.commonFish, fishChances.uncommonFish, fishChances.rareFish, fishChances.legendaryFish]
        );

        // Pick a random fish from the rarity
        const fish = chance.pickone(Object.keys(fishes).filter((fish) => fishes[fish] === fishRarity));
        const fishEmoji = emoji[fish];

        // add a space before the first uppercase letter
        let fishName = fish.replace(/([A-Z])/g, " $1").trim();
        // add an uppercase letter to the first letter
        fishName = fishName.charAt(0).toUpperCase() + fishName.slice(1);

        // remove "Fish" from rarity
        let rarityText = fishRarity.replace("Fish", "");
        // add an uppercase letter to the first letter
        rarityText = rarityText.charAt(0).toUpperCase() + rarityText.slice(1);
        let baitText = "";
        if (fishingBaitEquipped == 1 && fishingBait > 0) {
          baitText = `\nYou used your equipped fishing bait. You now have ${emoji.fishingBait}${await get(`${user.id}_fishingBait`)} left.`;
        }

        await set(`${interaction.user.id}_fishCaught`, true);
        const embed = new EmbedBuilder()
          .setTitle("Fishing")
          .setDescription(`**You caught ${fishEmoji} ${fishName}!** (${rarityText})${baitText}`)
          .setColor((await get(`${interaction.user.id}_color`)) ?? "#2b2d31");

        let achievementUnlocked = false; // Used for the followUp message

        if (fishRarity === "legendaryFish" && (await get(`${interaction.user.id}_fishLegendaryAchievement`)) !== "true") {
          await set(`${interaction.user.id}_fishLegendaryAchievement`, true);
          await incr(interaction.user.id, "coins", 300);
          achievementUnlocked = true;
        }
        await incr(interaction.user.id, fish, 1);
        await interaction.update({ embeds: [embed], components: [] });
        if (achievementUnlocked) {
          const embed = new EmbedBuilder()
            .setTitle("Achievement Unlocked!")
            .setDescription(`${emoji.achievementUnlock} You unlocked the **It's rare, I think** achievement, ${user.username}! (+${emoji.coins}**300**.)`)
            .setColor((await get(`${interaction.user.id}_color`)) ?? "#2b2d31");
          await interaction.followUp({ embeds: [embed] });
        }
        if ((await get(`${interaction.user.id}_statsEnabled`)) === "1" || (await get(`${interaction.user.id}_statsEnabled`)) == null) {
          if ((await get(`${interaction.user.id}_fish_caughtTotal`)) == null || (await get(`${interaction.user.id}_fish_caughtTotal`)) == "") {
            await set(`${interaction.user.id}_fish_caughtTotal`, 0);
          }
          if ((await get(`${interaction.user.id}_fish_${fishRarity}CaughtTotal`)) == null || (await get(`${interaction.user.id}_fish_${fishRarity}CaughtTotal`)) == "") {
            await set(`${interaction.user.id}_fish_${fishRarity}CaughtTotal`, 0);
          }
          await incr(interaction.user.id, "fish_caughtTotal", 1);
          await incr(interaction.user.id, `fish_${fishRarity}CaughtTotal`, 1);
        }
        if ((await get(`${interaction.user.id}_fishingBaitEquipped`)) == 1 && (await get(`${interaction.user.id}_fishingBait`)) > 0) {
          await decr(interaction.user.id, "fishingBait", 1);
        }

        setTimeout(async () => {
          // reset fishCaught
          await set(`${interaction.user.id}_fishCaught`, "");
        }, 2100);
      }

      // Fishing: cancel
      if (customId === "fishing-cancel" && isAuthor) {
        await interaction.update({ content: `You leave the fishing spot. Fishing cancelled.`, embeds: [], components: [] });
        // stop timeout
        await set(`${interaction.user.id}_fishCaught`, "cancelled");

        setTimeout(async () => {
          // reset fishCaught
          await set(`${interaction.user.id}_fishCaught`, "");
        }, 5000);
      }

      // Fishing: tutorial
      if (customId === "fishing-tutorial" && isAuthor) {
        const embed = new EmbedBuilder()
          .setTitle("Fishing")
          .setDescription(
            "To fish, you must first cast your line into the water. Then, you must reel in the fish before it gets away!\nYou may buy better fishing rods from /shop and equip them with /equip.\nYou may also buy fishing bait to slightly increase the chance of catching rare fish.\n\n**Note:** You can only fish once every 30 seconds."
          )
          .setColor((await get(`${interaction.user.id}_color`)) ?? "#2b2d31");

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("fishing-cast").setEmoji(emoji.fishReel).setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("fishing-cancel").setLabel("Leave").setStyle(ButtonStyle.Danger)
        );

        await interaction.update({ embeds: [embed], components: [row] });
      }

      let lastAction;

      // Duel update function
      const updateDuel = async (currentUser, currentOpponent, action) => {
        // Duel embed
        duelUser = await client.users.fetch(userId);
        duelTarget = await client.users.fetch(targetId);
        const duelEmbed = new EmbedBuilder()
          .setTitle("Duel")
          .setDescription(`${lastAction}`)
          .addFields(
            // Variables may be updated before the request is accepted, so we need to get the updated values.
            {
              name: `${duelUser.username}'s Stats:`,
              value: `${emoji.hp}${await get(`${duelUser.id}_hp`)}/${await get(`${duelUser.id}_max_hp`)}\n${emoji.armor}${await get(`${duelUser.id}_armor`)}\n${
                emoji.attack
              }${await get(`${duelUser.id}_damage`)} (${Number(await get(`${duelUser.id}_damage`)) * 5})`,
              inline: true,
            },
            {
              name: `${duelTarget.username}'s Stats:`,
              value: `${emoji.hp}${await get(`${duelTarget.id}_hp`)}/${await get(`${duelTarget.id}_max_hp`)}\n${emoji.armor}${await get(`${duelTarget.id}_armor`)}\n${
                emoji.attack
              }${await get(`${duelTarget.id}_damage`)} (${Number(await get(`${duelTarget.id}_damage`)) * 5})`,
              inline: true,
            }
          )
          .setColor((await get(`${duelUser.id}_color`)) ?? "#2b2d31");

        const user = await client.users.fetch(currentUser);
        const target = await client.users.fetch(currentOpponent);

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
            if ((await get(`${target.id}_statsEnabled`)) === "1" || (await get(`${target.id}_statsEnabled`)) == null) {
              if ((await get(`${target.id}_duel_timesWonTotal`)) == null || (await get(`${target.id}_duel_timesWonTotal`)) == "") {
                await set(`${target.id}_duel_timesWonTotal`, 0);
              }
              await incr(target.id, "duel_timesWonTotal", 1);
            }
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
            if ((await get(`${target.id}_statsEnabled`)) === "1" || (await get(`${target.id}_statsEnabled`)) == null) {
              if ((await get(`${target.id}_duel_timesWonTotal`)) == null || (await get(`${target.id}_duel_timesWonTotal`)) == "") {
                await set(`${target.id}_duel_timesWonTotal`, 0);
              }
              await incr(target.id, "duel_timesWonTotal", 1);
            }
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
            if ((await get(`${user.id}_statsEnabled`)) === "1" || (await get(`${user.id}_statsEnabled`)) == null) {
              await incr(user.id, "duel_timesWonTotal", 1);
            }
            return true; // Indicate that the duel has ended
          } else {
            // Target loses and has no lifesaver
            await interaction.editReply({
              content: `${target.username} dies and has **no lifesaver!**\n${user.username} receives 250 coins.`,
              components: [],
              embeds: [],
            });
            await set(`${user.id}_duel`, false);
            await set(`${target.id}_duel`, false);
            await incr(`${user.id}`, `coins`, 250);
            await resetStats(target.id);
            if ((await get(`${user.id}_statsEnabled`)) === "1" || (await get(`${user.id}_statsEnabled`)) == null) {
              await incr(user.id, "duel_timesWonTotal", 1);
            }
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
                await interaction.editReply({ embeds: [duelEmbed] });
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
                  await interaction.editReply({ embeds: [duelEmbed] });
                } else {
                  const damage = Math.floor(targetATK / 2);
                  await decr(user.id, "hp", damage);
                  lastAction = `${user.username} defended against ${target.username}'s attack, but still took ${Math.floor(targetATK / 2)} damage.`;
                  await interaction.editReply({ embeds: [duelEmbed] });
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
                await interaction.editReply({ embeds: [duelEmbed] });
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
                  await interaction.editReply({ embeds: [duelEmbed] });
                } else {
                  const damage = Math.floor(userATK / 2);
                  await decr(target.id, "hp", damage);
                  lastAction = `${target.username} defended against ${user.username}'s attack, but still took ${Math.floor(userATK / 2)} damage.`;
                  await interaction.editReply({ embeds: [duelEmbed] });
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
        duelEmbed.spliceFields(0, 3);
        duelEmbed.addFields(
          {
            name: `${user.username}'s Stats`,
            value: `${emoji.hp}${currentUserHealth}/${currentUserMaxHealth}\n${emoji.armor}${currentUserArmor}\n${emoji.attack}${currentUserDamage} (${
              currentUserDamage * 5
            } damage)`,
            inline: true,
          },
          {
            name: `${target.username}'s Stats`,
            value: `${emoji.hp}${currentTargetHealth}/${currentTargetMaxHealth}\n${emoji.armor}${currentTargetArmor}\n${emoji.attack}${currentTargetDamage} (${
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

      // Duels: accept
      if (buttonAction === "duelAccept" && isTarget) {
        await interaction.deferUpdate();
        let questCompletedUser = false; // Used for the followUp message.
        let questCompletedTarget = false; // Used for the followUp message.

        const user = await client.users.fetch(userId);
        const target = await client.users.fetch(targetId);

        lastAction = `${target.username} accepted the duel request.`;

        // Daily quest: Participate in a duel against another player.
        if (await quests.active(4)) {
          if ((await quests.completed(4, user.id)) === false) {
            await quests.complete(4, user.id);
            questCompletedUser = true;
          }
          if ((await quests.completed(4, target.id)) === false) {
            await quests.complete(4, target.id);
            questCompletedTarget = true;
          }
        }

        // Update stats
        if ((await get(`${user.id}_statsEnabled`)) === "1" || (await get(`${user.id}_statsEnabled`)) == null) {
          if ((await get(`${user.id}_duel_timesDuelledTotal`)) == null || (await get(`${user.id}_duel_timesDuelledTotal`)) == "") {
            await set(`${user.id}_duel_timesDuelledTotal`, 0);
          }
          await incr(user.id, "duel_timesDuelledTotal", 1);
        }

        if ((await get(`${target.id}_statsEnabled`)) === "1" || (await get(`${target.id}_statsEnabled`)) == null) {
          if ((await get(`${target.id}_duel_timesDuelledTotal`)) == null || (await get(`${target.id}_duel_timesDuelledTotal`)) == "") {
            await set(`${target.id}_duel_timesDuelledTotal`, 0);
          }
          await incr(target.id, "duel_timesDuelledTotal", 1);
        }

        if (questCompletedUser) {
          await interaction.followUp({ content: `Congrats ${user.username}, you completed a quest and earned ${emoji.coins}100! Check /quests.` });
        }
        if (questCompletedTarget) {
          await interaction.followUp({ content: `Congrats ${target.username}, you completed a quest and earned ${emoji.coins}100! Check /quests.` });
        }
        if (questCompletedUser && questCompletedTarget) {
          await interaction.followUp({
            content: `Congrats ${user.username} and ${target.username}, you both completed a quest and earned ${emoji.coins}100 each! Check /quests.`,
          });
        }
        await cooldown.set(user.id, "duel", "1h");
        await cooldown.set(target.id, "duel", "1h");
        await cooldown.set(user.id, "duelButtonTimeout", "15m"); // used to make buttons expire after 15 minutes
        await cooldown.set(target.id, "duelButtonTimeout", "15m"); // used to make buttons expire after 15 minutes
        await set(`${target.id}_duel`, true);
        await set(`${target.id}_duelTimestamp`, Date.now());

        if (!(await cooldown.get(user.id, "duelButtonTimeout")) || !(await cooldown.get(target.id, "duelButtonTimeout"))) {
          await interaction.editReply({
            content: `Sorry, these buttons have expired. Please run /duel again.`,
            components: [],
            embeds: [],
          });
          await set(`${user.id}_duel`, false);
          await set(`${target.id}_duel`, false);
          return;
        }

        // Duel embed
        duelUser = await client.users.fetch(userId);
        duelTarget = await client.users.fetch(targetId);
        const duelEmbed = new EmbedBuilder()
          .setTitle("Duel")
          .setDescription(`${lastAction}`)
          .addFields(
            // Variables may be updated before the request is accepted, so we need to get the updated values.
            {
              name: `${duelUser.username}'s Stats:`,
              value: `${emoji.hp}${await get(`${duelUser.id}_hp`)}/${await get(`${duelUser.id}_max_hp`)}\n${emoji.armor}${await get(`${duelUser.id}_armor`)}`,
              inline: true,
            },
            {
              name: `${duelTarget.username}'s Stats:`,
              value: `${emoji.hp}${await get(`${duelTarget.id}_hp`)}/${await get(`${duelTarget.id}_max_hp`)}\n${emoji.armor}${await get(`${duelTarget.id}_armor`)}`,
              inline: true,
            }
          )
          .setColor((await get(`${duelUser.id}_color`)) ?? "#2b2d31");

        // Loop for the duel actions
        let currentUser = user;
        let currentOpponent = target;
        let escapeChance = Math.round(chance.normal({ mean: 0.3, dev: 0.09 }) * 100); // Nearest whole number

        while (true) {
          duelEmbed.setDescription(`Last action: ${lastAction}`);
          duelEmbed.setThumbnail(`${currentOpponent.displayAvatarURL()}`);

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
            embeds: [duelEmbed],
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
            if (!(await cooldown.get(user.id, "duelButtonTimeout")) || !(await cooldown.get(target.id, "duelButtonTimeout"))) {
              await interaction.editReply({
                content: `Sorry, these buttons have expired. Please run /duel again.`,
                components: [],
                embeds: [],
              });
              await set(`${user.id}_duel`, false);
              await set(`${target.id}_duel`, false);
              return;
            }
            await updateDuel(currentUser, currentOpponent, "attack");
          } else if (turnConfirmation.customId === "defend") {
            if (!(await cooldown.get(user.id, "duelButtonTimeout")) || !(await cooldown.get(target.id, "duelButtonTimeout"))) {
              await interaction.editReply({
                content: `Sorry, these buttons have expired. Please run /duel again.`,
                components: [],
                embeds: [],
              });
              await set(`${user.id}_duel`, false);
              await set(`${target.id}_duel`, false);
              return;
            }
            await updateDuel(currentUser, currentOpponent, "defend");
          } else if (turnConfirmation.customId === "escape") {
            if (!(await cooldown.get(user.id, "duelButtonTimeout")) || !(await cooldown.get(target.id, "duelButtonTimeout"))) {
              await interaction.editReply({
                content: `Sorry, these buttons have expired. Please run /duel again.`,
                components: [],
                embeds: [],
              });
              await set(`${user.id}_duel`, false);
              await set(`${target.id}_duel`, false);
              return;
            }
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
      }

      // Duels: decline
      if (buttonAction === "duelDecline" && isTarget) {
        await interaction.deferUpdate();
        // Duel declined
        await interaction.update({
          content: `**${target.username} declined the duel.**`,
          components: [],
          embeds: [],
        });
        await set(`${user.id}_duel`, false);
        await set(`${target.id}_duel`, false);
      }

      // User cancels their duel request
      if (buttonAction === "userCancel" && isUser) {
        await interaction.deferUpdate();
        const target = await client.users.fetch(targetId);
        const user = await client.users.fetch(userId);
        await interaction.update({
          content: `<@${target.id}>, ${user.username} has cancelled their duel request.`,
          components: [],
          embeds: [],
        });
        await set(`${user.id}_duel`, false);
        await cooldown.set(user.id, "duelCancel", "5m");
        cancelCollector.stop();
      }
    } else if (interaction.isModalSubmit()) {
      if (interaction.customId === "report") {
        // CHANGE THIS TO YOUR OWN CHANNEL ID!
        const channel = interaction.client.channels.cache.get("1136390984024981625");

        // Get values
        const user = interaction.user;
        const reportType = interaction.fields.getTextInputValue("reportType");
        const reportDescription = interaction.fields.getTextInputValue("description");

        const embed = new EmbedBuilder()
          .setTitle("New Report")
          .setDescription(`**User:** ${user.username} (${user.id})\n**Report Type:** ${reportType}\n**Description:** ${reportDescription}`)
          .setColor("#FF0000")
          .setTimestamp();

        await channel.send({ embeds: [embed] });

        await interaction.reply({ content: "Your submission was received successfully!", ephemeral: true });
      }
    } else if (interaction.isStringSelectMenu()) {
      const isAuthor = interaction.message.interaction.user.id === interaction.user.id;
      const customId = interaction.customId;
      // Shop select menu
      if (customId === "shop" && isAuthor) {
        const user = interaction.user;
        if (interaction.values[0] === "potions") {
          const embed = new EmbedBuilder()
            .setTitle("Potions")
            .setDescription(`"Welcome to my shop!"\nYour balance: **${emoji.coins}${await get(`${user.id}_coins`)}**`)
            .addFields(
              {
                name: `${emoji.lifesaver} Lifesaver (Owned: ${(await get(`${user.id}_lifesaver`)) || 0})`,
                value: `**${emoji.coins} 1,000**\n${emoji.description} Saves you from death. Used automatically.`,
              },
              {
                name: `${emoji.luckPotion} Luck Potion (Owned: ${(await get(`${user.id}_luckPotion`)) || 0})`,
                value: `**${emoji.coins} 500**\n${emoji.description} Increases the chance of rare item drops (${emoji.diamond}, ${emoji.demonWing}) by 10% for 10 minutes. Does not affect fishing. Can only have one active at a time.`,
              },
              {
                name: `${emoji.energyPotion} Energy Potion (Owned: ${(await get(`${user.id}_energyPotion`)) || 0})`,
                value: `**${emoji.coins} 350**\n${emoji.description} Gives you ${emoji.energy}10 energy when consumed which can be used for adventures (each cost ${emoji.energy}1.) Can use and buy as many as you want.`,
              }
            )
            .setFooter({ text: "Use /buy to buy an item and /use to use an item (if not automatically used)." })
            .setColor((await get(`${user.id}_color`)) ?? "#2b2d31")
            .setThumbnail(shopImage);
          await interaction.update({
            content: "",
            embeds: [embed],
          });
        } else if (interaction.values[0] === "armor") {
          const embed = new EmbedBuilder()
            .setTitle("Armor")
            .setDescription(
              `"Welcome to my shop!"\nYour balance: **${emoji.coins}${await get(`${user.id}_coins`)}**

${emoji.celestialArmor} Celestial Armor ${(await get(`${user.id}_celestialArmor`)) === "1" ? "(owned)" : ""}
${emoji.description} Armor of immense strength, said to have been forged by the gods themselves.
${emoji.coins} **30,000**
${emoji.armorUp} **+50**
\-
${emoji.sunforgedArmor} Sunforged Armor ${(await get(`${user.id}_sunforgedArmor`)) === "1" ? "(owned)" : ""}
${emoji.description} Extremely rare and formidable armor, forged in the heat of the sun.
${emoji.coins} **22,500**
${emoji.armorUp} **+35**
\-
${emoji.glacialArmor} Glacial Armor ${(await get(`${user.id}_glacialArmor`)) === "1" ? "(owned)" : ""}
${emoji.description} Very rare and robust armor, meticulously forged in the coldest of glaciers.
${emoji.coins} **17,500**
${emoji.armorUp} **+30**
\-
${emoji.abyssalArmor} Abyssal Armor ${(await get(`${user.id}_abyssalArmor`)) === "1" ? "(owned)" : ""}
${emoji.description} Rare and powerful armor, imbued with the essence of the deep sea.
${emoji.coins} **13,500**
${emoji.armorUp} **+25**
\-
${emoji.verdantArmor} Verdant Armor ${(await get(`${user.id}_verdantArmor`)) === "1" ? "(owned)" : ""}
${emoji.description} Strong and sought-after armor, adorned with the essence of lush greenery.
${emoji.coins} **10,500**
${emoji.armorUp} **+20**
\-
${emoji.sylvanArmor} Sylvan Armor ${(await get(`${user.id}_sylvanArmor`)) === "1" ? "(owned)" : ""}
${emoji.description} Highly coveted and rare armor, emanating the magic of ancient forests.
${emoji.coins} **7,500**
${emoji.armorUp} **+10**
\-
${emoji.topazineArmor} Topazine Armor ${(await get(`${user.id}_topazineArmor`)) === "1" ? "(owned)" : ""}
${emoji.description} Relatively common armor, imbued with the essence of the earth.
${emoji.coins} **4,500**
${emoji.armorUp} **+5**
\-
${emoji.stoneRing} Stone Ring ${(await get(`${user.id}_stoneRing`)) === "1" ? "(owned)" : ""}
${emoji.description} A small ring crafted from stone. Automatically equips itself when bought. Cannot be unequipped.
${emoji.coins} **2,000**
${emoji.armorUp} **+1**`
            )
            .setFooter({ text: "Use /buy <id> to buy an item and /equip to equip an item. You can only equip one armor item at once." })
            .setColor((await get(`${user.id}_color`)) ?? "#2b2d31")
            .setThumbnail(shopImage);
          await interaction.update({
            content: "",
            embeds: [embed],
          });
        } else if (interaction.values[0] === "weapons") {
          const embed = new EmbedBuilder()
            .setTitle("Weapons")
            .setDescription(
              `"Welcome to my shop!"\nYour balance: **${emoji.coins}${await get(`${user.id}_coins`)}**

${emoji.bladeOfTheDead} Blade of the Dead ${(await get(`${user.id}_bladeOfTheDead`)) === "1" ? "(owned)" : ""}
${
  emoji.description
} The Blade of the Dead strikes fear into the hearts of enemies. Its malevolent aura grants the wielder the power to drain life from foes, leaving devastation in their wake.
${emoji.coins} **37,000**
${emoji.attackUp} **+60**
${emoji.critUp} **+60%**
-
${emoji.divineWrath} Divine Wrath ${(await get(`${user.id}_divineWrath`)) === "1" ? "(owned)" : ""}
${emoji.description} Carved from a single shard of a fallen comet, the Celestial Edge is a legendary blade imbued with the very essence of the gods.
${emoji.coins} **30,000**
${emoji.attackUp} **+40**
${emoji.critUp} **+50%**
-
${emoji.umbralEclipse} Umbral Eclipse ${(await get(`${user.id}_umbralEclipse`)) === "1" ? "(owned)" : ""}
${emoji.description} A lethal masterpiece forged from shadowy steel, the Umbral eclipse is the perfect fusion of elegance and devastation.
${emoji.coins} **23,000**
${emoji.attackUp} **+30**
${emoji.critUp} **+40%**
-
${emoji.azureBlade} Azureblade ${(await get(`${user.id}_azureblade`)) === "1" ? "(owned)" : ""}
${emoji.description} A legendary sword forged from shimmering azure steel, the Azureblade is the perfect all-rounder for a medium-skilled adventurer.
${emoji.coins} **17,000**
${emoji.attackUp} **+20**
${emoji.critUp} **+35%**
-
${emoji.zephyrsBreeze} Zephyr's Breeze ${(await get(`${user.id}_zephyrsBreeze`)) === "1" ? "(owned)" : ""}
${emoji.description} Crafted with ethereal precision, the Zephyr Breeze cleaves through foes with unmatched speed and grace.
${emoji.coins} **13,000**
${emoji.attackUp} **+15**
${emoji.critUp} **+30%**
-
${emoji.squiresHonor} Squire's Honor ${(await get(`${user.id}_squiresHonor`)) === "1" ? "(owned)" : ""}
${emoji.description} A sword once used by knights across the country, the Squire's Honor is the perfect choice for an adventurer just starting out.
${emoji.coins} **7,500**
${emoji.attackUp} **+10**
${emoji.critUp} **+15%**
-
${emoji.crimsonDagger} Crimson Dagger ${(await get(`${user.id}_crimsonDagger`)) === "1" ? "(owned)" : ""}
${emoji.description} A fast, strong and cost effective dagger, crafted from crimson.
${emoji.coins} **5,000**
${emoji.attackUp} **+5**
${emoji.critUp} **+10%**`
            )
            .setFooter({ text: "Use /buy <id> to buy an item and /equip to equip an item. You can only equip one weapon at once." })
            .setColor((await get(`${user.id}_color`)) ?? "#2b2d31")
            .setThumbnail(shopImage);
          await interaction.update({
            content: "",
            embeds: [embed],
          });
        } else if (interaction.values[0] === "fishing") {
          const embed = new EmbedBuilder()
            .setTitle("Fishing")
            .setDescription(
              `"Welcome to my shop!"\nYour balance: **${emoji.coins}${await get(`${user.id}_coins`)}**

${emoji.bestFishingRod} Best Fishing Rod ${(await get(`${user.id}_bestFishingRod`)) === "1" ? "(owned)" : ""}
${emoji.description} The best fishing rod money can buy. Greatly your chance of catching rarer fish.
${emoji.coins} **10,000**
-
${emoji.betterFishingRod} Better Fishing Rod ${(await get(`${user.id}_betterFishingRod`)) === "1" ? "(owned)" : ""}
${emoji.description} A better fishing rod than the average. Slightly increases your chance of catching rarer fish.
${emoji.coins} **5,000**
-
${emoji.basicFishingRod} Basic Fishing Rod ${(await get(`${user.id}_fishingRod`)) === "1" ? "(owned)" : ""}
${emoji.description} A basic fishing rod. Allows you to fish.
${emoji.coins} **1,000**
-
${emoji.fishingBait} Fishing Bait ${(await get(`${user.id}_fishingBait`)) === "1" ? `(${await get(`${user.id}_fishingBait`)})` : ""}
${emoji.description} Bait for fishing. Increases your chance of catching rarer fish by a small amount. Automatically used when equipped.
${emoji.coins} **50**
`
            )
            .setFooter({ text: "Use /buy to buy an item and /equip to equip an item. You can only equip one fishing rod at once." })
            .setColor((await get(`${user.id}_color`)) ?? "#2b2d31")
            .setThumbnail(shopImage);
          await interaction.update({
            content: "",
            embeds: [embed],
          });
        }
      }
    }
  },
};
