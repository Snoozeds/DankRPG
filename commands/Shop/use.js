const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { get, incr, decr, emoji } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("use")
    .setDescription("Use an item from your inventory.")
    .addStringOption((option) =>
      option.setName("item").setDescription("The item you want to use.").setRequired(true).addChoices({ name: "Health Potion", value: "healthPotion" })
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
    }
  },
};
