const ms = require("ms");

// Emoji variables. Change these out with your own.
// Discord bots have "Nitro", so this is fine. To grab the id, escape the emoji with a backslash (e.g \:emoji:)

// General Stats
const coinEmoji = "<:Coins:1109913124171153438>";
const hpEmoji = "<:RpgHeart:1119594242994618459>";
const armorEmoji = "<:ArmorStat:1121286429042024581>";
const attackEmoji = "<:Atk:1134903673688965180>";
const critEmoji = "<:AtkCrit:1134903672149655553>";
const levelEmoji = "<:LevelBook:1130623075717759030>";

// Stats being increased
const attackUpEmoji = "<:AtkUp:1134903669356240957>";
const critUpEmoji = "<:AtkCritUp:1134903668345421884>";
const armorUpEmoji = "<:ArmorStatUp:1121286519504781343>";
const levelUpEmoji = "<:LevelBookUp:1130623558217900193>";

// Shop
// Set shopImage to "null" (no quotes) if you don't want an image. I have not provided one.
const shopImage = null;
const descriptionEmoji = "<:SpeechBubble:1121299256150610030>";

// Items - Misc
const lifesaverEmoji = "<:Lifesaver:1110248791304581280>";

// Items - Armor (in order of strength)
const celestialArmorEmoji = "<:CelestialArmor:1121263240102547527>";
const sunforgedArmorEmoji = "<:SunforgedArmor:1121263235312660601>";
const glacialArmorEmoji = "<:GlacialArmor:1121263241251790919>";
const abyssalArmorEmoji = "<:AbyssalArmor:1121263231768477726>";
const verdantArmorEmoji = "<:VerdantArmor:1121263234234720306>";
const sylvanArmorEmoji = "<:SylvanArmor:1121263238785540136>";
const topazineArmorEmoji = "<:TopazineArmor:1121263236570939512>";
const stoneRingEmoji = "<:StoneRing:1109928129763483688>";

// Items - Weapons (in order of strength)
const bladeOfTheDeadEmoji = "<:BladeofTheDead:1134086324576591972>";
const divineWrathEmoji = "<:DivineWrath:1134086320327761972>";
const umbralEclipseEmoji = "<:UmbralEclipse:1134086329521668118>";
const azurebladeEmoji = "<:Azureblade:1134086638746734682>";
const zephyrsBreezeEmoji = "<:ZephyrsBreeze:1134086322215207043>";
const squiresHonorEmoji = "<:SquiresHonor:1134086325960708186>";
const crimsonDaggerEmoji = "<:CrimsonDagger:1134087299248955503>";

// Items - Drops (from random events -- coming soon.)
const demonWingEmoji = "<:DemonWing:1138200819267817545>";

// Resources
const diamondEmoji = "<:Diamond:1109925710799319181>";
const woodEmoji = "<:WoodLogs:1109931701469192294>";
const stoneEmoji = "<:Stone:1138200822828773457>";

// Achievements
const falseEmoji = "<:AchievementLock:1119603099049414797>";
const trueEmoji = "<:AchievementUnlock:1119603100253159484>";

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
// await incr(id, key, value);
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

  await set(`${userId}_celestialArmor`, null);
  await set(`${userId}_sunforgedArmor`, null);
  await set(`${userId}_glacialArmor`, null);
  await set(`${userId}_abyssalArmor`, null);
  await set(`${userId}_verdantArmor`, null);
  await set(`${userId}_sylvanArmor`, null);
  await set(`${userId}_topazineArmor`, null);
  await set(`${userId}_stoneRing`, null);

  await set(`${userId}_bladeOfTheDead`, null);
  await set(`${userId}_divineWrath`, null);
  await set(`${userId}_umbralEclipse`, null);
  await set(`${userId}_azureblade`, null);
  await set(`${userId}_zephyrsBreeze`, null);
  await set(`${userId}_squiresHonor`, null);
  await set(`${userId}_crimsonDagger`, null);

  await set(`${userId}_demonWing`, null);
  await set(`${userId}_lifesaver`, null);
  await set(`${userId}_critChance`, null);
  await set(`${userId}_critMultiplier`, null);

  await resetCooldowns(userId);
}

// Calculate xp rewards for levelling up.
// Each level: +5 damage (max 25), +100hp, +100max_hp, +1 armor
// await calculateXP(id, nextlvl);

async function calculateXP(id, nextlvl) {
  // Once the user reaches level 25, they can't level up anymore.
  const currentlvl = await get(`${id}_level`);
  if (currentlvl == 25) {
    return;
  }

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
  // Once the user reaches level 25, they can't level up anymore.
  const currentlvl = await get(`${id}_level`);
  const nextlvl = await get(`${id}_next_level`);
  if (currentlvl == 25) {
    return;
  }
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

// Cooldown system
// Cooldowns are stored in the database as a unix second timestamp.

// Check if a cooldown is active.
// await checkCooldown(id, command);
async function checkCooldown(id, command) {
  const now = Date.now();
  const cooldownUntil = await get(`${id}_${command}_cooldown`);
  if (cooldownUntil == null || cooldownUntil < now) {
    return false;
  }
  return true;
}

// Set a cooldown
// The cooldown can be a number (milliseconds), or a string (e.g 1s, 1m, 1h, 1d, 1w, 1m, 1y)
// await setCooldown(id, command, cooldown);
async function setCooldown(id, command, cooldown) {
  const now = Date.now();
  const cooldownUntil = await get(`${id}_${command}_cooldown`);

  let cooldownValue;
  if (typeof cooldown === "number") {
    if (cooldown < 0) {
      throw new Error("Cooldown cannot be negative!");
    }
    cooldownValue = now + cooldown;
  } else if (typeof cooldown === "string") {
    cooldownValue = now + ms(cooldown);
  } else {
    throw new Error("Invalid cooldown value! Value sent: " + cooldown);
  }

  if (cooldownUntil == null || cooldownUntil < now) {
    await set(`${id}_${command}_cooldown`, cooldownValue);
    return true;
  } else {
    return false;
  }
}


// Remove a cooldown.
// await removeCooldown(id, command);
async function removeCooldown(id, command) {
  await set(`${id}_${command}_cooldown`, null);
}

// Get a cooldown's time in milliseconds.
// await getCooldown(id, command);
async function getCooldown(id, command) {
  const now = Date.now();
  const cooldownUntil = await get(`${id}_${command}_cooldown`);
  if (cooldownUntil == null || cooldownUntil < now) {
    return 0;
  } else {
    return cooldownUntil - now;
  }
}

// Reset all cooldowns for a user.
// This is used for when a user dies.
// await resetCooldowns(id);
async function resetCooldowns(id) {
  let cursor = "0";
  do {
    const [nextCursor, keys] = await redis.scan(cursor, "MATCH", `${id}_*_cooldown`);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`Deleted cooldowns: ${keys.join(", ")}\nfor user ${id}`);
    }
    cursor = nextCursor;
  } while (cursor !== "0");
} // We could also just use KEYS, but that's not exactly recommended for production. https://redis.io/commands/keys

module.exports = {
  coinEmoji,
  hpEmoji,
  armorEmoji,
  attackEmoji,
  critEmoji,
  levelEmoji,
  attackUpEmoji,
  critUpEmoji,
  armorUpEmoji,
  levelUpEmoji,
  shopImage,
  descriptionEmoji,
  lifesaverEmoji,
  demonWingEmoji,
  diamondEmoji,
  woodEmoji,
  stoneEmoji,
  celestialArmorEmoji,
  sunforgedArmorEmoji,
  glacialArmorEmoji,
  abyssalArmorEmoji,
  verdantArmorEmoji,
  sylvanArmorEmoji,
  topazineArmorEmoji,
  stoneRingEmoji,
  bladeOfTheDeadEmoji,
  divineWrathEmoji,
  umbralEclipseEmoji,
  azurebladeEmoji,
  zephyrsBreezeEmoji,
  squiresHonorEmoji,
  crimsonDaggerEmoji,
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

const cooldown = {
  check: checkCooldown,
  set: setCooldown,
  remove: removeCooldown,
  get: getCooldown,
  reset: resetCooldowns,
};

module.exports.cooldown = cooldown;
