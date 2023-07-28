const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { token, topgg, topggAuth, usr, pwd } = require("./config.json"); // Remove topgg, topggAuth if you don't want to use top.gg. See comments below.
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
// https://support.top.gg/support/solutions/articles/73000502502-bot-guidelines
// Uploading server count to top.gg.
const { AutoPoster } = require("topgg-autoposter");
const ap = AutoPoster(topgg, client);
ap.on("posted", () => {
  console.log("Posted stats to Top.gg!");
});

// Top.gg voting webhook.
const Topgg = require("@top-gg/sdk");
const app = express();
const webhook = new Topgg.Webhook(topggAuth);
app.post(
  "/vote",
  webhook.listener((voted) => {
    redis.incrby(`${voted.user}_votes`, 1);
    redis.incrby(`${voted.user}_coins`, 500);
  })
);
app.listen(6969);

// This is used for uptime monitoring. This is not necessary.
// Uptime monitoring I suggest: https://uptimerobot.com/, https://github.com/louislam/uptime-kuma (self-hosted, I use.)
app.get("/ping", (req, res) => {
  res.sendStatus(200);
});
app.listen(3000);

// Slash commands
// Structure: ./commands/Category/command.js
client.commands = new Collection();
const commandFolders = fs.readdirSync("./commands");

for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(`./commands/${folder}`).filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    client.commands.set(command.data.name, command);
    console.log("\u001b[1;36mLoaded command " + `'${command.data.name}'` + " from /" + folder + "/" + file + "\u001b[0m");
  }
}

// Event handler
// Structure: ./events/event.js
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(token);

module.exports = client;
