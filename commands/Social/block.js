const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("block")
    .setDescription("Block a user from sending you duel and marriage requests.")
    .addSubcommand((subcommand) => subcommand.setName("list").setDescription("List all users you have blocked."))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Block a user.")
        .addUserOption((option) => option.setName("user").setDescription("The user to block. Can also use their userID.").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Unblock a user.")
        .addUserOption((option) => option.setName("user").setDescription("The user to unblock. Can also use their userID.").setRequired(true))
    )
    .addSubcommand((subcommand) => subcommand.setName("reset").setDescription("Unblocks ALL USERS.")),
  async execute(interaction) {
    // Note: This is using Redis lists.
    // Redis lists are FIFO (first in, first out) so the most recent blocked user will be at the top of the list.

    const user = interaction.user.id;

    if (interaction.options.getSubcommand() === "add") {
      const blockedUser = interaction.options.getUser("user").id;
      if (user === blockedUser) {
        return interaction.reply({ content: "You can't block yourself!", ephemeral: true });
      }

      // Check if the user is already in the list
      const isBlocked = await redis.lrange(`${user}_blockedUsers`, 0, -1);
      if (isBlocked.includes(blockedUser)) {
        // User is already blocked, prompt for unblocking
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("unblock").setLabel("Unblock").setStyle("Success"),
          new ButtonBuilder().setCustomId("cancel").setLabel("Cancel").setStyle("Danger")
        );

        const msg = await interaction.reply({
          content: `You have already blocked the user <@${blockedUser}>. Do you want to unblock them?`,
          components: [row],
          ephemeral: true,
        });

        const collector = msg.createMessageComponentCollector({ time: 15000 }); // 15 seconds

        collector.on("collect", async (i) => {
          if (i.customId === "unblock") {
            await redis.lrem(`${user}_blockedUsers`, 0, blockedUser);
            await i.update({ content: `Unblocked ${blockedUser}!`, components: [], ephemeral: true });
          } else if (i.customId === "cancel") {
            await i.update({ content: "Cancelled!", components: [], ephemeral: true });
          }
        });
      } else {
        // User is not blocked, add them to the list
        await redis.lpush(`${user}_blockedUsers`, blockedUser);
        return interaction.reply({ content: `Blocked <@${blockedUser}>!`, ephemeral: true });
      }
    } else if (interaction.options.getSubcommand() === "remove") {
      const blockedUser = interaction.options.getUser("user").id;
      // Check if the user is in the list
      const isBlocked = await redis.lrange(`${user}_blockedUsers`, 0, -1);
      if (isBlocked.includes(blockedUser)) {
        // User is blocked, remove them from the list
        await redis.lrem(`${user}_blockedUsers`, 0, blockedUser);
        return interaction.reply({ content: `Unblocked <@${blockedUser}>!`, ephemeral: true });
      } else {
        // User is not blocked, prompt for blocking
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("block").setLabel("Block").setStyle("Danger"),
          new ButtonBuilder().setCustomId("cancel").setLabel("Cancel").setStyle("Primary")
        );

        const msg = await interaction.reply({
          content: `You have not blocked the user <@${blockedUser}>. Do you want to block them?`,
          components: [row],
          ephemeral: true,
        });

        const collector = msg.createMessageComponentCollector({ time: 15000 }); // 15 seconds

        collector.on("collect", async (i) => {
          if (i.customId === "block") {
            await redis.lpush(`${user}_blockedUsers`, blockedUser);
            await i.update({ content: `Blocked <@${blockedUser}>!`, components: [], ephemeral: true });
          } else if (i.customId === "cancel") {
            await i.update({ content: "Cancelled!", components: [], ephemeral: true });
          }
        });
      }
    } else if (interaction.options.getSubcommand() === "list") {
      // Get the list of blocked users
      const blockedUsers = await redis.lrange(`${user}_blockedUsers`, 0, -1);
      if (blockedUsers === null || blockedUsers.length === 0) {
        return interaction.reply({ content: "You have not blocked any users!", ephemeral: true });
      } else {
        return interaction.reply({ content: `You have blocked the following users:\n${blockedUsers.join(", ")}`, ephemeral: true });
      }
    } else if (interaction.options.getSubcommand() === "reset") {
      // Confirm with the user
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("Yes").setLabel("Yes").setStyle("Success"),
        new ButtonBuilder().setCustomId("cancel").setLabel("Cancel").setStyle("Danger")
      );

      const msg = await interaction.reply({
        content: `Are you sure you want to **UNBLOCK ALL USERS?**`,
        components: [row],
        ephemeral: true,
      });

      const collector = msg.createMessageComponentCollector({ time: 15000 }); // 15 seconds

      collector.on("collect", async (i) => {
        if (i.customId === "Yes") {
          await redis.del(`${user}_blockedUsers`);
          await i.update({ content: `Unblocked all users!`, components: [], ephemeral: true });
        } else if (i.customId === "cancel") {
          await i.update({ content: "Cancelled!", components: [], ephemeral: true });
        }
      });
    }
  },
};
