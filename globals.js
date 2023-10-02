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
const energyEmoji = "<:Energy:1152968944089567333>";

// Bar Stats (used in /profile embed, enabled through /settings hpdisplay/leveldisplay)
// hpdisplay
const hpBarBegin = "<:HpBarBegin:1143843923471634513>";
const hpBarMiddle = "<:HpBarMiddle:1143843924708966480>";
const hpBarEnd = "<:HpBarEnd:1143843782610124820>";

// leveldisplay
const levelBarBegin = "<:LevelBarBegin:1143843926931951686>";
const levelBarMiddle = "<:LevelBarMiddle:1143843928282501172>";
const levelBarEnd = "<:LevelBarEnd:1143843784862482472>";

// empty (transparent) bars
const emptyBarBegin = "<:EmptyBarBegin:1143843919558348851>";
const emptyBarMiddle = "<:EmptyBarMiddle:1143843922150445096>";
const emptyBarEnd = "<:EmptyBarEnd:1143843781414760468>";
//

// Stats being increased
const attackUpEmoji = "<:AtkUp:1134903669356240957>";
const critUpEmoji = "<:AtkCritUp:1134903668345421884>";
const armorUpEmoji = "<:ArmorStatUp:1121286519504781343>";
const levelUpEmoji = "<:LevelBookUp:1130623558217900193>";

// Shop
// Set shopImage to "null" (no quotes) if you don't want an image. I have not provided one.
const shopImage = null;
const descriptionEmoji = "<:SpeechBubble:1121299256150610030>";

// Items - Potions
const lifesaverEmoji = "<:Lifesaver:1110248791304581280>";
const healthPotionEmoji = "<:HealthPotion:1148653721354506251>";
const energyPotionEmoji = "<:EnergyPotion:1152967885875060816>";

// Items - Tools
const axeEmoji = "<:Axe:1143526263177359401>";
const pickaxeEmoji = "<:Pickaxe:1143525887061528576>";

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

// Items - Fishing
const fishReelEmoji = "<:FishReel:1152968984120008855>"; // Used for the fishing reel button in interactionCreate.js
const fishingBaitEmoji = "<:Bait:1145759990821441577>";
const basicFishingRodEmoji = "<:BasicFishingRod:1145763976509141023>";
const betterFishingRodEmoji = "<:BetterFishingRod:1145763979344494673>";
const bestFishingRodEmoji = "<:BestFishingRod:1145763983274561556>";

// Items - Boosts
const luckPotionEmoji = "<:LuckPotion:1150996043878629376>";

// Items - Drops (/fight)
const demonWingEmoji = "<:DemonWing:1138200819267817545>";

// Items - Drops (/fish)
const tilapiaEmoji = "<:Tilapia:1145760004075425812>";
const spotEmoji = "<:Spot:1145760002972319834>";
const sardineEmoji = "<:Sardine:1145760001223307306>";
const rainbowTroutEmoji = "<:RainbowTrout:1145759998035624067>";
const pufferfishEmoji = "<:Pufferfish:1145759996378886256>";
const perchEmoji = "<:Perch:1145759994374004837>";
const octopusEmoji = "<:Octopus:1145759993187029062>";
const catfishEmoji = "<:Catfish:1145759988581662845>";
const bassEmoji = "<:Bass:1145759987549876244>";
const anchovyEmoji = "<:Anchovy:1145759984790024243>";

// Resources
const diamondEmoji = "<:Diamond:1109925710799319181>";
const woodEmoji = "<:WoodLogs:1109931701469192294>";
const stoneEmoji = "<:Stone:1138200822828773457>";

// Achievements
const achievementLockEmoji = "<:AchievementLock:1119603099049414797>";
const achievementUnlockEmoji = "<:AchievementUnlock:1119603100253159484>";

// Quests
const questEmoji = "<:RedScroll:1144998501537828987>";

// Pets
const dogEmoji = "<:GermanSheperd:1148652595418763265>";
const catEmoji = "<:TuxedoCat:1148645736985133108>";
const duckEmoji = "<:DuckPet:1148647041212354651>";

// Pet items
const dogFoodEmoji = "<:DogFood:1148647802419822602>";
const catFoodEmoji = "<:CatFood:1148647834262962287>";
const duckFoodEmoji = "<:SeedMix:1148648408358338640>";
const petShampooEmoji = "<:PetShampoo:1149259506900017244>";

// Pet status
const petHappinessEmoji = "<:PetHappiness:1148680411371798558>";
const petCleanlinessEmoji = "<:PetCleanliness:1148680412617511035>";
const petFullnessEmoji = "<:PetFullness:1148680414773395617>";

// Emoji - adventure
const chestEmoji = "<:Chest:1152977436737278072>";
const monsterEmoji = "<:Monster:1152977656975986880>";
const questionMarkEmoji = "<:QuestionMark:1152977817856901313>";
const bossEmoji = "<:Boss:1152977888040210594>";
const homeEmoji = "<:Home:1152978436994891787>";
const injuredEmoji = "<:Injured:1152978580083585136>";
const skeletonEmoji = "<:Skeleton:1158421137735290890>";

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

// List active quests
// await listActiveQuests();
async function listActiveQuests() {
  const quests = await redis.get("quests");
  if (!quests) {
    return [];
  }
  return JSON.parse(quests);
}

// Check if given quest id is active today.
// await isQuestActive(id);
async function isQuestActive(id) {
  const quests = await listActiveQuests();
  const quest = quests.find((quest) => quest.id === id);
  if (!quest) {
    return false;
  }
  return true;
}

// Check if the user has completed a quest.
// await isQuestCompleted(id, userid);
async function isQuestCompleted(id, userid) {
  const completed = await redis.lrange(`${userid}_questsCompleted`, 0, -1);
  const completedIDs = completed.map((quest) => JSON.parse(quest).id);

  // Convert the id to an integer, since it's stored as a string in the database.
  const numericId = parseInt(id, 10);

  if (!completed || completed.length === 0) {
    return false;
  }

  if (completedIDs.includes(numericId)) return true;

  return false;
}

// Complete a quest for a user.
// await completeQuest(id, userid);
async function completeQuest(id, userid) {
  await redis.lpush(`${userid}_questsCompleted`, JSON.stringify({ id: id }));

  // Rewards for the quest IDs.
  // id: reward
  const coinRewards = {
    1: 100,
    2: 150,
    3: 200,
    4: 100,
    5: 150,
    6: 150,
    7: 100,
    8: 150,
  };

  if (coinRewards[id]) {
    await incr(userid, "coins", coinRewards[id]);
  }
}

module.exports = {
  get,
  set,
  incr,
  decr,
  calculateXP,
  checkXP,
  perc,
  resetStats,
  shopImage,
};

const cooldown = {
  check: checkCooldown,
  set: setCooldown,
  remove: removeCooldown,
  get: getCooldown,
  reset: resetCooldowns,
};

const emoji = {
  coins: coinEmoji,
  hp: hpEmoji,
  armor: armorEmoji,
  attack: attackEmoji,
  crit: critEmoji,
  level: levelEmoji,
  energy: energyEmoji,
  hpBarBegin: hpBarBegin,
  hpBarMiddle: hpBarMiddle,
  hpBarEnd: hpBarEnd,
  levelBarBegin: levelBarBegin,
  levelBarMiddle: levelBarMiddle,
  levelBarEnd: levelBarEnd,
  emptyBarBegin: emptyBarBegin,
  emptyBarMiddle: emptyBarMiddle,
  emptyBarEnd: emptyBarEnd,
  attackUp: attackUpEmoji,
  critUp: critUpEmoji,
  armorUp: armorUpEmoji,
  levelUp: levelUpEmoji,
  description: descriptionEmoji,
  lifesaver: lifesaverEmoji,
  healthPotion: healthPotionEmoji,
  energyPotion: energyPotionEmoji,
  axe: axeEmoji,
  pickaxe: pickaxeEmoji,
  fishReel: fishReelEmoji,
  fishingBait: fishingBaitEmoji,
  basicFishingRod: basicFishingRodEmoji,
  betterFishingRod: betterFishingRodEmoji,
  bestFishingRod: bestFishingRodEmoji,
  luckPotion: luckPotionEmoji,
  demonWing: demonWingEmoji,
  tilapia: tilapiaEmoji,
  spot: spotEmoji,
  sardine: sardineEmoji,
  rainbowTrout: rainbowTroutEmoji,
  pufferfish: pufferfishEmoji,
  perch: perchEmoji,
  octopus: octopusEmoji,
  catfish: catfishEmoji,
  bass: bassEmoji,
  anchovy: anchovyEmoji,
  diamond: diamondEmoji,
  wood: woodEmoji,
  stone: stoneEmoji,
  celestialArmor: celestialArmorEmoji,
  sunforgedArmor: sunforgedArmorEmoji,
  glacialArmor: glacialArmorEmoji,
  abyssalArmor: abyssalArmorEmoji,
  verdantArmor: verdantArmorEmoji,
  sylvanArmor: sylvanArmorEmoji,
  topazineArmor: topazineArmorEmoji,
  stoneRing: stoneRingEmoji,
  bladeOfTheDead: bladeOfTheDeadEmoji,
  divineWrath: divineWrathEmoji,
  umbralEclipse: umbralEclipseEmoji,
  azureBlade: azurebladeEmoji,
  zephyrsBreeze: zephyrsBreezeEmoji,
  squiresHonor: squiresHonorEmoji,
  crimsonDagger: crimsonDaggerEmoji,
  achievementLock: achievementLockEmoji,
  achievementUnlock: achievementUnlockEmoji,
  questScroll: questEmoji,
  dog: dogEmoji,
  cat: catEmoji,
  duck: duckEmoji,
  dogFood: dogFoodEmoji,
  catFood: catFoodEmoji,
  duckFood: duckFoodEmoji,
  petShampoo: petShampooEmoji,
  petHappiness: petHappinessEmoji,
  petCleanliness: petCleanlinessEmoji,
  petFullness: petFullnessEmoji,
  chest: chestEmoji,
  monster: monsterEmoji,
  questionMark: questionMarkEmoji,
  boss: bossEmoji,
  home: homeEmoji,
  injured: injuredEmoji,
  skeleton: skeletonEmoji,
};

const quests = {
  active: isQuestActive,
  completed: isQuestCompleted,
  complete: completeQuest,
  listActive: listActiveQuests,
};

module.exports.cooldown = cooldown;
module.exports.emoji = emoji;
module.exports.quests = quests;
