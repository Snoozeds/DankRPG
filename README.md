# DankRPG

Welcome to DankRPG's Github repository. This mainly exists to keep transparency,
and also allow others to learn from it. If you want to create something new out of
DankRPG, you are welcome to do so, as long as you follow the [license](https://choosealicense.com/licenses/apache-2.0/).

## What is DankRPG?

DankRPG is a Discord Economy and RPG bot that was originally written in [BDFD](https://botdesignerdiscord.com/),
then [aoi.js](https://aoi.js.org) and now finally [discord.js](https://discord.js.org). It offers a lot of rpg/economy features,
and is constantly being updated. It is also fully open source, so you can learn from it, or even use it as a base
for your own bot. It uses the [Apache 2.0 License](hhttps://choosealicense.com/licenses/apache-2.0/).

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

- [Discord.js](https://discord.js.org) **(v14.6.0)**
- [ioRedis](https://npmjs.com/package/ioredis)
- [chance.js](https://npmjs.com/package/chance)
- [discord-command-cooldown](https://npmjs.com/package/discord-command-cooldown)
- [undici](https://npmjs.com/package/undici)
- [@napi-rs/canvas](https://npmjs.com/package/@napi-rs/canvas) **(0.1.25)**
- optional, but recommended: [pm2](https://npmjs.com/package/pm2)

## Setup:

Learn how to create a Discord Bot account [here](https://discordjs.guide/preparations/setting-up-a-bot-application.html), if you haven't already. \
Clone the repository, and install the required pre-requesites. \
Follow Redis's installation guide [here](https://redis.io/topics/quickstart) to setup the database. \
Then, create a file named `config.json` in the root directory, and paste the following:

```json
{
  "token": "Your bot's token from https://discord.com/developers/applications",
  "clientID": "This is the same as the bot's userID. If you don't know how to get it, just use the link above as well."
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

**top.gg:** If you want to support DankRPG, you can do so by [voting](https://top.gg/bot/791190766000578580/vote) for it on top.gg \
**Linode:** Get $100 of free server credit for 60 days using my referral link. [link](https://www.linode.com/lp/refer/?r=2f0b0fc7f85a9c71619bd2f30b9e970e60b2c168)
