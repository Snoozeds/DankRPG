const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { get, coinEmoji, hpEmoji, armorEmoji, attackEmoji, levelEmoji } = require("../../globals.js");

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
    const hpType = await get(`${user.id}_hp_display`);
    const xpType = await get(`${user.id}_level_display`);
    
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
    if (xpType === "level/xp" || xpType == null) {
      levelMessage = `**${levelEmoji} ${await get(`${user.id}_level`)} | ${await get(`${user.id}_xp`)}XP**`;
    } else if (xpType === "level/xpnext") {
      levelMessage = `**${levelEmoji} ${await get(`${user.id}_level`)} | ${await get(`${user.id}_xp`)}XP (${await get(`${user.id}_xp_needed`)})**`;
    }
    
    const profile = new EmbedBuilder()
      .setTitle(`${user.username}'s Profile`)
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
    await interaction.reply({ embeds: [profile] });
  },
};
