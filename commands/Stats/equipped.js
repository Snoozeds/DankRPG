const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const {
  get,
  celestialArmorEmoji,
  sunforgedArmorEmoji,
  glacialArmorEmoji,
  abyssalArmorEmoji,
  verdantArmorEmoji,
  sylvanArmorEmoji,
  topazineArmorEmoji,
  bladeOfTheDeadEmoji,
  divineWrathEmoji,
  umbralEclipseEmoji,
  azurebladeEmoji,
  zephyrsBreezeEmoji,
  squiresHonorEmoji,
  crimsonDaggerEmoji,
} = require("../../globals.js");

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

    // Add all equipped items to description
    let equippedDescription = "";
    if (celestialArmor === "1") {
      equippedDescription += `${celestialArmorEmoji} Celestial Armor\n`;
    }
    if (sunforgedArmor === "1") {
      equippedDescription += `${sunforgedArmorEmoji} Sunforged Armor\n`;
    }
    if (glacialArmor === "1") {
      equippedDescription += `${glacialArmorEmoji} Glacial Armor\n`;
    }
    if (abyssalArmor === "1") {
      equippedDescription += `${abyssalArmorEmoji} Abyssal Armor\n`;
    }
    if (verdantArmor === "1") {
      equippedDescription += `${verdantArmorEmoji} Verdant Armor\n`;
    }
    if (sylvanArmor === "1") {
      equippedDescription += `${sylvanArmorEmoji} Sylvan Armor\n`;
    }
    if (topazineArmor === "1") {
      equippedDescription += `${topazineArmorEmoji} Topazine Armor\n`;
    }
    if (bladeOfTheDead === "1") {
      equippedDescription += `${bladeOfTheDeadEmoji} Blade of the Dead\n`;
    }
    if (divineWrath === "1") {
      equippedDescription += `${divineWrathEmoji} Divine Wrath\n`;
    }
    if (umbralEclipse === "1") {
      equippedDescription += `${umbralEclipseEmoji} Umbral Eclipse\n`;
    }
    if (azureblade === "1") {
      equippedDescription += `${azurebladeEmoji} Azureblade\n`;
    }
    if (zephyrsBreeze === "1") {
      equippedDescription += `${zephyrsBreezeEmoji} Zephyr's Breeze\n`;
    }
    if (squiresHonor === "1") {
      equippedDescription += `${squiresHonorEmoji} Squire's Honor\n`;
    }
    if (crimsonDagger === "1") {
      equippedDescription += `${crimsonDaggerEmoji} Crimson Dagger\n`;
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
