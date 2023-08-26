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
};

cron.schedule("0 0 * * *", async () => {
  console.log("Starting quests cron job...");
  await redis.del("quests"); // Remove all quests.

  // Fetch all user keys that match the pattern "*_questsCompleted"
  let cursor = "0";
  do {
    const [nextCursor, keys] = await redis.scan(cursor, "MATCH", "*_questsCompleted");
    if (keys.length > 0) {
      // Iterate over the found keys and delete them
      for (const key of keys) {
        await redis.del(key);
        console.log(`Deleted questsCompleted key: ${key}`);
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
  console.log("Added new quests: ", randomQuests);
});

async function testChron() {
  console.log("Starting quests cron job...");
  await redis.del("quests"); // Remove all quests.

  // Fetch all user keys that match the pattern "*_questsCompleted"
  let cursor = "0";
  do {
    const [nextCursor, keys] = await redis.scan(cursor, "MATCH", "*_questsCompleted");
    if (keys.length > 0) {
      // Iterate over the found keys and delete them
      for (const key of keys) {
        await redis.del(key);
        console.log(`Deleted questsCompleted key: ${key}`);
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
  console.log("Added new quests: ", randomQuests);
  process.exit(); // Exit the process
}

// Run from cmd line to test.
testChron();
