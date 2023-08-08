const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { get, set, incr, trueEmoji } = require("../../globals.js");

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
    if ((await get(`${interaction.user.id}_learner_achievement`)) != true) {
      await incr(`${interaction.user.id}`, `coins`, 100);
      await set(`${interaction.user.id}_learner_achievement`, true);
    }
    const cat = interaction.options.getString("category");
    const Images = new EmbedBuilder()
      .setTitle(`Commands`)
      .setDescription(
        `**Images:**
\`/avatar\` - Shows your/another user's avatar.
\`/banner\` - Shows your/another user's banner.
\`/changemymind\` - Change my mind.`
      )
      .setColor(await get(`${interaction.user.id}_color`));

    const Misc = new EmbedBuilder()
      .setTitle(`Commands`)
      .setDescription(
        `**Misc:**
\`/8ball\` - Ask the magic 8ball a question.
\`/commands\` - Shows all available commands.
\`/ping\` - Shows the bot's ping.
\`/qm\` - Quickly access menus and commands.
\`/report\` - Send a bug report, suggestion, or user report to the developer.
\`/settings view\` - View your current settings.
\`/settings embedcolor\` - Change the embed color.
\`/settings xpalerts\` - Toggle XP alerts.
\`/settings interactions\` - Toggle interactions.
\`/settings hpdisplay\` - Change how your HP is displayed in /profile.
\`/settings leveldisplay\` - Change how your level is displayed in /profile.
\`/settings reset\` - Reset your settings.
\`/time\` - Get the current time for a timezone.
\`/uptime\` - Shows the bot's uptime.
\`/urban\` - Search the urban dictionary.`
      )
      .setColor(await get(`${interaction.user.id}_color`));

    const Rpg = new EmbedBuilder()
      .setTitle(`Commands`)
      .setDescription(
        `**RPG:**
\`/adventure\` - Starts an RPG adventure. Random chance of getting coins, doesn't scale.
\`/chop\` - Chop down a tree to get wood. Requires an axe.
\`/daily\` - Claim your daily reward.
\`/fight\` - Turn-based fight system. Rewards and difficulty scale with your level.
\`/forage\` - Forages for items in the wilderness.
\`/mine\` - Mines for stone. Requires a pickaxe.
\`/start\` - Starts your DankRPG journey.`
      )
      .setColor(await get(`${interaction.user.id}_color`));

    const Shop = new EmbedBuilder()
      .setTitle(`Commands`)
      .setDescription(
        `**Shop:**
\`/buy\` - Buy an item from the shop.
\`/craft\` - Craft an item with the materials you have.
\`/equip\` - Equip an item from your inventory.
\`/heal\` - Heal yourself for 1 Coin per 1HP.
\`/hp\` - Checks how much it costs to heal to MaxHP.
\`/sell\` - Sell an item from your inventory.
\`/shop\` - Shows the shop.
\`/unequip\` - Unequip an item from your inventory.
\`/upgrade\` - Upgrade your stats.`
      )
      .setColor(await get(`${interaction.user.id}_color`));

    const Social = new EmbedBuilder()
      .setTitle(`Commands`)
      .setDescription(
        `**Social:**
\`/accept\` - Accept a marriage request.
\`/divorce\` - Divorce your spouse.
\`/marry\` - Marry another user.`
      )
      .setColor(await get(`${interaction.user.id}_color`));

    const Stats = new EmbedBuilder()
      .setTitle(`Commands`)
      .setDescription(
        `**Stats:**
\`/achievements\` - Shows your/another user's achievements.
\`/cooldowns\` - Shows your cooldowns.
\`/equipped\` - Shows your equipped items.
\`/info\` - View info about DankRPG.
\`/inventory\` - Shows your/another user's inventory.
\`/levels\` - Shows your/another user's level.
\`/marriage\` - Shows your/another user's marriage.
\`/profile\` - Shows your/another user's profile.
\`/serverinfo\` - Shows info about the current server.
\`/stats\` - Shows your/another user's stats.
\`/userinfo\` - Shows info about you or another user.`
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
  },
};
