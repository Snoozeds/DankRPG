<img src="https://assets.dankrpg.xyz/Images/dankrpg.png" alt="Logo" /> <br />
<br />

[![Discord](https://img.shields.io/discord/856149002734403615?color=7289da&logo=discord&logoColor=white)](https://discord.gg/Cc3xBSpWeB)
[![GitHub](https://img.shields.io/github/license/Snoozeds/DankRPG?color=blue)](https://github.com/Snoozeds/DankRPG/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/Snoozeds/DankRPG)](https://github.com/Snoozeds/DankRPG/issues)
[![Latest release](https://img.shields.io/github/v/release/Snoozeds/DankRPG?include_prereleases)](https://github.com/Snoozeds/DankRPG/releases/latest)
<br />
[![Patreon](https://img.shields.io/badge/Patreon-Donate%20(monthly)-red?logo=patreon)](https://patreon.com/snoozeds)
[![Linode](https://img.shields.io/badge/Linode-$100%20credit-blue?logo=akamai)](https://www.linode.com/lp/refer/?r=2f0b0fc7f85a9c71619bd2f30b9e970e60b2c168)
[![Steam](https://img.shields.io/badge/Steam-Trade-white?logo=steam)](https://steamcommunity.com/tradeoffer/new/?partner=972682532&token=T6WoQBBx)
<br />
[![Invite](https://img.shields.io/badge/Bot%20Invite-DankRPG-blue?logo=discord&logoColor=white)](https://drpg.io/invite)
[![Doc](https://img.shields.io/badge/Documentation-View-blue)](https://docs.dankrpg.xyz)

# DankRPG

Welcome to the Github repository for DankRPG, a Discord Economy and RPG bot. This mainly exists for transparency, and for people to contribute to the bot. You may run your own instance if you wish by following the [setup](#forewarning) guide below.

## What is DankRPG?

DankRPG is a Discord Economy and RPG bot that has a wide variety of items, commands, user settings, and more. Its code is written in JavaScript, using the [Discord.js](https://discord.js.org) library, and is 100% open source. It uses a Redis database for storing user data. The official DankRPG bot is currently in 100+ servers, and is growing and improving every day.

You may find more information about the bot on the [website](https://dankrpg.xyz), or by reading the [documentation](https://drpg.io/docs).


## License
Code in this Github repository falls under the [Apache 2.0 License](https://choosealicense.com/licenses/apache-2.0/). We recommend you read this to understand what you can and can't do with the code.

This repository also includes custom emoji art in the Emoji folder and its respective subfolders. Please note that the Apache 2.0 License does not apply to those assets, and you may read the NOTICE & README files inside those folders for specific license information.

Other art assets (most emoji) used by the official DankRPG bot is **not within** this repository, and are instead from [Pixeltier](https://pixeltier.itch.io/) or [Raven](https://clockworkraven.itch.io/). This repository's license does not apply to those assets. Please go support them if you like their work.

The name 'DankRPG' does not fall under this license either, and you may not use it to state or imply that your version is the original or official DankRPG bot, supported by the original authors, contributors, or author of the bot.

## Forewarning:

This setup guide assumes you know basic JavaScript and Node.js. It is not recommended to run your own instance of DankRPG unless you know what you're doing.

Always download the latest release from the [releases](https://github.com/Snoozeds/DankRPG/releases) page. The master branch is not guaranteed to be stable.

As the code is 100% open-source, it includes sections of top.gg code. This is to post stats to top.gg, and to reward users for voting. It is recommended to remove this code, however, if you wish to use top.gg, please read [this disclaimer](https://support.top.gg/support/solutions/articles/73000502502-bot-guidelines) ("**Must not be an unmodified instance or fork of another bot and must have a considerable amount of modification.**")

**I recommend you also read comments in index.js and globals.js bare minimum, as they contain important information like the above.**

## Setup:
Create a file named `config.json` in the root directory, and paste the following:

```json
{
  "token": "Your bot's token from https://discord.com/developers/applications",
  "clientId": "This is the same as the bot's userID.",
  "usr": "User for the Redis database, if needed.",
  "pwd": "Password for the Redis database, if needed.",
  "topgg": "Used for posting stats to top.gg. Please see disclaimer in index.js.",
  "topggAuth": "Used for voting rewards. Please see disclaimer in index.js."
}
```

You will want to change these values to your own. \
Next, use a package manager like npm or yarn to install the dependencies. (e.g `npm install`)

You will also need to install [Redis](https://redis.io/topics/quickstart) and run it. You may change Redis to something else if you wish, but it would require somewhat significant code changes. Help for this is not provided.

Once you have done this, you can run the bot using `node index.js`. If no errors occur, you should be good to go. You may use a process manager to do this.

If you want daily quest support, you will also need to run the `quests.js` file inside /utils by using `node quests.js`. This starts a cron job that runs every day at 00:00 UTC. It is **highly** recommended to use a process manager for this.

I recommend using a process manager like [PM2](https://npmjs.com/package/pm2) or [forever](https://www.npmjs.com/package/forever) to keep the bot running.

If you have any issues relating to the code, or running the bot, please open an issue on this repository by following this link: [Open issue](https://github.com/Snoozeds/DankRPG/issues/new)

## Errors:

You may get an error saying **"ERR: Database connection failed! Is the database running?"** \
This is most likely because you haven't started a Redis server, or you have the wrong configuration/firewall. \
Make sure you have followed Redis's installation guide [here](https://redis.io/topics/quickstart) to setup the database.

Developer-only commands may give an error saying **"You are not authorized to use this command."** \
You need to add your userID in `/src/commands/Dev/owner.json` for them to work. You can get your userID by enabling developer mode in Discord, and right clicking your name.

## Contributing:
Any contribution to DankRPG is welcome, as long as it falls under the same license (Apache 2.0). If you wish to contribute, please open a pull request with your changes. Very significant changes, such as replacing core components of the bot, will most likely be rejected.

Some things to note:
- Please make sure your code is formatted correctly, and is readable. 
- Preferably use a formatter like Prettier. The .prettierrc file is included in this repository.
- Please make sure your code is commented where necessary.
- Please make sure your code is tested, and doesn't break anything.
- Please make sure your code is not malicious, or breaks the license.

