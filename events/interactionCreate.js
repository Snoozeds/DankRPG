const { Events } = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction) {
    if (!interaction.isCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    // If the command doesn't exist, log it and return.
    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found. Make sure the file exists.`);
      return;
    }

    if ((await redis.get(`${interaction.user.id}_hasStarted`)) !== "1") {
      await redis.set(`${interaction.user.id}_coins`, "0");
      await redis.set(`${interaction.user.id}_hp`, "100");
      await redis.set(`${interaction.user.id}_max_hp`, "100");
      await redis.set(`${interaction.user.id}_armor`, "0");
      await redis.set(`${interaction.user.id}_damage`, "5");
      await redis.set(`${interaction.user.id}_xp`, "0");
      await redis.set(`${interaction.user.id}_xp_needed`, "100");
      await redis.set(`${interaction.user.id}_level_xp`, "100");
      await redis.set(`${interaction.user.id}_next_level`, 2);
      await redis.set(`${interaction.user.id}_level`, "1");
      await redis.set(`${interaction.user.id}_hasStarted`, "1");
      await redis.set(`${interaction.user.id}_color`, "#FFE302");
      await redis.set(`${interaction.user.id}_xp_alerts`, "1");
      await redis.set(`${interaction.user.id}_commandsUsed`, "1");

      await command.execute(interaction);
      return;
    }

    // Achievement for April Fools. (1st-3rd April)
    // Remember that JavaScript counts months from 0.

    if ((await redis.get(`${interaction.user.id}_april_achievement`)) !== null && (await redis.get(`${interaction.user.id}_april_achievement`)) != true) {
      const today = new Date();
      const start = new Date(Date.UTC(today.getUTCFullYear(), 3, 1)); // April 1st, UTC
      const end = new Date(Date.UTC(today.getUTCFullYear(), 3, 3)); // April 3rd, UTC
      if (today >= start && today <= end) {
        redis.set(`${interaction.user.id}_april_achievement`, true);
        redis.incrby(`${interaction.user.id}_coins`, 500);
      }
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
      // The user will see this if an error occurs. Can be good for reporting bugs.
    }
  },
};
