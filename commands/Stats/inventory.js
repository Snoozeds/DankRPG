const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { get, set, incr } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("inventory")
    .setDescription("Shows your/another user's inventory.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The member whose inventory you want to view")
        .setRequired(false)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;

    if (user.bot) {
      await interaction.reply({
        text: "You can't view the inventory of a bot!",
        ephemeral: true,
      });
      return;
    }

    // Set default values for inventory if they do not exist (null.)
    await setDefaultInventoryValues(user.id, "_lifesaver", 0);
    await setDefaultInventoryValues(user.id, "_diamond", 0);
    await setDefaultInventoryValues(user.id, "_wood", 0);
    await setDefaultInventoryValues(user.id, "_stone", 0);

    // An array for the inventory items.
    const inventoryItems = [
      { name: "Lifesavers", key: `${user.id}_lifesaver` },
      { name: "Diamonds", key: `${user.id}_diamond` },
      { name: "Stone", key: `${user.id}_stone` },
      { name: "Wood", key: `${user.id}_wood` },
    ];

    // Sort the inventoryItems array alphabetically by name.
    inventoryItems.sort((a, b) => a.name.localeCompare(b.name));

    // Loop through the inventory items and add them to the description.
    let inventoryDescription = "";
    for (const item of inventoryItems) {
      const value = await get(item.key);
      if (value != 0 && value != null) {
        inventoryDescription += `${item.name}: ${value}\n`;
      }
    }

    // If the inventory is empty, reply with an ephemeral message.
    if (inventoryDescription === "") {
      inventoryDescription = "This user has an empty inventory.";
    }

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Inventory`)
      .setDescription(inventoryDescription)
      .setColor(await get(`${user.id}_color`))
      .setThumbnail(
        interaction.user.displayAvatarURL({ format: "jpg", size: 4096 })
      );

    async function setDefaultInventoryValues(id, key, value) {
      if ((await get(`${id}${key}`)) === null) {
        await set(`${id}${key}`, value);
      }
    }

    await interaction.reply({ embeds: [embed] });
    await incr(`${user.id}`, "commandsUsed", 1);
  },
};
