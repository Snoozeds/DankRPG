const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { get } = require("../../globals.js");
const chance = require("chance").Chance();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("Asks the magic 8ball a question.")
    .addStringOption((option) => option.setName("question").setDescription("The question to ask the magic 8ball.").setRequired(true)),
  async execute(interaction) {
    const responses = [
      "Surely",
      "Certainly",
      "Outlook good",
      "Probably",
      "Maybe",
      "Maybe soon",
      "Maybe later",
      "Outlook not so good",
      "Probably not",
      "Surely not",
      "Certainly not",
      "Don't count on it",
      "No",
      "Nope",
      "Definitely not",
      "Absolutely not",
      "Absolutely",
      "Definitely",
      "Yes",
      "Yep",
      "It is certain",
      "It is decidedly so",
      "Without a doubt",
      "Yes, definitely",
      "You may rely on it",
      "As I see it, yes",
      "Most likely",
      "Signs point to yes",
      "Cannot predict now",
      "Reply hazy, try again",
      "Ask again later",
      "Better not tell you now",
      "Cannot say now",
      "Concentrate and ask again",
      "My sources say no",
      "Outlook hazy, try again",
      "Very doubtful",
      "It is not in my programming to answer that",
      "I'm not sure about that",
      "I'm unable to answer that question",
    ];
    const embed = new EmbedBuilder()
      .setTitle("You ask the magic 8ball a question.")
      .setDescription(`**Question:** ${interaction.options.getString("question")}\n**Answer:** ${chance.pickset(responses, 1)}.`)
      .setColor((await get(`${interaction.user.id}_color`)) ?? "#2b2d31")
    await interaction.reply({ embeds: [embed] });
  },
};
