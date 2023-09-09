const client = require("../index.js");
const cron = require("node-cron");
const { usr, pwd } = require("../config.json");
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

// Cron job running every hour to set pet cleanliness
cron.schedule("0 * * * *", async () => {
  console.info(chalk.magenta.bold("[CRON] Running pet cleanliness cron job"));
  let cursor = "0";
  let decrement = 3;

  do {
    const [newCursor, keys] = await redis.scan(cursor, "MATCH", "*_petEquipped_*");

    for (const key of keys) {
      const user = key.split("_")[0];
      const pet = key.split("_")[2];
      const clean = await redis.get(`${user}_petCleanliness_${pet}`);

      if (Number(clean) > 0 && Number(clean) - decrement > 0) {
        await redis.decrby(`${user}_petCleanliness_${pet}`, decrement);
      }

      if (Number(clean) <= 0) {
        // Cleanliness is already 0, do nothing
        await redis.set(`${user}_petCleanliness_${pet}`, 0);
      } else {
        const newClean = Number(clean) - decrement;
        if (newClean < 0) {
          // make sure cleanliness is not negative
          await redis.set(`${user}_petCleanliness_${pet}`, 0);
        } else {
          await redis.set(`${user}_petCleanliness_${pet}`, newClean);
        }
      }
    }

    cursor = newCursor;
  } while (cursor !== "0");
});

// Cron job running every 30 minutes to set pet happiness
cron.schedule("*/30 * * * *", async () => {
  console.info(chalk.magenta.bold("[CRON] Running pet happiness cron job"));
  let cursor = "0";

  do {
    const [newCursor, keys] = await redis.scan(cursor, "MATCH", "*_petEquipped_*");

    for (const key of keys) {
      const user = key.split("_")[0];
      const pet = key.split("_")[2];
      const happy = await redis.get(`${user}_petHappiness_${pet}`);
      const hungry = await redis.get(`${user}_petFullness_${pet}`);
      const clean = await redis.get(`${user}_petCleanliness_${pet}`);
      let decrement = 1;

      if (Number(clean) < 50 && Number(hungry) < 50) {
        decrement = 5;
      } else if (Number(clean) < 50) {
        decrement = 2;
      } else if (Number(hungry) < 50) {
        decrement = 2;
      }

      const petAlerts = await redis.get(`${user}_petAlerts`);

      if (Number(happy) <= 0 && petAlerts === "1") {
        // Check if petAlerts are enabled and pet's happiness is 0
        const hasSentAlert = await redis.get(`${user}_hasSentPetAlert_${pet}`);

        if (hasSentAlert !== "1") {
          // Send DM only if the alert hasn't been sent before
          await redis.set(`${user}_hasSentPetAlert_${pet}`, "1");
          const dm = await client.users.fetch(user);
          try {
            dm.send(`Your pet ${pet} has reached 0 happiness!\n\nYou can turn off these alerts with /pet alerts`);
          } catch (err) {
            if (err.code === 429) {
              // Unlikely but possible
              console.error(chalk.red.bold("[ERROR] Rate limited by Discord!"));
            }
          }
        }
      } else if (Number(happy) <= 0) {
        await redis.set(`${user}_petHappiness_${pet}`, 0);
      } else {
        const newHappy = Number(happy) - decrement;
        if (newHappy < 0) {
          // Make sure happiness is not negative
          await redis.set(`${user}_petHappiness_${pet}`, 0);
        } else {
          await redis.set(`${user}_petHappiness_${pet}`, newHappy);
        }
      }
    }

    cursor = newCursor;
  } while (cursor !== "0");
});

// Cron job running every 5 minutes to set pet fullness
cron.schedule("*/5 * * * *", async () => {
  console.info(chalk.magenta.bold("[CRON] Running pet hunger cron job"));
  let cursor = "0";

  do {
    const [newCursor, keys] = await redis.scan(cursor, "MATCH", "*_petEquipped_*");

    for (const key of keys) {
      const user = key.split("_")[0];
      const pet = key.split("_")[2];
      const hunger = await redis.get(`${user}_petFullness_${pet}`);
      let decrement = 1;

      if (Number(hunger) <= 0) {
        // Hunger is already 0, do nothing
        await redis.set(`${user}_petFullness_${pet}`, 0);
      } else {
        const newHunger = Number(hunger) - decrement;
        if (newHunger < 0) {
          // make sure fullness is not negative
          await redis.set(`${user}_petFullness_${pet}`, 0);
        } else {
          await redis.set(`${user}_petFullness_${pet}`, newHunger);
        }
      }
    }

    cursor = newCursor;
  } while (cursor !== "0");
});
