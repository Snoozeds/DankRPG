const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { emoji, get, set, incr, decr } = require("../../globals");

const items = [
  {
    name: "cat",
    emoji: emoji.cat,
    variables: {
      owned: "catOwned",
    },
    price: 5000,
    allowMultiple: false,
  },
  {
    name: "dog",
    emoji: emoji.dog,
    variables: {
      owned: "dogOwned",
    },
    price: 10000,
    allowMultiple: false,
  },
  {
    name: "duck",
    emoji: emoji.duck,
    variables: {
      owned: "duckOwned",
    },
    price: 15000,
    allowMultiple: false,
  },
  {
    name: "catFood",
    emoji: emoji.catFood,
    variables: {
      owned: "catFood",
      usesLeft: "catFoodUsesLeft",
    },
    price: 100,
    allowMultiple: true,
    uses: 5,
  },
  {
    name: "dogFood",
    emoji: emoji.dogFood,
    variables: {
      owned: "dogFood",
      usesLeft: "dogFoodUsesLeft",
    },
    price: 100,
    allowMultiple: true,
    uses: 5,
  },
  {
    name: "duckFood",
    emoji: emoji.duckFood,
    variables: {
      owned: "duckFood",
      usesLeft: "duckFoodUsesLeft",
    },
    price: 100,
    allowMultiple: true,
    uses: 5,
  },
  {
    name: "petShampoo",
    emoji: emoji.petShampoo,
    variables: {
      owned: "petShampoo",
      usesLeft: "petShampooUsesLeft",
    },
    price: 100,
    allowMultiple: true,
    uses: 10,
  },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pet")
    .setDescription("View your pet or buy a pet")
    .addSubcommand((subcommand) => subcommand.setName("wash").setDescription("Wash your equipped pet"))
    .addSubcommand((subcommand) => subcommand.setName("status").setDescription("Checks the status of your equipped pet"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("buy")
        .setDescription("Buy a pet or pet food")
        .addStringOption((option) =>
          option
            .setName("item")
            .setDescription("The pet or pet food you want to buy")
            .addChoices(
              {
                name: "Cat",
                value: "cat",
              },
              {
                name: "Dog",
                value: "dog",
              },
              {
                name: "Duck",
                value: "duck",
              },
              {
                name: "Cat food",
                value: "catFood",
              },
              {
                name: "Dog food",
                value: "dogFood",
              },
              {
                name: "Duck food",
                value: "duckFood",
              },
              {
                name: "Pet shampoo",
                value: "petShampoo",
              }
            )
            .setRequired(true)
        )
        .addIntegerOption((option) => option.setName("amount").setDescription("The amount of the item you want to buy").setRequired(false))
    )
    .addSubcommand((subcommand) => subcommand.setName("shop").setDescription("View the pet shop"))
    .addSubcommand((subcommand) => subcommand.setName("feed").setDescription("Feed your equipped pet"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("equip")
        .setDescription("Equip a pet")
        .addStringOption((option) =>
          option
            .setName("pet")
            .setDescription("The pet you want to equip")
            .addChoices({ name: "Cat", value: "cat" }, { name: "Dog", value: "dog" }, { name: "Duck", value: "duck" })
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) => subcommand.setName("unequip").setDescription("Unequip your current pet")),
  async execute(interaction) {
    const command = interaction.options.getSubcommand();
    const user = interaction.user;

    if (command === "shop") {
      const embed = new EmbedBuilder()
        .setTitle("Pet Shop")
        .setDescription(`Your balance: ${emoji.coins}${await get(`${user.id}_coins`)}`)
        .addFields(
          {
            name: `${emoji.cat} Cat ${(await get(`${user.id}_catOwned`)) ? "(owned)" : ""}`,
            value: `Has a small chance to find you a ${emoji.healthPotion}**health potion** while you are away.\n${emoji.coins} 5000\n\-`,
          },
          {
            name: `${emoji.dog} Dog ${(await get(`${user.id}_dogOwned`)) ? "(owned)" : ""}`,
            value: `Has a chance to find you a ${emoji.healthPotion}**health potion**\nand a small chance to find you ${emoji.coins}**coins** while you are away.\n${emoji.coins} 10,000\n\-`,
          },
          {
            name: `${emoji.duck} Duck ${(await get(`${user.id}_duckOwned`)) ? "(owned)" : ""}`,
            value: `Has a chance to find you ${emoji.healthPotion}**health potions**\nand a chance to find you ${emoji.coins}**coins** while you are away.\n${emoji.coins} 15,000\n\-`,
          },
          {
            name: `${emoji.catFood} Cat food ${(await get(`${user.id}_catFoodUsesLeft`)) > 0 ? `(uses left: ${await get(`${user.id}_catFoodUsesLeft`)})` : ""}`,
            value: `Feed your cat to keep it happy, and keep the chances for the rewards it gives.\n**Has 5 uses per purchase.**\n${emoji.coins} 100\n\-`,
          },
          {
            name: `${emoji.dogFood} Dog food ${(await get(`${user.id}_dogFoodUsesLeft`)) > 0 ? `(uses left: ${await get(`${user.id}_dogFoodUsesLeft`)})` : ""}`,
            value: `Feed your dog to keep it happy, and keep the chances for the rewards it gives.\n**Has 5 uses per purchase.**\n${emoji.coins} 100\n\-`,
          },
          {
            name: `${emoji.duckFood} Duck food ${(await get(`${user.id}_duckFoodUsesLeft`)) > 0 ? `(uses left: ${await get(`${user.id}_duckFoodUsesLeft`)})` : ""}`,
            value: `Feed your duck to keep it happy, and keep the chances for the rewards it gives.\n**Has 5 uses per purchase.**\n${emoji.coins} 100\n\-`,
          },
          {
            name: `${emoji.petShampoo} Pet shampoo ${(await get(`${user.id}_petShampooUsesLeft`)) > 0 ? `(uses left: ${await get(`${user.id}_petShampooUsesLeft`)})` : ""}`,
            value: `Shampoo needed to wash your pet.\n**Has 10 uses per purchase.**\n${emoji.coins} 100`,
          }
        )
        .setFooter({ text: "Use /pet buy <item> to buy a pet or pet food. You will need to feed and wash your pet." })
        .setColor(`${(await get(`${user.id}_color`)) || "#2b2d31"}`);
      return interaction.reply({ embeds: [embed] });
    }

    async function buyConfirmation(itemName, amount) {
      const item = items.find((i) => i.name === itemName);
      const price = item.price * amount;
      const buyConfirmation = await get(`${user.id}_buyConfirmation`);
      const itemVariable = items.find((i) => i.name === itemName).variables.owned;
      const usesLeftVariable = items.find((i) => i.name === itemName).variables.usesLeft;
      let itemNameNormal = itemName.charAt(0).toUpperCase() + itemName.slice(1).replace(/([A-Z])/g, " $1");

      if (buyConfirmation === "1" || buyConfirmation === "null") {
        const yes = new ButtonBuilder().setCustomId("yes").setLabel("Yes").setStyle(ButtonStyle.Success);
        const no = new ButtonBuilder().setCustomId("no").setLabel("No").setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder().addComponents(yes, no);

        const embed = new EmbedBuilder()
          .setTitle("Buy confirmation")
          .setDescription(`Are you sure you want to buy **${amount}x ${item.emoji} ${itemNameNormal}** for ${emoji.coins}${price}?`)
          .setColor(`${(await get(`${user.id}_color`)) || "#2b2d31"}`);
        const reply = await interaction.reply({ embeds: [embed], components: [row] });
        const collectorFilter = (i) => i.user.id === user.id;
        try {
          const confirmation = await reply.awaitMessageComponent({ filter: collectorFilter, time: 60000 }); // 60 seconds

          if (confirmation.customId === "yes") {
            const userCoins = await get(`${user.id}_coins`);
            const price = item.price * amount;

            // Check user still has enough coins
            if (userCoins < price) {
              return confirmation.update({
                content: `You don't have enough coins to buy this item. You need ${emoji.coins}${price - userCoins} more.`,
                components: [],
                embeds: [],
              });
            }

            // Check if user has bought item since confirmation
            const userHasItem = await get(`${user.id}_${item}`);
            if (userHasItem == 1 && !items.find((i) => i.name === itemName).allowMultiple) {
              return confirmation.update({
                content: `You already have this!`,
                components: [],
                embeds: [],
              });
            }

            if (amount > 1 && items.find((i) => i.name === itemName).allowMultiple) {
              return confirmation.update({
                content: `You can't buy more than one of this item.`,
                components: [],
                embeds: [],
              });
            }

            if (items.find((i) => i.name === itemName).allowMultiple && usesLeftVariable) {
              await incr(`${user.id}`, `${item}`, amount);
              await incr(`${user.id}`, `${usesLeftVariable}`, amount * items.find((i) => i.name === itemName).uses);
              await decr(`${user.id}`, "coins", price);
              await interaction.editReply({
                content: `You bought **${amount}x ${item.emoji} ${itemNameNormal}** for ${emoji.coins}${price}.`,
                components: [],
                embeds: [],
              });
            }

            if (!items.find((i) => i.name === itemName).allowMultiple && (userHasItem == 0 || userHasItem == "")) {
              await set(`${user.id}_${itemVariable}`, true);
              await decr(`${user.id}`, "coins", price);
              await interaction.editReply({
                content: `You bought ${item.emoji} **${itemNameNormal}** for ${emoji.coins}${price}.`,
                components: [],
                embeds: [],
              });
            }
          } else if (confirmation.customId === "no") {
            return confirmation.update({
              content: `Cancelled.`,
              components: [],
              embeds: [],
            });
          }
        } catch (err) {
          await interaction.editReply({ content: "You took too long to respond. Purchase cancelled.", components: [], embeds: [] });
          console.log(err);
        }
      } else {
        // buy without confirmation
        const userCoins = await get(`${user.id}_coins`);
        const price = item.price * amount;

        // Check user still has enough coins
        if (userCoins < price) {
          return interaction.editReply({
            content: `You no longer have enough coins to buy this item. You need ${emoji.coins}${price - userCoins} more.`,
            embeds: [],
            components: [],
          });
        }

        // Check if user has bought item since confirmation
        const userHasItem = await get(`${user.id}_${items.find((i) => i.name === itemName).variables.owned}`);

        if (userHasItem == 1 && items.find((i) => i.name === itemName).allowMultiple) {
          return interaction.editReply({
            content: `You have since bought this item. You cannot buy multiple of this item.`,
            embeds: [],
            components: [],
          });
        }

        if (amount > 1 && items.find((i) => i.name === itemName).allowMultiple) {
          return interaction.editReply({
            content: `You can't buy more than one of this item.`,
            embeds: [],
            components: [],
          });
        }

        if (items.find((i) => i.name === itemName).allowMultiple && usesLeftVariable) {
          await incr(`${user.id}`, `${item}`, amount);
          await incr(`${user.id}`, `${usesLeftVariable}`, amount * items.find((i) => i.name === itemName).uses);
          await decr(`${user.id}`, "coins", price);
          await interaction.editReply({
            content: `You bought **${amount}x ${item.emoji} ${itemNameNormal}** for ${emoji.coins}${price}.`,
            embeds: [],
            components: [],
          });
        }

        if (!items[item].allowMultiple && (userHasItem == 0 || userHasItem == "")) {
          await set(`${user.id}_${itemVariable}`, true);
          await decr(`${user.id}`, "coins", price);
          await interaction.editReply({
            content: `You bought ${item.emoji} **${itemNameNormal}** for ${emoji.coins}${price}.`,
            embeds: [],
            components: [],
          });
        }

        return interaction.editReply({
          content: `You bought ${item.emoji} **${itemNameNormal}** for ${emoji.coins}${price}.`,
          embeds: [],
          components: [],
        });
      }
    }

    if (command === "buy") {
      const item = interaction.options.getString("item");
      const amount = interaction.options.getInteger("amount") ?? 1;
      const coins = await get(`${user.id}_coins`);
      const price = items.find((i) => i.name === item).price * amount;
      const allowMultiple = items.find((i) => i.name === item).allowMultiple;
      const hasItem = await get(`${user.id}_${items.find((i) => i.name === item).variables.owned}`);

      if (!allowMultiple && hasItem) {
        return interaction.reply({ content: `You already have this item. You can only buy one.`, ephemeral: true });
      }

      if (amount > 1 && !allowMultiple) {
        return interaction.reply({ content: `You can only buy one of this item.`, ephemeral: true });
      }

      if (coins < price) {
        return interaction.reply({ content: `You don't have enough coins to buy this item. You need ${emoji.coins}${price - coins} more.`, ephemeral: true });
      }

      buyConfirmation(item, amount);
    }

    if (command === "wash") {
      const pet = await get(`${user.id}_petEquipped`);
      if (!pet || pet === "") {
        return interaction.reply({ content: "You do not have a pet equipped.", ephemeral: true });
      }
      if (!(await get(`${user.id}_petShampooUsesLeft`))) {
        return interaction.reply({ content: "You do not have any pet shampoo.", ephemeral: true });
      }
      if ((await get(`${user.id}_petCleanliness_${pet}`)) >= 100) {
        return interaction.reply({ content: `Your ${pet} is already clean.`, ephemeral: true });
      }
      if ((await get(`${user.id}_petCleanliness_${pet}`)) > 60) {
        return interaction.reply({ content: `Your ${pet} is not dirty enough to wash.`, ephemeral: true });
      }
      if ((await get(`${user.id}_petCleanliness_${pet}`)) < 100) {
        await set(`${user.id}_petCleanliness_${pet}`, 100);
        let newHappiness = Number(await get(`${user.id}_petHappiness_${pet}`)) + 50;
        if (newHappiness <= 100) {
          await incr(`${user.id}`, `petHappiness_${pet}`, 50);
        }
        await decr(`${user.id}`, "petShampooUsesLeft", 1);
        return interaction.reply({
          content: `You washed your ${pet}.\n${emoji.petCleanliness} 100\n${emoji.petHappiness}${await get(`${user.id}_petHappiness_${pet}`)}`,
          ephemeral: true,
        });
      }
    }

    if (command === "status") {
      const pet = await get(`${user.id}_petEquipped`);
      const petEmoji = items.find((i) => i.name === pet).emoji;
      let petUppercase = pet.charAt(0).toUpperCase() + pet.slice(1);
      const happiness = await get(`${user.id}_petHappiness_${pet}`);
      const fullness = await get(`${user.id}_petFullness_${pet}`);
      const cleanliness = await get(`${user.id}_petCleanliness_${pet}`);

      let rewards = [
        {
          name: "cat",
          healthPotion: 15,
          coins: 0,
        },
        {
          name: "dog",
          healthPotion: 17,
          coins: 20,
        },
        {
          name: "duck",
          healthPotion: 20,
          coins: 25,
        },
      ];

      if (happiness <= 50) {
        rewards = [
          {
            name: "cat",
            healthPotion: 10,
            coins: 0,
          },
          {
            name: "dog",
            healthPotion: 12,
            coins: 15,
          },
          {
            name: "duck",
            healthPotion: 15,
            coins: 20,
          },
        ];
      }

      if (happiness <= 25) {
        rewards = [
          {
            name: "cat",
            healthPotion: 5,
            coins: 0,
          },
          {
            name: "dog",
            healthPotion: 9,
            coins: 10,
          },
          {
            name: "duck",
            healthPotion: 10,
            coins: 15,
          },
        ];
      }

      if (happiness === 0) {
        rewards = [
          {
            name: "cat",
            healthPotion: 0,
            coins: 0,
          },
          {
            name: "dog",
            healthPotion: 0,
            coins: 0,
          },
          {
            name: "duck",
            healthPotion: 0,
            coins: 0,
          },
        ];
      }

      if (pet === "") return interaction.reply({ content: "You do not have a pet equipped.", ephemeral: true });
      if (pet === null) return interaction.reply({ content: "You do not have a pet equipped.", ephemeral: true });

      const embed = new EmbedBuilder()
        .setTitle(`${petEmoji} ${petUppercase} status:`)
        .addFields(
          {
            name: `${emoji.petHappiness} Happiness`,
            value: `**${happiness}%**`,
            inline: true,
          },
          {
            name: `${emoji.petFullness} Fullness`,
            value: `**${fullness}% ${fullness === "0" ? `(You should feed your ${pet}!)` : ""}**`,
            inline: true,
          },
          {
            name: `${emoji.petCleanliness} Cleanliness`,
            value: `**${cleanliness}% ${cleanliness === "0" ? `(You should wash your ${pet}!)` : ""}**`,
            inline: true,
          },
          {
            name: `-`,
            value: `** **`,
            inline: false,
          },
          {
            name: `Current ${emoji.healthPotion} chance`,
            value: `**${rewards.find((r) => r.name === pet).healthPotion}%**`,
            inline: true,
          },
          {
            name: `Current ${emoji.coins} chance`,
            value: `**${rewards.find((r) => r.name === pet).coins}%**`,
            inline: true,
          }
        )
        .setColor(`${(await get(`${user.id}_color`)) || "#2b2d31"}`)
        .setFooter({ text: `Rewards have a chance of being given after running a command after you have been away for more than 30m.` });
      return interaction.reply({ embeds: [embed] });
    }

    if (command === "equip") {
      const pet = interaction.options.getString("pet");
      if (!(await get(`${user.id}_${pet}Owned`))) {
        return interaction.reply({ content: `You do not own a ${pet}.`, ephemeral: true });
      }
      if ((await get(`${user.id}_petEquipped`)) && pet != (await get(`${user.id}_petEquipped`))) {
        const lastPet = await get(`${user.id}_petEquipped`);
        await set(`${user.id}_petEquipped_${await get(`${user.id}_petEquipped`)}`, false);
        await set(`${user.id}_petEquipped_${pet}`, true);
        await set(`${user.id}_petEquipped`, pet);
        return interaction.reply({ content: `You equipped your ${pet} and unequipped your ${lastPet}.`, ephemeral: true });
      }
      if ((await get(`${user.id}_petEquipped`)) === pet) {
        return interaction.reply({ content: `You already have a ${pet} equipped.`, ephemeral: true });
      }
      if (
        (await get(`${user.id}_petEquipped_${pet}`)) == null ||
        (await get(`${user.id}_petEquipped_${pet}`)) == "" ||
        (await get(`${user.id}_petEquipped_${pet}`)) == false ||
        (await get(`${user.id}_petEquipped`)) == null ||
        (await get(`${user.id}_petEquipped`)) == "" ||
        (await get(`${user.id}_petEquipped`)) == false
      ) {
        await set(`${user.id}_petEquipped_${pet}`, true);
        await set(`${user.id}_petEquipped`, pet);
        return interaction.reply({ content: `You equipped your ${pet}.`, ephemeral: true });
      }
    }

    if (command === "unequip") {
      const pet = await get(`${user.id}_petEquipped`);
      if (!pet || pet === "") return interaction.reply({ content: "You do not have a pet equipped.", ephemeral: true });
      if (await get(`${user.id}_petEquipped_${pet}`)) {
        await set(`${user.id}_petEquipped_${pet}`, false);
        await set(`${user.id}_petEquipped`, "");
        return interaction.reply({ content: `You unequipped your ${pet}.`, ephemeral: true });
      }
    }

    if (command === "feed") {
      const pet = await get(`${user.id}_petEquipped`);
      if (!(await get(`${user.id}_${pet}FoodUsesLeft`))) {
        return interaction.reply({ content: `You do not have any ${pet} food.`, ephemeral: true });
      }
      if ((await get(`${user.id}_petFullness_${pet}`)) >= 100) {
        return interaction.reply({ content: `Your ${pet} is already full.`, ephemeral: true });
      }
      if ((await get(`${user.id}_petFullness_${pet}`)) > 60) {
        return interaction.reply({ content: `Your ${pet} is not hungry enough to eat.`, ephemeral: true });
      }
      if ((await get(`${user.id}_petFullness_${pet}`)) < 100) {
        if ((await get(`${user.id}_${pet}FoodUsesLeft`)) < 1) {
          return interaction.reply({ content: `You do not have any ${pet} food.`, ephemeral: true });
        }

        if ((await get(`${user.id}_${pet}FoodUsesLeft`)) < 1) {
          return interaction.reply({ content: `You do not have any ${pet} food left.`, ephemeral: true });
        }

        await decr(`${user.id}`, `${pet}FoodUsesLeft`, 1);
        await set(`${user.id}_petFullness_${pet}`, 100);
        let newHappiness = Number(await get(`${user.id}_petHappiness_${pet}`)) + 50;
        if (newHappiness <= 100) {
          await incr(`${user.id}`, `petHappiness_${pet}`, 50);
        }
        return interaction.reply({
          content: `You fed your ${pet}.\n${emoji.petFullness} 100\n${emoji.petHappiness}${await get(`${user.id}_petHappiness_${pet}`)}`,
          ephemeral: true,
        });
      }
    }
  },
};
