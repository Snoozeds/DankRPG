const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");

// If characters do not render properly, you may need to install the "Arial" font.

module.exports = {
  data: new SlashCommandBuilder()
    .setName("changemymind")
    .setDescription("Change my mind")
    .addStringOption((option) => option.setName("text").setDescription("Text to put on the image").setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply(); // Alerts Discord that we have received the command and are processing it.

    // Check if text is valid:
    const text = interaction.options.getString("text");
    if (text.match(/^[A-Za-z0-9 ,./?!@#$%^&*()-+=[]{}~`'"<>]+$/)) {
      return interaction.editReply({
        content: "Only English characters are allowed (A-Z 0-9 ,./?!@#$%^&*()-+=[]{}~`'\"<>)",
        ephemeral: true,
      });
    }

    // Wrapping text:
    function wrapText(context, text, x, y, maxWidth, lineHeight) {
      var metrics = context.measureText(text);
      var textWidth = metrics.width;

      if (textWidth > maxWidth) {
        var characters = text.split("");
        var lastWord = "";
        for (var i = 0; i < characters.length; i++) {
          lastWord += characters[i];
          var testLine = lastWord + "-";
          var metrics = context.measureText(testLine);
          var testWidth = metrics.width;
          if (testWidth > maxWidth) {
            context.fillText(lastWord.slice(0, -1), x, y);
            lastWord = characters[i] + "";
            y += lineHeight;
          }
        }
        context.fillText(lastWord, x, y);
      } else {
        var words = text.split(" ");
        var line = "";
        var lastWord = "";
        for (var n = 0; n < words.length; n++) {
          lastWord = words[n];
          var testLine = line + lastWord + " ";
          var metrics = context.measureText(testLine);
          var testWidth = metrics.width;
          if (testWidth > maxWidth) {
            if (context.measureText(lastWord).width > maxWidth) {
              lastWord = lastWord.slice(0, -1);
              while (context.measureText(lastWord + "-").width > maxWidth) {
                lastWord = lastWord.slice(0, -1);
              }
              lastWord += "";
            }
            context.fillText(line, x, y);
            line = lastWord + "";
            y += lineHeight;
          } else {
            line = testLine;
          }
        }
        context.fillText(line, x, y);
      }
    }

    const { createCanvas, loadImage } = require("@napi-rs/canvas");
    const canvas = createCanvas(1000, 1000);
    const context = canvas.getContext("2d");
    const background = await loadImage("./changemymind.png", { type: "png" });
    context.drawImage(background, 0, 0, canvas.width, canvas.height);
    context.font = "25px Arial";
    context.fillStyle = "#000000";
    wrapText(context, text, 300, 650, 575, 35);
    const attachment = new AttachmentBuilder(await canvas.encode("png"), {
      name: "changemymind.png",
    });
    await interaction.editReply({ files: [attachment] }); // We must EDIT the reply, as the deferred reply already exists.
  },
};
