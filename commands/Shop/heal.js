const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { get, incr, decr, coinEmoji, hpEmoji } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("heal")
    .setDescription("Heal yourself for 1 Coin per 1HP.")
    .addIntegerOption((option) => option.setName("amount").setDescription("Amount of HP to heal.").setRequired(false))
    .addBooleanOption((option) => option.setName("max").setDescription("Heal to maximum HP.").setRequired(false)),
  async execute(interaction) {
    const id = interaction.user.id;
    const hp = await get(`${id}_hp`);
    const max_hp = await get(`${id}_max_hp`);
    const user = interaction.user;

    if (hp == max_hp) {
      return interaction.reply({
        content: `You are already at full health!`,
        ephemeral: true,
      });
    } else {
      let amount = interaction.options.getInteger("amount");
      const max = interaction.options.getBoolean("max");
      const coins = await get(`${id}_coins`);
      let cost = 0;

      if (amount !== null && max) {
        return interaction.reply({
          content: `Please select either an amount of HP to heal or the "max" option, not both.`,
          ephemeral: true,
        });
      } else if (amount !== null && amount < 0) {
        return interaction.reply({
          content: "The amount must be a positive integer.",
          ephemeral: true,
        });
      } else if (max) {
        amount = max_hp - hp;
        cost = amount;
      } else if (amount === null) {
        return interaction.reply({
          content: `Please specify an amount of HP to heal or choose the "max" option.`,
          ephemeral: true,
        });
      } else {
        cost = amount;
      }
      if (coins < cost || coins === undefined) {
        return interaction.reply({
          content: `You don't have enough coins to heal yourself for ${amount}HP!\n**You have ${coinEmoji}${coins}**, but **you need ${coinEmoji}${cost}**.`,
          ephemeral: true,
        });
      } else {
        if (Number(hp) + Number(amount) > Number(max_hp)) {
          return interaction.reply({
            content: `You can't heal yourself for more than your max HP!`,
            ephemeral: true,
          });
        } else {
          await decr(id, "coins", cost);
          await incr(id, "hp", amount);
          await incr(id, "commandsUsed", 1);
          const new_hp = await get(`${id}_hp`);
          const new_coins = await get(`${id}_coins`);
          const embed = new EmbedBuilder()
            .setTitle("Heal")
            .setDescription(`You healed yourself for ${amount}HP!`)
            .setFields([
              {
                name: "Coins",
                value: `**${coinEmoji} ${new_coins}**`,
                inline: true,
              },
              {
                name: "HP",
                value: `**${hpEmoji} ${new_hp}** (+${amount})`,
                inline: true,
              },
            ])
            .setColor(await get(`${user.id}_color`))
            .setTimestamp();
          return interaction.reply({ embeds: [embed] });
        }
      }
    }
  },
};
