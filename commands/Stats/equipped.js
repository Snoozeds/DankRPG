const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { get, emoji } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder().setName("equipped").setDescription("View your equipped items."),
  async execute(interaction) {
    const user = interaction.user;

    // Get all equipped items
    // Each will return true or false
    const celestialArmor = await get(`${user.id}_celestialEquipped`);
    const sunforgedArmor = await get(`${user.id}_sunforgedEquipped`);
    const glacialArmor = await get(`${user.id}_glacialEquipped`);
    const abyssalArmor = await get(`${user.id}_abyssalEquipped`);
    const verdantArmor = await get(`${user.id}_verdantEquipped`);
    const sylvanArmor = await get(`${user.id}_sylvanEquipped`);
    const topazineArmor = await get(`${user.id}_topazineEquipped`);
    const bladeOfTheDead = await get(`${user.id}_botdEquipped`);
    const divineWrath = await get(`${user.id}_divineEquipped`);
    const umbralEclipse = await get(`${user.id}_umbralEquipped`);
    const azureblade = await get(`${user.id}_azurebladeEquipped`);
    const zephyrsBreeze = await get(`${user.id}_zephyrEquipped`);
    const squiresHonor = await get(`${user.id}_squireEquipped`);
    const crimsonDagger = await get(`${user.id}_crimsonEquipped`);
    const basicFishingRod = await get(`${user.id}_basicFishingRodEquipped`);
    const betterFishingRod = await get(`${user.id}_betterFishingRodEquipped`);
    const bestFishingRod = await get(`${user.id}_bestFishingRodEquipped`);
    const fishingBait = await get(`${user.id}_fishingBaitEquipped`);

    // Add all equipped items to description
    let equippedDescription = "";
    if (celestialArmor === "1") {
      equippedDescription += `${emoji.celestialArmor} Celestial Armor\n`;
    }
    if (sunforgedArmor === "1") {
      equippedDescription += `${emoji.sunforgedArmor} Sunforged Armor\n`;
    }
    if (glacialArmor === "1") {
      equippedDescription += `${emoji.glacialArmor} Glacial Armor\n`;
    }
    if (abyssalArmor === "1") {
      equippedDescription += `${emoji.abyssalArmor} Abyssal Armor\n`;
    }
    if (verdantArmor === "1") {
      equippedDescription += `${emoji.verdantArmor} Verdant Armor\n`;
    }
    if (sylvanArmor === "1") {
      equippedDescription += `${emoji.sylvanArmor} Sylvan Armor\n`;
    }
    if (topazineArmor === "1") {
      equippedDescription += `${emoji.topazineArmor} Topazine Armor\n`;
    }
    if (bladeOfTheDead === "1") {
      equippedDescription += `${emoji.bladeOfTheDead} Blade of the Dead\n`;
    }
    if (divineWrath === "1") {
      equippedDescription += `${emoji.divineWrath} Divine Wrath\n`;
    }
    if (umbralEclipse === "1") {
      equippedDescription += `${emoji.umbralEclipse} Umbral Eclipse\n`;
    }
    if (azureblade === "1") {
      equippedDescription += `${emoji.azureBlade} Azureblade\n`;
    }
    if (zephyrsBreeze === "1") {
      equippedDescription += `${emoji.zephyrsBreeze} Zephyr's Breeze\n`;
    }
    if (squiresHonor === "1") {
      equippedDescription += `${emoji.squiresHonor} Squire's Honor\n`;
    }
    if (crimsonDagger === "1") {
      equippedDescription += `${emoji.crimsonDagger} Crimson Dagger\n`;
    }
    if (basicFishingRod === "1") {
      equippedDescription += `${emoji.basicFishingRod} Basic Fishing Rod\n`;
    }
    if (betterFishingRod === "1") {
      equippedDescription += `${emoji.betterFishingRod} Better Fishing Rod\n`;
    }
    if (bestFishingRod === "1") {
      equippedDescription += `${emoji.bestFishingRod} Best Fishing Rod\n`;
    }
    if (fishingBait === "1") {
      equippedDescription += `${emoji.fishingBait} Fishing Bait ${await get(`${user.id}_fishingBait`)}\n`;
    }
    if (equippedDescription === "") {
      equippedDescription = "No items equipped.";
    }

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Equipped Items`)
      .setDescription(equippedDescription)
      .setColor(await get(`${user.id}_color`))
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 4096 }))
      .setTimestamp();
    return interaction.reply({ embeds: [embed] });
  },
};
