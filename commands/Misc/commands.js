const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { get, set, incr, coinEmoji } = require("../../globals.js");

// Used to link commands, making them clickable in the embed.
// See ../deploy-commands for how the command IDs are stored.
const fs = require("node:fs");
const getCommandId = (commandName) => {
  // Read the JSON file containing the command IDs
  const commandData = fs.readFileSync("./command_data/commands.json", "utf8");
  const data = JSON.parse(commandData);

  // Retrieve the command ID from the parsed data
  const command = data.find((cmd) => cmd.name === commandName);
  return command ? command.id : null; // Return null if the command is not found
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("commands")
    .setDescription("Shows all available commands.")
    .addStringOption((option) =>
      option
        .setName("category")
        .setDescription("The category of commands you want to view")
        .setRequired(true)
        .addChoices(
          { name: "Images", value: "Images" },
          { name: "Misc", value: "Misc" },
          { name: "RPG", value: "Rpg" },
          { name: "Shop", value: "Shop" },
          { name: "Social", value: "Social" },
          { name: "Stats", value: "Stats" }
        )
    ),

  async execute(interaction) {
    const user = interaction.user;
    const cat = interaction.options.getString("category");
    const Images = new EmbedBuilder()
      .setTitle(`Commands`)
      .setDescription(
        `**Images:**
</avatar:${await getCommandId("avatar")}> - Shows your/another user's avatar.
</banner:${await getCommandId("banner")}> - Shows your/another user's banner.
</changemymind:${await getCommandId("changemymind")}> - Change my mind.`
      )
      .setColor(await get(`${interaction.user.id}_color`));

    const Misc = new EmbedBuilder()
      .setTitle(`Commands`)
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
</settings confirmations:${await getCommandId("settings")}> - Toggle the type of confirmations you get when performing certain actions.
</settings reset:${await getCommandId("settings")}> - Reset your settings.
</time:${await getCommandId("time")}> - Get the current time for a timezone.
</uptime:${await getCommandId("uptime")}> - Shows the bot's uptime.`
      )
      .setColor(await get(`${interaction.user.id}_color`));

    const Rpg = new EmbedBuilder()
      .setTitle(`Commands`)
      .setDescription(
        `**RPG:**
</adventure:${await getCommandId("adventure")}> - Starts an RPG adventure. 60% chance of getting coins, doesn't scale.
</chop:${await getCommandId("chop")}> - Chop down a tree to get wood. Requires an axe.
</daily:${await getCommandId("daily")}> - Claim your daily reward.
</duel:${await getCommandId("duel")}> - Duel another user for coins.
</fight:${await getCommandId("fight")}> - Turn-based fight system. Rewards and difficulty scale with your level.
</forage:${await getCommandId("forage")}> - Forage for items in the wilderness.
</mine:${await getCommandId("mine")}> - Mine for stone. Craft a pickaxe to mine faster.`
      )
      .setColor(await get(`${interaction.user.id}_color`));

    const Shop = new EmbedBuilder()
      .setTitle(`Commands`)
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
      .setColor(await get(`${interaction.user.id}_color`));

    const Social = new EmbedBuilder()
      .setTitle(`Commands`)
      .setDescription(
        `**Social:**
</accept:${await getCommandId("accept")}> - Accept an ongoing marriage request.
</block add:${await getCommandId("block")}> - Block a user.
</block remove:${await getCommandId("block")}> - Unblock a user.
</block list:${await getCommandId("block")}> - List all blocked users.
</block reset:${await getCommandId("block")}> - Unblocks ALL USERS.
</divorce:${await getCommandId("divorce")}> - Divorce your partner.
</marry:${await getCommandId("marry")}> - Propose to another user.`
      )
      .setColor(await get(`${interaction.user.id}_color`));

    const Stats = new EmbedBuilder()
      .setTitle(`Commands`)
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
      .setColor(await get(`${interaction.user.id}_color`));

    if (cat === "Images") {
      await interaction.reply({ embeds: [Images] });
    } else if (cat === "Misc") {
      await interaction.reply({ embeds: [Misc] });
    } else if (cat === "Rpg") {
      await interaction.reply({ embeds: [Rpg] });
    } else if (cat === "Shop") {
      await interaction.reply({ embeds: [Shop] });
    } else if (cat === "Social") {
      await interaction.reply({ embeds: [Social] });
    } else if (cat === "Stats") {
      await interaction.reply({ embeds: [Stats] });
    }

    // Learner achievement
    if ((await get(`${interaction.user.id}_learner_achievement`)) !== "true") {
      await incr(`${interaction.user.id}`, `coins`, 100);
      await set(`${interaction.user.id}_learner_achievement`, true);
      const embed = new EmbedBuilder()
        .setTitle("Achievement Unlocked!")
        .setDescription(`:white_check_mark: You unlocked the **Learner** achievement, ${user.username}! (+${coinEmoji}**100**.)`)
        .setColor(await get(`${interaction.user.id}_color`));
      await interaction.followUp({ embeds: [embed] });
    }
  },
};
