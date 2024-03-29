// This file is for registering slash commands.
// For global commands, it will register them globally. This ignores any commands that have the nonGlobal property set to true.
// For guild commands, it will register them to the specified guild as long as the command has the nonGlobal property set to true.
// You can run this file with `node deploy-commands.js` in your terminal.

const { REST, Routes } = require("discord.js");
const { clientId, token } = require("./config.json");
const fs = require("node:fs");

// Subfolders in the commands folder.
const commandFolders = fs.readdirSync("./commands");
const commands = [];

// Loop through each folder for GLOBAL commands.
for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(`./commands/${folder}`).filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    if (command.nonGlobal) continue;
    commands.push(command.data.toJSON());
  }
}

// Loop through each folder for GUILD commands.
const guildCommands = [];

for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(`./commands/${folder}`).filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    if (!command.nonGlobal) continue;
    guildCommands.push(command.data.toJSON());
  }
}

//  -- Global slash handler --
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
    console.log("Saved command data to ./command_data/commands.json");
  } catch (error) {
    console.error(error);
  }
})();

// -- Guild slash handler --
(async () => {
  try {
    console.log(`Started refreshing ${guildCommands.length} guild (/) commands.`);

    const data = await rest.put(Routes.applicationGuildCommands(clientId, "818799564119080980"), { // REPLACE WITH YOUR SERVER ID
      body: guildCommands,
    });

    console.log(`Successfully reloaded ${data.length} guild (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})();
