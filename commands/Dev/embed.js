const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  nonGlobal: true,
  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Creates an embed")
    .addStringOption((option) => option.setName("title").setDescription("Title of the embed").setRequired(false))
    .addStringOption((option) => option.setName("description").setDescription("Description of the embed").setRequired(false))
    .addStringOption((option) => option.setName("color").setDescription("Color of the embed").setRequired(false))
    .addStringOption((option) => option.setName("footer").setDescription("Footer of the embed").setRequired(false))
    .addStringOption((option) => option.setName("image").setDescription("Image of the embed").setRequired(false))
    .addStringOption((option) => option.setName("thumbnail").setDescription("Thumbnail of the embed").setRequired(false))
    .addStringOption((option) => option.setName("author").setDescription("Author of the embed").setRequired(false))
    .addStringOption((option) => option.setName("url").setDescription("URL of the embed").setRequired(false))
    .addStringOption((option) => option.setName("timestamp").setDescription("Timestamp of the embed").setRequired(false))
    .addStringOption((option) => option.setName("fields").setDescription("Fields of the embed").setRequired(false)),
  async execute(interaction) {
    const title = interaction.options.getString("title");
    const description = interaction.options.getString("description");
    const color = interaction.options.getString("color");
    const footer = interaction.options.getString("footer");
    const image = interaction.options.getString("image");
    const thumbnail = interaction.options.getString("thumbnail");
    const fields = interaction.options.getString("fields");

    const embed = {
      title: title,
      description: description,
      color: color,
      footer: footer,
      image: image,
      thumbnail: thumbnail,
      fields: fields,
    };

    if (!title && !description && !color && !footer && !image && !thumbnail && !fields) {
      return interaction.reply({ content: "Please provide at least one option.", ephemeral: true });
    }

    return interaction.reply({ embeds: [embed] });
  },
};
