const fs = require("node:fs");
const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  ActivityType,
} = require("discord.js");
const { token, topgg, usr, pwd } = require("./config.json");
const { trueEmoji } = require("./globals.js");
const Redis = require("ioredis");
const express = require("express");
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

global.redis = new Redis({
  port: 6379,
  host: "127.0.0.1",
  username: usr,
  password: pwd,
  db: 0,
  enableReadyCheck: false,
}); // Change the username and password in config.json, if you need to. | https://redis.io/docs/management/security/acl/

redis.on("connect", () => {
  console.log(`Database initialized.`);
});

redis.on("error", (err) => {
  console.log(`Database error! ${err}`);
});

// This section is kept here for transparency purposes.
// You cannot wholly publish DankRPG on top.gg without significant changes, as it is a "template".
// Uploading server count to top.gg.
const { AutoPoster } = require("topgg-autoposter");
const ap = AutoPoster(topgg, client);
ap.on("posted", () => {
  console.log("Posted stats to Top.gg!");
});

// top.gg voting webhook.
const Topgg = require("@top-gg/sdk");
const app = express();
const webhook = new Topgg.Webhook(topgg);
app.post(
  "/vote",
  webhook.listener((voted) => {
    redis.incrby(`${vote.user}_votes`, 1);
    redis.incrby(`${vote.user}_coins`, 250);
  })
);
app.listen(6969);

// Command handler
// Structure: ./commands/Category/command.js
client.commands = new Collection();
const commandFolders = fs.readdirSync("./commands");

for (const folder of commandFolders) {
  const commandFiles = fs
    .readdirSync(`./commands/${folder}`)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    client.commands.set(command.data.name, command);
    console.log(
      "\u001b[1;36mLoaded command " +
        `'${command.data.name}'` +
        " from /" +
        folder +
        "/" +
        file +
        "\u001b[0m"
    );
  }
}

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  // If the command doesn't exist, log it and return.
  if (!command) {
    console.error(
      `No command matching ${interaction.commandName} was found. Make sure the file exists.`
    );
    return;
  }

  // If the user has not run start, tell them to do so and return.
  if (
    await redis.get(`${interaction.user.id}_hasStarted`) !== "1" &&
    interaction.commandName != "start"
  ) {
    await interaction.reply({
      content: "You need to start!\nRun </start:1047501428014456834>",
      ephemeral: true,
    });
    return;
  }

  // Achievement for April Fools. (1st-3rd April)
  // REMEMBER. JAVASCRIPT COUNTS MONTHS FROM 0. HOW FUN.
  if (
    (await redis.get(`${interaction.user.id}_april_achievement`)) !== null &&
    (await redis.get(`${interaction.user.id}_april_achievement`)) !==
      `${trueEmoji}`
  ) {
    const today = new Date();
    const start = new Date(Date.UTC(today.getUTCFullYear(), 3, 1)); // April 1st, UTC
    const end = new Date(Date.UTC(today.getUTCFullYear(), 3, 3)); // April 3rd, UTC
    if (today >= start && today <= end) {
      redis.set(`${interaction.user.id}_april_achievement`, `${trueEmoji}`);
      redis.incrby(`${interaction.user.id}_coins`, 500);
    }
  }
  // End of April Fools achievement.

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
    // The user will see this if an error occurs. Can be good for reporting bugs.
  }
});

client.login(token);

client.once(Events.ClientReady, async () => {
  console.log(`Logged in as ${client.user.tag}.`);
  client.user.setPresence({
    activities: [{ name: `/commands`, type: ActivityType.Watching }],
    status: "online",
  });
});

module.exports = client;
