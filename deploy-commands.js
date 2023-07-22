// This file is for registering slash commands to every guild.
// You can run this file with `node deploy-commands.js` in your terminal.

const { REST, Routes } = require("discord.js");
const { clientId, token } = require("./config.json");
const fs = require("node:fs");

// subfolder handler
const commandFolders = fs.readdirSync("./commands");
const commands = [];

for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(`./commands/${folder}`).filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    commands.push(command.data.toJSON());
  }
}


const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    const data = await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    
    // Save each command and its ID to a JSON file.
    if (!fs.existsSync("./command_data")) {
      fs.mkdirSync("./command_data");
    }
    fs.writeFileSync("./command_data/commands.json", JSON.stringify(data));
    console.log("Saved command data to ./command_data/commands.json")
  } catch (error) {
    console.error(error);
  }
})();
