const { Events, ActivityType } = require("discord.js");

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`Logged in as ${client.user.tag}.`);
    client.user.setPresence({
      activities: [{ name: `/commands|drpg.io`, type: ActivityType.Playing }],
      status: "online",
    });
  },
};
