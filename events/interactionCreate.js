const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const {
  incr,
  get,
  cooldown,
  coinEmoji,
  hpEmoji,
  attackEmoji,
  armorEmoji,
  levelEmoji,
  diamondEmoji,
  stoneEmoji,
  woodEmoji,
  lifesaverEmoji,
  celestialArmorEmoji,
  sunforgedArmorEmoji,
  glacialArmorEmoji,
  abyssalArmorEmoji,
  verdantArmorEmoji,
  sylvanArmorEmoji,
  topazineArmorEmoji,
  bladeOfTheDeadEmoji,
  divineWrathEmoji,
  umbralEclipseEmoji,
  azurebladeEmoji,
  zephyrsBreezeEmoji,
  squiresHonorEmoji,
  crimsonDaggerEmoji,
  demonWingEmoji,
} = require("../globals.js");
const fs = require("node:fs");

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
        await redis.set(`${interaction.user.id}_color`, "#FFE302");
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

      try {
        await incr(`${interaction.user.id}`, "commandsUsed", 1);
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
      const user = interaction.user;

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

      const isAuthor = interaction.message.interaction.user.id === interaction.user.id;

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
          .setColor(await get(`${user.id}_color`));
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
  </settings hpdisplay:${await getCommandId("settings")}> - Change how your HP is displayed in /profile.
  </settings leveldisplay:${await getCommandId("settings")}> - Change how your level is displayed in /profile.
  </settings reset:${await getCommandId("settings")}> - Reset your settings.
  </time:${await getCommandId("time")}> - Get the current time for a timezone.
  </uptime:${await getCommandId("uptime")}> - Shows the bot's uptime.${
              interaction.channel.nsfw === true ? `\n</urban:${await getCommandId("urban")}> - Search the Urban Dictionary.` : ""
            }`
          )
          .setColor(await get(`${user.id}_color`));
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("qm_commandsBack").setEmoji("⬅️").setStyle(ButtonStyle.Primary));
        await interaction.update({ embeds: [embed], components: [row] });
      } else if (customId === "commands_rpg" && isAuthor) {
        const embed = new EmbedBuilder()
          .setTitle(`Commands: RPG`)
          .setDescription(
            `**RPG:**
  </adventure:${await getCommandId("adventure")}> - Starts an RPG adventure. Random chance of getting coins, doesn't scale.
  </chop:${await getCommandId("chop")}> - Chop down a tree to get wood. Requires an axe.
  </daily:${await getCommandId("daily")}> - Claim your daily reward.
  </duel:${await getCommandId("duel")}> - Duel another user for coins.
  </fight:${await getCommandId("fight")}> - Turn-based fight system. Rewards and difficulty scale with your level.
  </forage:${await getCommandId("forage")}> - Forage for items in the wilderness.
  </mine:${await getCommandId("mine")}> - Mine for stone. Craft a pickaxe to mine faster.`
          )
          .setColor(await get(`${user.id}_color`));
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
  </upgrade:${await getCommandId("upgrade")}> - Upgrade your stats.`
          )
          .setColor(await get(`${user.id}_color`));
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("qm_commandsBack").setEmoji("⬅️").setStyle(ButtonStyle.Primary));
        await interaction.update({ embeds: [embed], components: [row] });
      } else if (customId === "commands_social" && isAuthor) {
        const embed = new EmbedBuilder()
          .setTitle(`Commands: Social`)
          .setDescription(
            `**Social:**
  </accept:${await getCommandId("accept")}> - Accept an ongoing marriage request.
  </divorce:${await getCommandId("divorce")}> - Divorce your partner.
  </marry:${await getCommandId("marry")}> - Propose to another user.`
          )
          .setColor(await get(`${user.id}_color`));
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
  </serverinfo:${await getCommandId("serverinfo")}> - Shows info about the current server.
  </stats:${await getCommandId("stats")}> - View your/another user's stats.
  </userinfo:${await getCommandId("userinfo")}> - Shows information about you/another user.`
          )
          .setColor(await get(`${user.id}_color`));
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
          new ButtonBuilder().setCustomId("qm_cooldowns").setLabel("Cooldowns").setStyle(ButtonStyle.Primary)
        );
        await interaction.update({ components: [row] });
      }

      // Quick menu: Profile
      if (customId === "qm_profile" && isAuthor) {
        const hpType = await get(`${interaction.user.id}_hp_display`);
        const xpType = await get(`${interaction.user.id}_level_display`);

        // hpMessage set to the user's hpType setting.
        let hpMessage = "";
        if (hpType === "hp" || hpType == null) {
          hpMessage = `**${hpEmoji} ${await get(`${user.id}_hp`)}**`;
        } else if (hpType === "hp/maxhp") {
          hpMessage = `**${hpEmoji} ${await get(`${user.id}_hp`)}/${await get(`${user.id}_max_hp`)}**`;
        } else if (hpType === "hp/maxhp%") {
          hpMessage = `**${hpEmoji} ${await get(`${user.id}_hp`)}/${await get(`${user.id}_max_hp`)} (${Math.round(
            ((await get(`${user.id}_hp`)) / (await get(`${user.id}_max_hp`))) * 100
          )}%)**`;
        } else if (hpType === "hp%") {
          hpMessage = `**${hpEmoji} ${await get(`${user.id}_hp`)} (${Math.round(((await get(`${user.id}_hp`)) / (await get(`${user.id}_max_hp`))) * 100)}%)**`;
        }

        // levelMessage set to the user's levelType setting.
        let levelMessage = "";
        if (xpType === "level") {
          levelMessage = `**${levelEmoji} ${await get(`${user.id}_level`)}**`;
        } else if (xpType === "level/xp" || xpType == null) {
          levelMessage = `**${levelEmoji} ${await get(`${user.id}_level`)} | ${await get(`${user.id}_xp`)}XP**`;
        } else if (xpType === "level/xpnext") {
          levelMessage = `**${levelEmoji} ${await get(`${user.id}_level`)} | ${await get(`${user.id}_xp`)}XP (${await get(`${user.id}_xp_needed`)})**`;
        }

        const embed = new EmbedBuilder()
          .setTitle("Profile")
          .setFields([
            {
              name: "Coins",
              value: `**${coinEmoji} ${await get(`${user.id}_coins`)}**`,
              inline: true,
            },
            {
              name: "HP",
              value: `${hpMessage}`,
              inline: true,
            },
            {
              name: "Armor",
              value: `**${armorEmoji} ${await get(`${user.id}_armor`)}**`,
              inline: true,
            },
            {
              name: "Damage",
              value: `**${attackEmoji} ${await get(`${user.id}_damage`)}**`,
              inline: true,
            },
            {
              name: "Level",
              value: `${levelMessage}`,
              inline: true,
            },
            {
              name: "Commands Used",
              value: `**${await get(`${user.id}_commandsUsed`)}**`,
              inline: true,
            },
          ])
          .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 4096 }))
          .setColor(await get(`${user.id}_color`))
          .setFooter({ text: "Requested by " + interaction.user.username })
          .setTimestamp();

        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("qm_back").setEmoji("⬅️").setStyle(ButtonStyle.Primary));
        await interaction.update({ embeds: [embed], components: [row] });
      }

      // Quick menu: Inventory
      if (customId === "qm_inventory" && isAuthor) {
        // Define the prices of each item in the inventory.
        const inventoryPrices = {
          _lifesaver: 0,
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
            emoji: lifesaverEmoji,
          },
          {
            name: "Diamonds",
            key: `${user.id}_diamond`,
            price: inventoryPrices._diamond,
            emoji: diamondEmoji,
          },
          {
            name: "Stone",
            key: `${user.id}_stone`,
            price: inventoryPrices._stone,
            emoji: stoneEmoji,
          },
          {
            name: "Wood",
            key: `${user.id}_wood`,
            price: inventoryPrices._wood,
            emoji: woodEmoji,
          },
          {
            name: "Demon Wing",
            key: `${user.id}_demonWing`,
            price: inventoryPrices._demonWing,
            emoji: demonWingEmoji
          }
        ];

        const armorItems = [
          {
            name: "Celestial Armor",
            key: `${user.id}_celestialArmor`,
            price: 30000,
            emoji: celestialArmorEmoji,
          },
          {
            name: "Sunforged Armor",
            key: `${user.id}_sunforgedArmor`,
            price: 22500,
            emoji: sunforgedArmorEmoji,
          },
          {
            name: "Glacial Armor",
            key: `${user.id}_glacialArmor`,
            price: 17500,
            emoji: glacialArmorEmoji,
          },
          {
            name: "Abyssal Armor",
            key: `${user.id}_abyssalArmor`,
            price: 13500,
            emoji: abyssalArmorEmoji,
          },
          {
            name: "Verdant Armor",
            key: `${user.id}_verdantArmor`,
            price: 10500,
            emoji: verdantArmorEmoji,
          },
          {
            name: "Sylvan Armor",
            key: `${user.id}_sylvanArmor`,
            price: 7500,
            emoji: sylvanArmorEmoji,
          },
          {
            name: "Topazine Armor",
            key: `${user.id}_topazineArmor`,
            price: 4500,
            emoji: topazineArmorEmoji,
          },
        ];

        const weaponItems = [
          {
            name: "Blade of the Dead",
            key: `${user.id}_bladeOfTheDead`,
            price: 37000,
            emoji: bladeOfTheDeadEmoji,
          },
          {
            name: "Divine Wrath",
            key: `${user.id}_divineWrath`,
            price: 30000,
            emoji: divineWrathEmoji,
          },
          {
            name: "Umbral Eclipse",
            key: `${user.id}_umbralEclipse`,
            price: 23000,
            emoji: umbralEclipseEmoji,
          },
          {
            name: "Azureblade",
            key: `${user.id}_azureblade`,
            price: 17000,
            emoji: azurebladeEmoji,
          },
          {
            name: "Zephyr's Breeze",
            key: `${user.id}_zephyrsBreeze`,
            price: 13000,
            emoji: zephyrsBreezeEmoji,
          },
          {
            name: "Squire's Honor",
            key: `${user.id}_squiresHonor`,
            price: 7500,
            emoji: squiresHonorEmoji,
          },
          {
            name: "Crimson Dagger",
            key: `${user.id}_crimsonDagger`,
            price: 5000,
            emoji: crimsonDaggerEmoji,
          },
        ];

        // Sort the inventory items by price.
        inventoryItems.sort((a, b) => a.price - b.price);
        armorItems.sort((a, b) => b.price - a.price);
        weaponItems.sort((a, b) => b.price - a.price);

        let totalInventoryValue = 0;

        // Loop through the weapon items and add them to the description.
        let weaponDescription = "";
        for (const item of weaponItems) {
          const value = await get(item.key);
          if (value && item.price && item.price > 0 && value > 0) {
            const itemValue = value * item.price;
            weaponDescription += `**${item.emoji} ${item.name}**: ${value} (${coinEmoji}${itemValue})\n`;
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
            armorDescription += `**${item.emoji} ${item.name}** (${coinEmoji}${itemValue})\n`;
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
            inventoryDescription += `**${item.emoji} ${item.name}**: ${value} (${coinEmoji}${itemValue})\n`;
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
            value: `${coinEmoji}**${totalInventoryValue.toLocaleString()}**`,
            inline: true,
          })
          .setDescription(`**Items:**\n${inventoryDescription}`)
          .setColor(await get(`${interaction.user.id}_color`))
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
          .setColor(await get(`${interaction.user.id}_color`))
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }));

        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("qm_back").setEmoji("⬅️").setStyle(ButtonStyle.Primary));
        await interaction.update({ embeds: [embed], components: [row] });
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
    }
  },
};
