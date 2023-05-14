// This file is for registering commands to a specific guild.
// You can run this file with `node deploy-command.js` plus a couple options in your terminal. (see below)
// To deploy all commands to all guilds, use the 'deploy-commands.js' file.

// Options:
// 1. Guild ID (required)
// 2. Command files path (required)

// Examples (replace the guild ID and file path with your own.):
// node deploy-command.js GUILDID "./commands/category/mycommand.js"
// node deploy-command.js GUILDID "./commands/category/mycommand1.js,./commands/category/mycommand2.js"

const { REST } = require("discord.js");
const { clientId, token } = require("./config.json");
const fs = require("fs");
const path = require("path");

const rest = new REST({ version: "10" }).setToken(token);

const args = process.argv.slice(2);
const guildId = args[0];
const commandFilesPath = args[1];

const commandFiles = commandFilesPath
  .split(",")
  .map((filePath) => {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return null;
    }
    // Sanitize file path input before requiring
    const sanitizedPath = path.resolve(filePath);
    return require(sanitizedPath);
  })
  .filter((file) => file !== null);

// Asynchronous function to register new commands or update existing ones
const deployCommands = async () => {
  try {
    // Get existing commands from Discord API
    const commands = await rest.get(
      `/applications/${clientId}/guilds/${guildId}/commands`
    );
    const commandIds = Object.values(commands).map((command) => command.id);

    // Loop through each command file and register or update the command as necessary
    for (const commandFile of commandFiles) {
      if (!commandFile || !commandFile.data) {
        console.error(`Invalid command file: ${commandFile}`);
        continue;
      }

      const commandId = commandFile.data.id;
      const existingCommand = commands.find((c) => c.id === commandId);

      if (!existingCommand) {
        // Command does not exist, register new command
        await rest.post(
          `/applications/${clientId}/guilds/${guildId}/commands`,
          {
            body: commandFile.data,
          }
        );
      } else {
        // Command exists, update existing command
        await rest.put(
          `/applications/${clientId}/guilds/${guildId}/commands/${commandId}`,
          { body: commandFile.data }
        );
      }
    }
    console.log(
      `Successfully deployed ${commandFiles
        .map((c) => c.data.name)
        .join(", ")} command(s) to guild ${guildId}.`
    );
  } catch (error) {
    console.error(error);
  }
};

deployCommands();
