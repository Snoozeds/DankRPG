const chance = require("chance").Chance();

// Emoji variables. Change these out with your own.
// Discord bots have "Nitro", so this is fine. To grab the id, escape the emoji with a backslash (e.g \:emoji:)
const coinEmoji = "<:Coins:1109913124171153438>";
const hpEmoji = "<:RPGHeart:855755205102534686>";
const armorEmoji = "<:GrayShield:1109923974831415316>";
const attackEmoji = "<:GraySword:1109925659171623052>";
const diamondEmoji = "<:Diamond:1109925710799319181>";
const woodEmoji = "<:WoodLogs:1109931701469192294>";
const stoneEmoji = "<:StoneDust:1109931144838922320>";
const stoneRingEmoji = "<:StoneRing:1109928129763483688>"
const falseEmoji = "<:Locked:899050875916541963>";
const trueEmoji = "<:Unlocked:899050875719393281>";

// Get a value from the database.
// await get(`${id}_key`);
async function get(key) {
  return await redis.get(key);
}

// Set a value in the database.
// await set(`${id}_key, value`);
async function set(key, value) {
  return redis.set(key, value);
}

// Increase a value by an amount.
// await incr(`${id}_key`, value);
async function incr(id, key, value) {
  return redis.incrby(`${id}_${key}`, value);
}

// Decrease a value by an amount.
// await decr(id, key, value);
async function decr(id, key, value) {
  return redis.decrby(`${id}_${key}`, value);
}

// Reset user's stats, used for when they die.
// await resetStats(id);
async function resetStats(userId) {
  await set(`${userId}_coins`, "0");
  await set(`${userId}_hp`, "100");
  await set(`${userId}_max_hp`, "100");
  await set(`${userId}_armor`, "0");
  await set(`${userId}_damage`, "5");
  await set(`${userId}_xp`, "0");
  await set(`${userId}_xp_needed`, "100");
  await set(`${userId}_level_xp`, "100");
  await set(`${userId}_next_level`, 2);
  await set(`${userId}_level`, "1");
  await set(`${userId}_hasStarted`, "1");
  await set(`${userId}_xp_alerts`, "1");

  await set(`${userId}_diamond`, null);
  await set(`${userId}_wood`, null);
  await set(`${userId}_stone`, null);
  await set(`${userId}_axe`, null);
  await set(`${userId}_pickaxe`, null);
  await set(`${userId}_stoneRing`, null);

  await set(`${userId}_daily_achievement`, null);
  await set(`${userId}_learner_achievement`, null);
  await set(`${userId}_april_achievement`, null);
}

// Calculate xp rewards for levelling up.
// Each level: +5 damage (max 25), +100hp, +100max_hp, +1 armor
// await calculateXP(id, nextlvl);
async function calculateXP(id, nextlvl) {
  // If the user is above level 10, they get less health increase, but more armor.
  if ((await get(`${id}_next_level`)) > 10) {
    await incr(id, "level", 1);
    await incr(id, "hp", 50);
    await incr(id, "max_hp", 50);
    await incr(id, "armor", 2);
    await set(id, "level_xp", 100 * nextlvl);
    await incr(id, "next_level", 1);
    await set(`${id}_xp`, 0);
    await set(`${id}_xp_needed`, 100 * nextlvl);
  } else {
    // At level 5, damage stops increasing.
    if ((await get(`${id}_damage`)) == 25) {
      await incr(id, "level", 1);
      await incr(id, "hp", 100);
      await incr(id, "max_hp", 100);
      await incr(id, "armor", 1);
      await set(id, "level_xp", 100 * nextlvl);
      await incr(id, "next_level", 1);
      await set(`${id}_xp`, 0);
      await set(`${id}_xp_needed`, 100 * nextlvl);
    } else {
      await incr(id, "level", 1);
      await incr(id, "damage", 5);
      await incr(id, "hp", 100);
      await incr(id, "max_hp", 100);
      await incr(id, "armor", 1);
      await incr(id, "level_xp", 100 * nextlvl);
      await incr(id, "next_level", 1);
      await set(`${id}_xp`, 0);
      await set(`${id}_xp_needed`, 100 * nextlvl);
    }
  }
}

// Checks if the user has enough xp to level up. If not, it gives xp.
// await checkXP(id, xp);
// xp == amount of xp to give
async function checkXP(id, xp) {
  const nextlvl = await get(`${id}_next_level`);
  const xp_needed = Number(await get(`${id}_xp_needed`));
  if (xp >= xp_needed) {
    await calculateXP(id, nextlvl);
    return true;
  } else {
    await incr(id, "xp", xp);
    await decr(id, "xp_needed", xp);
  }
}

// Calculating a percentage.
// perc(100, 50);
function perc(part, total) {
  if (total == 0) return 0;
  return (100 * part) / total;
}

module.exports = {
  coinEmoji,
  hpEmoji,
  armorEmoji,
  attackEmoji,
  diamondEmoji,
  woodEmoji,
  stoneEmoji,
  stoneRingEmoji,
  get,
  set,
  incr,
  decr,
  calculateXP,
  checkXP,
  perc,
  falseEmoji,
  trueEmoji,
  resetStats,
};
