const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { get, emoji } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder().setName("vote").setDescription("Vote on top.gg to earn rewards and help the bot reach more users."),
  async execute(interaction) {
    const user = interaction.user;
    const voted = await get(`${user.id}_vote_cooldown`);

    if ((voted == "" || voted == null) && voted < Date.now()) {
      const embed = new EmbedBuilder()
        .setTitle("Top.gg Voting")
        .setDescription(
          `You have voted ${(await get(`${user.id}_votes`)) ?? "0"} times.
          Voting for DankRPG on top.gg will give you ${emoji.coins}**500**. You may do this once every 12 hours. Voting helps the bot reach more users, thank you.`
        )
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setColor((await get(`${user.id}_color`)) ?? "#2b2d31");

      const voteButton = new ButtonBuilder().setLabel("Vote (top.gg)").setURL("https://top.gg/bot/855479925863481345/vote").setStyle(ButtonStyle.Link);
      const row = new ActionRowBuilder().addComponents(voteButton);

      return interaction.reply({
        content: "**Please note that top.gg is not owned or ran by the bot developer, nor is there an option for the bot developer to disable their advertisements.**",
        embeds: [embed],
        components: [row],
      });
    } else if (voted > Date.now()) {
      return interaction.reply({
        content: `You have already voted in the past 12 hours. Please return <t:${Math.round(voted / 1000)}:R>.`,
        ephemeral: true,
      });
    }
  },
};
