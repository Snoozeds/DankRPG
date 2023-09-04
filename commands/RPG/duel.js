const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { get, set, cooldown, emoji } = require("../../globals.js");
const ms = require("ms");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("duel")
    .setDescription("Duel another player.")
    .addUserOption((option) => option.setName("user").setDescription("The user to duel.").setRequired(true)),
  async execute(interaction) {
    const user = interaction.user;
    const target = interaction.options.getUser("user");

    const isBlocked = await redis.lrange(`${target.id}_blockedUsers`, 0, -1);
    if (isBlocked !== null && isBlocked.includes(user.id)) {
      return interaction.reply({
        content: "You cannot duel this user.",
        ephemeral: true,
      });
    }

    // Cooldowns
    const userCooldowned = await cooldown.check(interaction.user.id, "duel");
    const targetCooldowned = await cooldown.check(interaction.options.getUser("user").id, "duel");
    const userCancelled = await cooldown.check(interaction.user.id, "duelCancel");

    if (userCooldowned) {
      const minutes = Math.floor((await cooldown.get(interaction.user.id, "duel")) / 60000) % 60;
      const seconds = Math.floor((await cooldown.get(interaction.user.id, "duel")) / 1000) % 60;
      return interaction.reply({
        content: `You need to wait ${minutes}m ${seconds}s before using this command again!`,
        ephemeral: true,
      });
    }

    if (targetCooldowned) {
      const minutes = Math.floor((await cooldown.get(interaction.options.getUser("user").id, "duel")) / 60000) % 60;
      const seconds = Math.floor((await cooldown.get(interaction.options.getUser("user").id, "duel")) / 1000) % 60;
      return interaction.reply({
        content: `That user needs to wait ${minutes}m ${seconds}s before you can duel them.`,
        ephemeral: true,
      });
    }

    // Cooldown so users can't spam cancel duel requests.
    if (userCancelled) {
      return interaction.reply({
        content: `You have cancelled a duel request recently. You need to wait ${ms(await cooldown.get(interaction.user.id, "duelCancel"))} before using this command again.`,
        ephemeral: true,
      });
    }

    // Variables
    const userHealth = await get(`${user.id}_hp`);
    const userMaxHealth = await get(`${user.id}_max_hp`);
    const userArmor = await get(`${user.id}_armor`);
    const userDamage = await get(`${user.id}_damage`);
    const targetHealth = await get(`${target.id}_hp`);
    const targetMaxHealth = await get(`${target.id}_max_hp`);
    const targetArmor = await get(`${target.id}_armor`);
    const targetDamage = await get(`${target.id}_damage`);

    // Check if users are in a duel already.
    // + Failsafe incase it bugs.
    if ((await get(`${user.id}_duel`)) === "true") {
      if (Date.now() - (await get(`${user.id}_duelTimestamp`)) < 900000) {
        return interaction.reply({
          content: `You are already in a duel or have sent a duel request. Please wait.\n> :information_source: If you are stuck in a duel, it will automatically end after 15 minutes.`,
          ephemeral: true,
        });
      } else {
        await set(`${user.id}_duel`, false);
      }
    }
    if ((await get(`${target.id}_duel`)) === "true") {
      if (Date.now() - (await get(`${target.id}_duelTimestamp`)) < 900000) {
        return interaction.reply({
          content: `That user is already in a duel or has sent their own duel request. Please wait.\n> :information_source: If the user is stuck in a duel, it will automatically end after 15 minutes.`,
          ephemeral: true,
        });
      } else {
        await set(`${target.id}_duel`, false);
      }
    }

    // Other checks
    if (target.bot === true) {
      return interaction.reply({
        content: "You can't duel a bot.",
        ephemeral: true,
      });
    }
    if (user.id === target.id) {
      return interaction.reply({
        content: "You can't duel yourself.",
        ephemeral: true,
      });
    }
    if (userHealth <= 0) {
      return interaction.reply({
        content: "You can't duel with no health.",
        ephemeral: true,
      });
    }
    if ((await get(`${target.id}_interactions`)) === "0") {
      return interaction.reply({
        content: "That user has disabled interactions.",
        ephemeral: true,
      });
    }
    if (targetHealth <= 0) {
      return interaction.reply({
        content: "You can't duel a user that has no health.",
        ephemeral: true,
      });
    }

    // Embed - Setup
    await set(`${user.id}_duel`, true);
    await set(`${user.id}_duelTimestamp`, Date.now());
    const setupEmbed = new EmbedBuilder()
      .setTitle("Duel Setup")
      .setDescription(`### ${user.username} has challenged ${target.username} to a duel.`)
      .addFields(
        {
          name: `${user.username}'s Stats`,
          value: `${emoji.hp}${userHealth}/${userMaxHealth}\n${emoji.armor}${userArmor}\n${emoji.attack}${userDamage} (${userDamage * 5} damage)`,
          inline: true,
        },
        {
          name: `${target.username}'s Stats`,
          value: `${emoji.hp}${targetHealth}/${targetMaxHealth}\n${emoji.armor}${targetArmor}\n${emoji.attack}${targetDamage} (${targetDamage * 5} damage)`,
          inline: true,
        },
        {
          name: `Rules:`,
          value: `- The first person to reach 0 health dies and loses the duel. **It is highly recommended to own a lifesaver.**\n- You cannot heal while you are in a duel.\n- Defending will divide damage by your armor stat.\n - If you do not have armor, or your armor is 1, damage will be divided by 2 when defending.\n- You may try to escape, but will not recieve any rewards for doing so.\n - Escape chance increases by 5% for each failed attempt, and caps once it goes past 60%.\n- You have 1 hour to respond to this duel. If you do not respond within 1 hour, the duel will be cancelled.\n- The winner of the duel will receive 250 coins.`,
        },
        {
          name: `Actions`,
          value: `${target.username}, do you accept this duel?`,
        }
      )
      .setColor((await get(`${user.id}_color`)) ?? "#2b2d31");

    // Buttons - Setup
    const yesButton = new ButtonBuilder().setCustomId(`duelAccept-${user.id}-${target.id}`).setLabel("Yes").setStyle(ButtonStyle.Success);
    const noButton = new ButtonBuilder().setCustomId(`duelDecline-${user.id}-${target.id}`).setLabel("No").setStyle(ButtonStyle.Danger);
    const userCancel = new ButtonBuilder().setCustomId(`userCancel-${user.id}-${target.id}`).setLabel(`Cancel duel request`).setStyle(ButtonStyle.Danger);
    const row = new ActionRowBuilder().addComponents(yesButton, noButton, userCancel);

    await interaction.reply({
      content: `<@${target.id}>, you have been challenged to a duel! Do you accept this duel?\nYou have 1 hour to respond.`,
      embeds: [setupEmbed],
      components: [row],
    });
  },
};
