const { SlashCommandBuilder } = require("discord.js");
const {
  set,
  get,
  decr,
  armorEmoji,
  celestialArmorEmoji,
  sunforgedArmorEmoji,
  glacialArmorEmoji,
  abyssalArmorEmoji,
  verdantArmorEmoji,
  sylvanArmorEmoji,
  topazineArmorEmoji,
} = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder().setName("unequip").setDescription("Unequip your armor."),
  async execute(interaction) {
    const user = interaction.user;
    const equippedArmor = await get(`${user.id}_armorEquipped`);

    if (equippedArmor == "none" || equippedArmor == undefined) {
      return interaction.reply({
        content: "You don't have any armor equipped!",
        ephemeral: true,
      });
    }

    let unequippedArmorEmoji = "";
    let armorValue = 0;

    // spaghet
    if (equippedArmor === "celestial") {
      unequippedArmorEmoji = celestialArmorEmoji;
      armorValue = 50;
      await set(`${user.id}_celestialEquipped`, 0);
    } else if (equippedArmor === "sunforged") {
      unequippedArmorEmoji = sunforgedArmorEmoji;
      armorValue = 35;
      await set(`${user.id}_sunforgedEquipped`, 0);
    } else if (equippedArmor === "glacial") {
      unequippedArmorEmoji = glacialArmorEmoji;
      armorValue = 25;
      await set(`${user.id}_glacialEquipped`, 0);
    } else if (equippedArmor === "abyssal") {
      unequippedArmorEmoji = abyssalArmorEmoji;
      armorValue = 20;
      await set(`${user.id}_abyssalEquipped`, 0);
    } else if (equippedArmor === "verdant") {
      unequippedArmorEmoji = verdantArmorEmoji;
      armorValue = 15;
      await set(`${user.id}_verdantEquipped`, 0);
    } else if (equippedArmor === "sylvan") {
      unequippedArmorEmoji = sylvanArmorEmoji;
      armorValue = 10;
      await set(`${user.id}_sylvanEquipped`, 0);
    } else if (equippedArmor === "topazine") {
      unequippedArmorEmoji = topazineArmorEmoji;
      armorValue = 5;
      await set(`${user.id}_topazineEquipped`, 0);
    }

    await set(`${user.id}_armorEquipped`, "none");
    await decr(`${user.id}`, "armor", armorValue);

    return interaction.reply({
      content: `You unequipped ${unequippedArmorEmoji} ${equippedArmor}.\n${armorEmoji}**-${armorValue}**`,
      ephemeral: true,
    });
  },
};
