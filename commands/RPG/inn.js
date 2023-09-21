const { SlashCommandBuilder } = require("discord.js");
const { incr, emoji, cooldown } = require("../../globals.js");
const ms = require("ms");

module.exports = {
  data: new SlashCommandBuilder().setName("inn").setDescription("Rest at the inn to instantly gain 10 energy. 12 hour cooldown."),
  async execute(interaction) {
    const user = interaction.user;
    const energyIncrease = 10;
    const cooldownTime = 43200000; // 12 hours in milliseconds
    if (await cooldown.check(user.id, "inn")) {
      const hours = Math.floor((await cooldown.get(user.id, "inn")) / 3600000);
      const minutes = Math.floor((await cooldown.get(user.id, "inn")) / 60000) % 60;
      const seconds = Math.floor((await cooldown.get(user.id, "inn")) / 1000) % 60;
      return interaction.reply({
        content: `The innkeeper says, "You've already rested here. Please wait ${hours}h ${minutes}m ${seconds}s before resting again."`,
        ephemeral: true,
      });
    }
    await cooldown.set(user.id, "inn", cooldownTime);
    await incr(user.id, "energy", energyIncrease);
    return interaction.reply({
      content: `The innkeeper says, "You've rested well. You feel refreshed and ready to go!"\n${emoji.energy} +${energyIncrease} energy`,
      ephemeral: true,
    });
  },
};
