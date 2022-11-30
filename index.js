const fs = require('node:fs');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token, topgg } = require('./config.json');
const Redis = require("ioredis");
const express = require("express");
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

global.redis = new Redis({
port: 6379,
host: "127.0.0.1",
username: "",
password: "",
db: 0,
}); // change this accordingly.

redis.on('connect', () => {
	console.log(`Database initialized.`);
});

redis.on('error', (err) => {
	console.log(`Database error! ${err}`);
});

// This section is kept here for transparency purposes. 
// You cannot wholly publish DankRPG on top.gg without significant changes, as it is a "template".
// Uploading server count to top.gg.
const { AutoPoster } = require('topgg-autoposter')
const ap = AutoPoster(topgg, client)
ap.on('posted', () => {console.log('Posted stats to Top.gg!')})

// top.gg voting webhook.
const Topgg = require("@top-gg/sdk");
const app = express();
const webhook = new Topgg.Webhook(topgg);
app.post("/vote", webhook.listener(voted => {
redis.incrby(`${vote.user}_votes`, 1);
redis.incrby(`${vote.user}_coins`, 250);
}));
app.listen(6969);

// Command handler
// Structure: ./commands/Category/command.js
client.commands = new Collection();
const commandFolders = fs.readdirSync('./commands');

for (const folder of commandFolders) {
	const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
		client.commands.set(command.data.name, command);
		console.log('\u001b[1;36mLoaded command ' + `'${command.data.name}'` + ' from /' + folder + '/' + file + '\u001b[0m');
	}};

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found. Make sure the file exists.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		// The user will see this if an error occurs. Can be good for reporting bugs.
	}
});

client.once(Events.ClientReady, async () => {
	console.log(`Logged in as ${client.user.tag}.`);
});

client.login(token);

module.exports = client;