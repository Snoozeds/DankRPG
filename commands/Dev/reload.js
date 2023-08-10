const { SlashCommandBuilder } = require("discord.js");
const fs = require("node:fs");
const config = require("./owner.json")

module.exports = {
  nonGlobal: true,
  data: new SlashCommandBuilder()
    .setName("reload")
    .setDescription("Reloads a command.")
    .addStringOption((option) => option.setName("command").setDescription("The command's file name that you want to reload.").setRequired(true)),
  async execute(interaction) {
    if (interaction.user.id !== config.ownerID) return interaction.reply({ content: "You are not authorized to use this command.", ephemeral: true });

    const commandName = interaction.options.getString("command");
    const command = interaction.client.commands.get(commandName);
    let commandLocation = "";

    if (!command) return interaction.reply({ content: `There is no command file with the name \`${commandName}\`.`, ephemeral: true });

    // Loop through the ./commands folder and its subfolders to find the command specified.
    const commandFolders = fs.readdirSync("./commands");
    for (const folder of commandFolders) {
      const commandFiles = fs.readdirSync(`./commands/${folder}`).filter((file) => file.endsWith(".js"));
      for (const file of commandFiles) {
        // If the command is found, delete it from the cache.
        if (file === `${commandName}.js`) {
          delete require.cache[require.resolve(`../${folder}/${file}`)];
          commandLocation = `../${folder}/${file}`;
        }
      }
    }

    try {
      interaction.client.commands.delete(command.data.name);
      const newCommand = require(commandLocation);
      interaction.client.commands.set(newCommand.data.name, newCommand);
      await interaction.reply(`Command \`${newCommand.data.name}\` was reloaded!`);
      console.log(`Command ${newCommand.data.name} was reloaded.`);
    } catch (error) {
      console.error(error);
      await interaction.reply(`There was an error while reloading the command \`${command.data.name}\`:\n\`${error.message}\``);
    }
  },
};
