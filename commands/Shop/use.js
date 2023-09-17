const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { get, incr, decr, emoji } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("use")
    .setDescription("Use an item from your inventory.")
    .addStringOption((option) =>
      option
        .setName("item")
        .setDescription("The item you want to use.")
        .setRequired(true)
        .addChoices({ name: "Health Potion", value: "healthPotion" }, { name: "Luck Potion", value: "luckPotion" }, { name: "Energy Potion", value: "energyPotion" })
    ),

  async execute(interaction) {
    const item = interaction.options.getString("item");
    const user = interaction.user;
    const healthIncrease = 100;

    if (item === "healthPotion") {
      const newHealth = Number(await get(`${user.id}_hp`)) + healthIncrease;
      const maxHealth = Number(await get(`${user.id}_max_hp`));
      const hasItem = Number(await get(`${user.id}_healthPotion`));

      if (hasItem < 1 || hasItem == null || hasItem == "") {
        return interaction.reply({
          content: `You don't have any health potions!`,
          ephemeral: true,
        });
      }

      if (newHealth <= maxHealth) {
        await incr(user.id, "hp", healthIncrease);
        await decr(user.id, "healthPotion", 1);
        return interaction.reply({
          content: `You used a ${emoji.healthPotion} health potion! You gained ${healthIncrease} HP. (${newHealth}/${maxHealth})\nYou now have ${
            hasItem - 1
          } health potions left.`,
        });
      } else {
        return interaction.reply({
          content: `You can't use a health potion if using it would put you over your max HP! (${newHealth}/${maxHealth})`,
          ephemeral: true,
        });
      }
    } else if (item === "luckPotion") {
      const hasItem = Number(await get(`${user.id}_luckPotion`));
      const luckAmount = 10;
      const expiration = 600;
      const luckPotionActive = await get(`${user.id}_luckPotionActive`);

      if (hasItem < 1 || hasItem == null || hasItem == "") {
        return interaction.reply({
          content: `You don't have any luck potions!`,
          ephemeral: true,
        });
      }

      if (luckPotionActive === "true") {
        return interaction.reply({
          content: `You already have a luck potion active!`,
          ephemeral: true,
        });
      }

      await decr(user.id, "luckPotion", 1);
      await redis.set(`${user.id}_luckBonus`, luckAmount, "EX", expiration); // Using the Redis EX option. See: https://redis.io/commands/set/#options
      await redis.set(`${user.id}_luckPotionActive`, true, "EX", expiration);
      return interaction.reply({
        content: `You used a ${emoji.luckPotion} luck potion! You now have a 10% increased chance of finding rare items for 10 minutes.`,
      });
    } else if (item === "energyPotion") {
      const hasItem = Number(await get(`${user.id}_energyPotion`));
      const energyIncrease = 10;

      if (hasItem < 1 || hasItem == null || hasItem == "") {
        return interaction.reply({
          content: `You don't have any energy potions!`,
          ephemeral: true,
        });
      }

      await incr(user.id, "energy", energyIncrease);
      await decr(user.id, "energyPotion", 1);
      return interaction.reply({
        content: `You used an ${emoji.energyPotion} energy potion! You gained ${emoji.energy}${energyIncrease}.`,
      });
    }
  },
};
