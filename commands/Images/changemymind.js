const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const { incr } = require("../../globals.js");

// If this doesn't work, you may need to install the font.

module.exports = {
  data: new SlashCommandBuilder()
    .setName("changemymind")
    .setDescription("Change my mind")
    .addStringOption((option) =>
      option
        .setName("text")
        .setDescription("Text to put on the image")
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply(); // Alerts Discord that we have received the command and are processing it.
    const text = interaction.options.getString("text");
    if (text.match(/^[A-Za-z0-9 ,./?!@#$%^&*()-+=[]{}~`'"<>]+$/)) {
      return interaction.editReply({
        content:
          "Only English characters are allowed (A-Z 0-9 ,./?!@#$%^&*()-+=[]{}~`'\"<>)",
        ephemeral: true,
      });
    }
    if (text.length >= 30) {
      return interaction.editReply({
        content: "Text must be under 30 characters long.",
      });
    }
    const { createCanvas, loadImage } = require("@napi-rs/canvas");
    const canvas = createCanvas(1000, 1000);
    const context = canvas.getContext("2d");
    const background = await loadImage("./changemymind.png", { type: "png" });
    context.drawImage(background, 0, 0, canvas.width, canvas.height);
    context.font = "bold 40px Arial";
    context.fillStyle = "#000000";
    context.fillText(text, 300, 650, canvas.width, canvas.height);
    const attachment = new AttachmentBuilder(await canvas.encode("png"), {
      name: "changemymind.png",
    });
    await incr(`${interaction.user.id}`, "commandsUsed", 1);
    interaction.editReply({ files: [attachment] }); // We must EDIT the reply, as the deferred reply already exists.
  },
};
