const { Events, ActivityType } = require("discord.js");
const chalk = require("chalk");

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.info(chalk.green.bold("Logged in as ") + chalk.yellow.bold(client.user.tag));
    client.user.setPresence({
      activities: [{ name: `/commands | drpg.io`, type: ActivityType.Playing }],
      status: "online",
    });
  },
};
