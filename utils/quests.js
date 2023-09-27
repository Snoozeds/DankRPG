var cron = require("node-cron");
const { usr, pwd } = require("../config.json"); // Change the username and password in config.json, if you need to. | https://redis.io/docs/management/security/acl/
const Redis = require("ioredis");
const redis = new Redis({
  port: 6379,
  host: "127.0.0.1",
  username: usr,
  password: pwd,
  db: 0,
  enableReadyCheck: false,
});
const chalk = require("chalk");

const quests = {
  1: {
    id: 1,
    description: "Find a diamond",
    reward: 100,
    type: "item",
    item: "diamond",
    amount: 1,
  },
  2: {
    id: 2,
    description: "Find a demon wing",
    reward: 150,
    type: "item",
    item: "demonWing",
    amount: 1,
  },
  3: {
    id: 3,
    description: "Kill 10 enemies in /fight",
    reward: 200,
    type: "bounty",
    command: "fight",
    amount: 10,
  },
  4: {
    id: 4,
    description: "Participate in a duel against another player",
    reward: 100,
    type: "command",
    command: "duel",
    amount: 1,
  },
  5: {
    id: 5,
    description: "Chop down trees 10 times",
    reward: 150,
    type: "command",
    command: "chop",
    amount: 10,
  },
  6: {
    id: 6,
    description: "Mine rocks 10 times",
    reward: 150,
    type: "command",
    command: "mine",
    amount: 10,
  },
  7: {
    id: 7,
    description: "Complete 5 adventures",
    reward: 100,
    type: "command",
    command: "adventure",
    amount: 5,
  },
  8: {
    id: 8,
    description: "Complete 5 or more adventures in one command",
    reward: 150,
    type: "commandInOne",
    command: "adventure",
    amount: 5,
  },
};

cron.schedule("0 0 * * *", async () => {
  console.info(chalk.magenta.bold("[CRON] Running quests cron job"));
  await redis.del("quests"); // Remove all quests.

  // Fetch all user keys that match the pattern "*_questsCompleted"
  let cursor = "0";
  do {
    const [nextCursor, keys] = await redis.scan(cursor, "MATCH", "*_questsCompleted");
    if (keys.length > 0) {
      // Iterate over the found keys and delete them
      for (const key of keys) {
        await redis.del(key);
      }
    }
    cursor = nextCursor;
  } while (cursor !== "0");

  // Fetch all user keys that match the pattern "*_enemiesKilled" (used for quest 3)
  cursor = "0";
  do {
    const [nextCursor, keys] = await redis.scan(cursor, "MATCH", "*_enemiesKilled");
    if (keys.length > 0) {
      // Iterate over the found keys and delete them
      for (const key of keys) {
        await redis.del(key);
      }
    }
    cursor = nextCursor;
  } while (cursor !== "0");

  // Fetch all user keys that match the pattern "*_treesChopped" (used for quest 5)
  cursor = "0";
  do {
    const [nextCursor, keys] = await redis.scan(cursor, "MATCH", "*_treesChopped");
    if (keys.length > 0) {
      // Iterate over the found keys and delete them
      for (const key of keys) {
        await redis.del(key);
      }
    }
    cursor = nextCursor;
  } while (cursor !== "0");

  // Fetch all user keys that match the pattern "*_rocksMined" (used for quest 6)
  cursor = "0";
  do {
    const [nextCursor, keys] = await redis.scan(cursor, "MATCH", "*_rocksMined");
    if (keys.length > 0) {
      // Iterate over the found keys and delete them
      for (const key of keys) {
        await redis.del(key);
      }
    }
    cursor = nextCursor;
  } while (cursor !== "0");

  // Fetch all user keys that mach the pattern "*_adventuresCompletedToday" (used for quest 7)
  cursor = "0";
  do {
    const [nextCursor, keys] = await redis.scan(cursor, "MATCH", "*_adventuresCompletedToday");
    if (keys.length > 0) {
      // Iterate over the found keys and delete them
      for (const key of keys) {
        await redis.del(key);
      }
    }
    cursor = nextCursor;
  } while (cursor !== "0");

  // Pick 3 random quests, ensure the same quest isn't picked more than once
  const randomQuests = [];
  while (randomQuests.length < 3) {
    const randomQuest = quests[Math.floor(Math.random() * Object.keys(quests).length) + 1];
    if (!randomQuests.includes(randomQuest)) {
      randomQuests.push(randomQuest);
    }
  }

  await redis.set("quests", JSON.stringify(randomQuests)); // Add the quests to the key
  console.info(chalk.yellow.bold("Added quests:"));
  console.info(randomQuests);
});
