const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { set, get, decr, incr, resetStats, emoji, cooldown, shopImage, quests } = require("../globals.js");
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

      // Execute the slash command.
      try {
        if ((await get(`${interaction.user.id}_statsEnabled`)) === "1" || (await get(`${interaction.user.id}_statsEnabled`)) == null) {
          if ((await get(`${interaction.user.id}_commandsUsed`)) == null || (await get(`${interaction.user.id}_commandsUsed`)) == "") {
            await set(`${interaction.user.id}_commandsUsed`, "0");
          }
          await incr(`${interaction.user.id}`, "commandsUsed", 1);
        }
        await command.execute(interaction);
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
  </uptime:${await getCommandId("uptime")}> - Shows the bot's uptime.`
          )
          .setColor((await get(`${user.id}_color`)) ?? "#2b2d31");
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("qm_commandsBack").setEmoji("⬅️").setStyle(ButtonStyle.Primary));
        await interaction.update({ embeds: [embed], components: [row] });
      } else if (customId === "commands_rpg" && isAuthor) {
        const embed = new EmbedBuilder()
          .setTitle(`Commands: RPG`)
          .setDescription(
            `**RPG:**
  </adventure:${await getCommandId("adventure")}> - Starts an RPG adventure. 60% chance of getting coins, doesn't scale.
  </chop:${await getCommandId("chop")}> - Chop down a tree to get wood. Requires an axe.
  </daily:${await getCommandId("daily")}> - Claim your daily reward.
  </duel:${await getCommandId("duel")}> - Duel another user for coins.
  </fight:${await getCommandId("fight")}> - Turn-based fight system. Rewards and difficulty scale with your level.
  </fish:${await getCommandId("fish")}> - Go fishing (requires at least a Basic Fishing Rod.)
  </forage:${await getCommandId("forage")}> - Forage for items in the wilderness.
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
  </unequip:${await getCommandId("unequip")}> - Unequip an item from your inventory.
  </upgrade apply:${await getCommandId("upgrade")}> - Apply an upgrade.
  </upgrade view:${await getCommandId("upgrade")}> - View all upgrades.`
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
        await interaction.update({ components: [row] });
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
          const emptyBarBegin = emoji.emptyBarBegin;
          const emptyBarMiddle = emoji.emptyBarMiddle;
          const emptyBarEnd = emoji.emptyBarEnd;

          const hpBarBegin = emoji.hpBarBegin;
          const hpBarMiddle = emoji.hpBarMiddle;
          const hpBarEnd = emoji.hpBarEnd;

          if (hp === maxHP) return hpBarBegin + hpBarMiddle.repeat(bars - 2) + hpBarEnd;

          if (hp <= maxHP / bars) {
            return emptyBarBegin + emptyBarMiddle.repeat(bars - 2) + emptyBarEnd;
          }

          // calculate amount of full and empty bars
          let fullBars = Math.min(Math.round(hp / (maxHP / bars)) + 1, 10);
          // Quick fixes for a bug where the bar is one too long.
          if (maxHP - hp <= 100) return hpBarBegin + hpBarMiddle.repeat(bars - 2) + emptyBarEnd;
          if (maxHP - hp <= 200) return hpBarBegin + hpBarMiddle.repeat(bars - 3) + emptyBarMiddle + emptyBarEnd;
          const emptyBars = bars - fullBars;

          // calculate whether the last bar should be full or empty
          const remainder = hp % (maxHP / bars);
          const fullBarEnds = remainder > 0 ? 1 : 0;

          // generate the bar
          const emptyPart = emptyBars > 1 ? emptyBarMiddle.repeat(emptyBars - 1) + emptyBarEnd : emptyBars === 1 && !fullBarEnds ? emptyBarMiddle + emptyBarEnd : "";
          const hpPart = hpBarMiddle.repeat(fullBars - 2 + fullBarEnds) + (emptyPart.startsWith(emptyBarMiddle) ? emptyPart : emptyBarEnd + emptyPart);

          // Check if the hpPart should end with hpBarEnd or emptyBarEnd
          const finalPart = hp % (maxHP / bars) === 0 ? hpPart.slice(0, -1) + emptyBarMiddle : hpPart;

          return hpBarBegin + finalPart;
        }

        async function generateLevelBar(xp, xpNeeded, bars) {
          const emptyBarBegin = emoji.emptyBarBegin;
          const emptyBarMiddle = emoji.emptyBarMiddle;
          const emptyBarEnd = emoji.emptyBarEnd;

          const levelBarBegin = emoji.levelBarBegin;
          const levelBarMiddle = emoji.levelBarMiddle;
          const levelBarEnd = emoji.levelBarEnd;

          if (xp === xpNeeded) return levelBarBegin + levelBarMiddle.repeat(bars - 2) + levelBarEnd;

          if (xp <= xpNeeded / bars) {
            return emptyBarBegin + emptyBarMiddle.repeat(bars - 2) + emptyBarEnd;
          }

          // calculate amount of full and empty bars
          let fullBars = Math.min(Math.round(xp / (xpNeeded / bars)) + 1, 10);
          // Quick fixes for a bug where the bar is one too long.
          if (xpNeeded - xp <= 100) return levelBarBegin + levelBarMiddle.repeat(bars - 2) + emptyBarEnd;
          if (xpNeeded - xp <= 200) return levelBarBegin + levelBarMiddle.repeat(bars - 3) + emptyBarMiddle + emptyBarEnd;
          const emptyBars = bars - fullBars;

          // calculate whether the last bar should be full or empty
          const remainder = xp % (xpNeeded / bars);
          const fullBarEnds = remainder > 0 ? 1 : 0;

          // generate the bar
          const emptyPart = emptyBars > 1 ? emptyBarMiddle.repeat(emptyBars - 1) + emptyBarEnd : emptyBars === 1 && !fullBarEnds ? emptyBarMiddle + emptyBarEnd : "";
          const levelPart = levelBarMiddle.repeat(fullBars - 2 + fullBarEnds) + (emptyPart.startsWith(emptyBarMiddle) ? emptyPart : emptyBarEnd + emptyPart);

          // Check if the levelPart should end with levelBarEnd or emptyBarEnd
          const finalPart = xp % (xpNeeded / bars) === 0 ? levelPart.slice(0, -1) + emptyBarMiddle : levelPart;

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
              name: "Commands Used",
              value: `${(await get(`${user.id}_statsEnabled`)) === "1" ? `**${await get(`${user.id}_commandsUsed`)}**` : `Stats disabled.`}`,
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
            name: "Lifesavers",
            key: `${user.id}_lifesaver`,
            price: inventoryPrices._lifesaver,
            emoji: emoji.lifesaver,
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

        // Sort the inventory items by price.
        inventoryItems.sort((a, b) => b.price - a.price);
        armorItems.sort((a, b) => b.price - a.price);
        weaponItems.sort((a, b) => b.price - a.price);

        let totalInventoryValue = 0;

        // Loop through the weapon items and add them to the description.
        let weaponDescription = "";
        for (const item of weaponItems) {
          const value = await get(item.key);
          if (value && item.price && item.price > 0 && value > 0) {
            const itemValue = value * item.price;
            weaponDescription += `**${item.emoji} ${item.name}**: ${value} (${emoji.coins}${itemValue})\n`;
            totalInventoryValue += itemValue;
          } else if (value && value > 0) {
            weaponDescription += `**${item.emoji}${item.name}**: ${value}\n`;
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
          } else if (value && value > 0) {
            armorDescription += `${item.name}: ${value}\n`;
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
          } else if (value && value > 0) {
            inventoryDescription += `**${item.emoji}${item.name}**: ${value}\n`;
          }
        }

        // Add the armors to the inventory description if there are any.
        inventoryDescription += armorDescription !== "" ? `\n**Armor:**\n${armorDescription}` : "";

        // Add the weapons to the inventory description if there are any.
        inventoryDescription += weaponDescription !== "" ? `\n**Weapons:**\n${weaponDescription}` : "";

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
          .setDescription(`**Items:**\n${inventoryDescription}`)
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

        function formatCooldown(cooldown) {
          if (cooldown == null || cooldown === 0) {
            return "**Ready!**";
          } else {
            return `<t:${Math.round((Date.now() + cooldown) / 1000)}:R>`;
          }
        }

        const fields = [
          {
            name: "Daily",
            value: formatCooldown(dailyCooldown),
            inline: true,
          },
          {
            name: "Fight",
            value: formatCooldown(fightCooldown),
            inline: true,
          },
          {
            name: "Adventure",
            value: formatCooldown(adventureCooldown),
            inline: true,
          },
          {
            name: "Forage",
            value: formatCooldown(forageCooldown),
            inline: true,
          },
          {
            name: "Mine",
            value: formatCooldown(mineCooldown),
            inline: true,
          },
          {
            name: "Chop",
            value: formatCooldown(chopCooldown),
            inline: true,
          },
          {
            name: "Duel",
            value: formatCooldown(duelCooldown),
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
          new ButtonBuilder().setCustomId("fishing-reel").setEmoji("🎣").setStyle(ButtonStyle.Primary).setDisabled(true),
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
              new ButtonBuilder().setCustomId("fishing-reel").setEmoji("🎣").setStyle(ButtonStyle.Primary),
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
          new ButtonBuilder().setCustomId("fishing-cast").setEmoji("🎣").setStyle(ButtonStyle.Primary),
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
        if (interaction.values[0] === "health") {
          const embed = new EmbedBuilder()
            .setTitle("Health items")
            .setDescription(`"Welcome to my shop!"\nYour balance: **${emoji.coins}${await get(`${user.id}_coins`)}**`)
            .addFields({
              name: `${emoji.lifesaver} Lifesaver (Owned: ${(await get(`${user.id}_lifesaver`)) || 0})`,
              value: `**Cost: ${emoji.coins}1000**\nSaves you from death. Used automatically.\nid: lifesaver`,
            })
            .setFooter({ text: "Use /buy <id> to buy an item." })
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
