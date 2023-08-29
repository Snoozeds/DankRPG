const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { get } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Displays your/another user's stats.")
    .addUserOption((option) => option.setName("user").setDescription("The user to display stats for.").setRequired(false)),
  async execute(interaction) {
    const user = interaction.options.getUser("user") ?? interaction.user;
    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Stats`)
      .setDescription(`Note: Stats are *very* limited before 29th August 2023.`)
      .addFields([
        { name: "Commands used (total)", value: (await get(`${user.id}_commandsUsed`)) ?? "0" },
        {
          name: "/mine (total)",
          value: `> Times mined: ${(await get(`${user.id}_mine_timesMinedTotal`)) ?? "0"}\n> Stone collected: ${
            (await get(`${user.id}_mine_stoneCollectedTotal`)) ?? "0"
          }\n> Diamonds found: ${(await get(`${user.id}_mine_diamondsFoundTotal`)) ?? "0"}`,
        },
        {
          name: "/chop (total)",
          value: `> Times chopped: ${(await get(`${user.id}_chop_timesChoppedTotal`)) ?? "0"}\n> Wood collected: ${(await get(`${user.id}_chop_woodCollectedTotal`)) ?? "0"}`,
        },
        {
          name: "/fight (total)",
          value: `> Times fought: ${(await get(`${user.id}_fight_timesFoughtTotal`)) ?? "0"}\n> Enemies killed: ${
            (await get(`${user.id}_fight_enemiesKilledTotal`)) ?? "0"
          }\n> Demon Wings dropped: ${(await get(`${user.id}_fight_demonWingsDroppedTotal`)) ?? "0"}`,
        },
        {
          name: "/fish (total)",
          value: `> Times fished: ${(await get(`${user.id}_fish_timesFishedTotal`)) ?? "0"}\n> Fish caught: ${
            (await get(`${user.id}_fish_fishCaughtTotal`)) ?? "0"
          }\n> Legendary fish caught: ${(await get(`${user.id}_fish_legendaryFishCaughtTotal`)) ?? "0"}`,
        },
        {
          name: "/daily (total)",
          value: `> Times daily claimed: ${(await get(`${user.id}_daily_timesDailyClaimedTotal`)) ?? "0"}\n> Longest streak: ${
            (await get(`${user.id}_daily_longestStreak`)) ?? "0" + " days"
          } (max 30 days)`,
        },
        {
          name: "/duel (total)",
          value: `> Times duelled: ${(await get(`${user.id}_duel_timesDuelledTotal`)) ?? "0"}\n> Times won: ${(await get(`${user.id}_duel_timesWonTotal`)) ?? "0"}`,
        },
        {
          name: "/forage (total)",
          value: `> Times foraged: ${(await get(`${user.id}_forage_timesForagedTotal`)) ?? "0"}\n> Diamonds found: ${
            (await get(`${user.id}_forage_diamondsFoundTotal`)) ?? "0"
          }\n> Items found: ${(await get(`${user.id}_forage_itemsFoundTotal`)) ?? "0"}`,
        },
        {
          name: "/adventure (total)",
          value: `> Times adventured: ${(await get(`${user.id}_adventure_timesAdventuredTotal`)) ?? "0"}\n> Coins found: ${
            (await get(`${user.id}_adventure_coinsFoundTotal`)) ?? "0"
          }`,
        },
      ])
      .setColor((await get(`${interaction.user.id}_color`)) ?? "#2b2d31")
      .setFooter({ text: `Stats may not be up to date if ${user === interaction.user.id ? "you have" : "the user has"} disabled stats.` })
      .setThumbnail(user.displayAvatarURL({ dynamic: true }));

    return interaction.reply({ embeds: [embed] });
  },
};
