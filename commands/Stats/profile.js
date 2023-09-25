const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { set, get, emoji } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("View your or another user's rpg profile.")
    .addUserOption((option) => option.setName("user").setDescription("The member whose profile you want to view").setRequired(false)),
  async execute(interaction) {
    const user = interaction.options.getUser("user") ?? interaction.user;
    if (await get(`${user.bot}`))
      return interaction.reply({
        content: "Bots don't have RPG profiles.\nIf you are looking for information about a bot user, use `/userinfo`.",
        ephemeral: true,
      });
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
      hpMessage = `${await generateHpBar(hp, maxHp, 10)}`;
      hpName = `${emoji.hp} HP ${await get(`${user.id}_hp`)}/${await get(`${user.id}_max_hp`)} (${percentage.toFixed(2)}%)`;
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
      levelMessage = `${await generateLevelBar(xp, xpNeeded, 10)}`;
      levelName = `${emoji.level} Level ${await get(`${user.id}_level`)} (${percentage.toFixed(2)}%)`;
    }

    let statsText = "";
    if ((await get(`${user.id}_statsEnabled`)) === "1" || (await get(`${user.id}_statsEnabled`)) == "" || (await get(`${user.id}_statsEnabled`)) == null) {
      statsText = `${(await get(`${user.id}_commandsUsed`)) ?? "0"}`;
    } else if ((await get(`${user.id}_statsEnabled`)) === "0") {
      statsText = `Stats disabled.`;
    }

    const profile = new EmbedBuilder()
      .setTitle(`${user.username}'s Profile`)
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
      .setColor((await get(`${interaction.user.id}_color`)) ?? "#2b2d31")
      .setFooter({ text: "Requested by " + interaction.user.username })
      .setTimestamp();
    await interaction.reply({ embeds: [profile] });
  },
};
