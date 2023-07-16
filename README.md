# DankRPG

Welcome to DankRPG's Github repository. This mainly exists to keep transparency,
and also allow others to learn from [the DankRPG bot](https://dankrpg.xyz).

## What is DankRPG?

DankRPG is a Discord Economy and RPG bot that was originally written in [BDFD](https://botdesignerdiscord.com/),
then [aoi.js](https://aoi.js.org) and now finally [discord.js](https://discord.js.org). You can learn more about this project by visiting [the website](https://dankrpg.xyz) and [documentation](https://docs.dankrpg.xyz).

## New features of the rewrite:

- [x] New, **much faster** RAM-based database, Redis. Though this may not be a good solution for low RAM capacity servers.
- [x] Custom functions
- [x] More variables
- [x] Fully slash command based, with an easier way of integrating slash commands.
- [x] A more realistic randomization system, using chance.js.

## Pre-requisites:

- [Node.js](https://nodejs.org/en/) (I used v18.7.0, may work on older versions 16.9+)
- [Redis](https://redis.io/)
- optional: [redis-commander](https://npmjs.com/package/redis-commander) (for viewing the database in a browser, gui only.)

## Pre-requesites (NPM):

- [Discord.js](https://discord.js.org) **(v14+)**
- [ioRedis](https://npmjs.com/package/ioredis)
- [chance.js](https://npmjs.com/package/chance)
- [discord-command-cooldown](https://npmjs.com/package/discord-command-cooldown)
- [undici](https://npmjs.com/package/undici)
- [@napi-rs/canvas](https://npmjs.com/package/@napi-rs/canvas) **(0.1.25)**
- optional, but recommended: [pm2](https://npmjs.com/package/pm2)

## License
Code in this Github repository falls under the [Apache 2.0 License](https://choosealicense.com/licenses/apache-2.0/). 
Some art assets used by DankRPG is not within this repository, and are instead from [Pixeltier](https://pixeltier.itch.io/) or [Raven](https://clockworkraven.itch.io/). This repository's license does not apply to those assets.

The name 'DankRPG' and DankRPG's logo do not fall under the Apache 2.0 License and are not allowed to be used without obtaining written permission from the owner, Snoozeds.

You may not use the name 'DankRPG' or DankRPG's logo in any way that implies endorsement of your project by the DankRPG team. Furthermore, you may not use the name 'DankRPG' or DankRPG's logo in any way that suggests your project is the official DankRPG bot.

Additionally, you are prohibited from using the name 'DankRPG' or DankRPG's logo in any manner that could be harmful to the DankRPG brand or detrimental to the DankRPG team.

You, however, are allowed to use terms such as 'based on DankRPG' or 'powered by DankRPG' to indicate that your project is built on top of DankRPG, as long as it is clear that your project is not the official DankRPG bot.
## Setup:

Learn how to create a Discord Bot account [here](https://discordjs.guide/preparations/setting-up-a-bot-application.html), if you haven't already. \
Clone the repository, and install the required pre-requesites. \
Follow Redis's installation guide [here](https://redis.io/topics/quickstart) to setup the database. \
Then, create a file named `config.json` in the root directory, and paste the following:

```json
{
  "token": "Your bot's token from https://discord.com/developers/applications",
  "clientId": "This is the same as the bot's userID. If you don't know how to get it, just use the link above as well.",
  "usr": "User + password combo for the redis database.",
  "pwd": "--"
}
```

You'll then want to have a look through the `index.js` and `globals.js` files to change some configuration options. \
I've left some comments in the code to help you out. \
\
Once you're done, run `deploy-commands.js` to **globally** deploy the slash commands to your bot. \
You'll only need to run this again if you add new commands. Follow discord.js's guide [here](https://discordjs.guide/creating-your-bot/command-deployment.html#guild-commands) if you want to add them to a server instead. \
\
Finally, run `node index.js` to start DankRPG to see if you encounter any errors. \
If you don't, use `pm2 start index.js` to start the bot in the background.

## Errors:

You may get an error saying **"ERR: Database connection failed! Is the database running?"** \
This is most likely because you haven't started a Redis server, or you have the wrong configuration/firewall. \
Make sure you have followed Redis's installation guide [here](https://redis.io/topics/quickstart) to setup the database.

## Support DankRPG:

**top.gg:** If you want to support DankRPG, you can do so by [voting](https://top.gg/bot/855479925863481345/vote) for it on top.gg \
**Linode:** Get $100 of free server credit for 60 days using my referral link. [link](https://www.linode.com/lp/refer/?r=2f0b0fc7f85a9c71619bd2f30b9e970e60b2c168)
