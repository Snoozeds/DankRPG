const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { get, set, incr, diamondEmoji } = require("../../globals.js");
const { CommandCooldown, msToMinutes } = require("discord-command-cooldown");
const ms = require("ms");
const chance = require("chance").Chance();

const forageCommandCooldown = new CommandCooldown("forage", ms("30s")); // create CommandCooldown instance here

module.exports = {
  data: new SlashCommandBuilder()
    .setName("forage")
    .setDescription("Forages for items in the wilderness."),
  async execute(interaction) {
    const user = interaction.user;

    // The command errors if the user's items are not defined (null.)
    const items = ["stone", "wood", "diamond"];

    for (const item of items) {
      if (!(await get(`${user.id}_${item}`))) {
        await set(`${user.id}_${item}`, 0);
      }
    }

    const userCooldowned = await forageCommandCooldown.getUser(
      interaction.user.id
    );
    if (userCooldowned) {
      const timeLeft = msToMinutes(userCooldowned.msLeft, false);
      await interaction.reply({
        content: `You need to wait ${timeLeft.seconds}s before using this command again!`,
        ephemeral: true,
      });
    } else {
      const rare = chance.weighted([true, false], [10, 90]); // 10% chance of getting a rare item
      const embed = new EmbedBuilder()
        .setTitle("Foraging...")
        .setDescription(`<@${user.id}> goes foraging in the wilderness.`)
        .setColor(await get(`${user.id}_color`))
        .setThumbnail("https://assets.dankrpg.xyz/Images/forage.png");
      if (rare) {
        embed.setFields({
          name: "Diamond",
          value: `You found 1x ${diamondEmoji}**Diamond**!`,
        });
        await incr(user.id, "diamond", 1);
      } else {
        const amount = chance.integer({ min: 3, max: 5 });
        const set = chance.weighted(["wood", "stone"], [40, 60]);
        embed.setFields({
          name: `${set}`,
          value: `You found ${amount} **${set}**!`,
        });
        await incr(user.id, set, amount);
      }
      await interaction.reply({ embeds: [embed] });
      await incr(user.id, "commandsUsed", 1);
      await forageCommandCooldown.addUser(interaction.user.id);
    }
  },
};
