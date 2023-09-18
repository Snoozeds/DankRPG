const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { set, get, incr, decr, emoji, cooldown } = require("../../globals.js");
const ms = require("ms");

let adventureOutcomes = [
  {
    name: `${emoji.chest} Chest`,
    description: `You found a chest and opened it. You found ${emoji.coins}100!`,
    coins: 100,
  },
  {
    name: `${emoji.monster} Monster`,
    description: `You encountered a monster! You lost ${emoji.coins}50!`,
    coins: -50,
  },
  {
    name: `${emoji.questionMark} Nothing...`,
    description: `You found nothing.`,
    coins: 0,
  },
  {
    name: `${emoji.boss} Boss`,
    description: `You encountered a boss! You lost ${emoji.coins}100!`,
    coins: -100,
  },
  {
    name: `${emoji.home} Abandoned Building`,
    description: `You found an abandoned building. You search the building and found ${emoji.coins}200!`,
    coins: 200,
  },
  {
    name: `${emoji.injured} Injured Friend`,
    description: `You found an injured friend. You helped them and they gave you ${emoji.coins}100!`,
    coins: 100,
  },
  {
    name: `${emoji.injured} Injured Monster`,
    description: `You found an injured monster. You helped them and they gave you ${emoji.coins}100!`,
    coins: 100,
  },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("adventure")
    .setDescription("Go on an adventure and encounter random events for coins. Requires energy.")
    .addIntegerOption((option) => option.setName("times").setDescription("How many times to adventure. Each adventure costs 1 energy.")),
  async execute(interaction) {
    const user = interaction.user;
    const energy = Number(await get(`${user.id}_energy`)) ?? 0;
    const times = interaction.options.getInteger("times") ?? 1;

    if ((await get(`${user.id}_coins`)) < 100) {
      adventureOutcomes = adventureOutcomes.filter((outcome) => outcome.coins < 0);
    }

    const randomOutcome = () => {
      return adventureOutcomes[Math.floor(Math.random() * adventureOutcomes.length)];
    };

    if (times < 1) {
      return interaction.reply({
        content: `Please enter a number greater than 0.`,
        ephemeral: true,
      });
    }

    if (times > 20) {
      return interaction.reply({
        content: `You can only adventure 20 times at a time.`,
        ephemeral: true,
      });
    }

    if (energy < times) {
      return interaction.reply({
        content: `You don't have enough energy! You need ${emoji.energy}${times - energy} more to adventure ${times} time${times > 1 ? "s" : ""}.`,
        ephemeral: true,
      });
    }

    if (await cooldown.check(interaction.user.id, "adventure")) {
      return interaction.reply({
        content: `You're on cooldown! Please wait ${ms(await cooldown.get(interaction.user.id, "adventure"))} before using this command again.`,
        ephemeral: true,
      });
    }

    const cooldownTime = 30 * times;
    await cooldown.set(interaction.user.id, "adventure", ms(`${cooldownTime}s`));

    let totalCoins = 0;
    let fields = [];

    for (let i = 0; i < times; i++) {
      const outcome = randomOutcome();
      if (outcome.coins > 0) {
        await incr(user.id, "coins", outcome.coins);
      }
      if (outcome.coins < 0 && outcome.coins !== 0) {
        await decr(user.id, "coins", outcome.coins);
      }
      totalCoins += outcome.coins;
      fields.push({
        name: `${outcome.name}`,
        value: outcome.description,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`${user.username} goes on an adventure...`)
      .setDescription(
        `You ${totalCoins > 0 ? "gained" : "lost"} ${emoji.coins}${Math.abs(totalCoins)} from adventuring ${times} time${times > 1 ? "s" : ""}\n\nYou encountered:`
      )
      .setColor((await get(`${user.id}_color`)) ?? "#2b2d31")
      .setFields(fields);

    await set(`${user.id}_energy`, energy - times);
    await interaction.reply({ embeds: [embed] });
  },
};
