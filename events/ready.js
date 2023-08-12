const { Events, ActivityType } = require("discord.js");

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`Logged in as ${client.user.tag}.`);
    client.user.setPresence({
      activities: [{ name: `/commands | dankrpg.xyz`, type: ActivityType.Watching }],
      status: "online",
    });
  },
};
