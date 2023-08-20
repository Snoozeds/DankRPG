const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const { get, incr, decr, emoji } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sell")
    .setDescription("Sell an item from your inventory.")
    .addStringOption((option) =>
      option
        .setName("item")
        .setDescription("The item you want to sell.")
        .setRequired(true)
        .addChoices({ name: "wood", value: "wood" }, { name: "stone", value: "stone" }, { name: "diamond", value: "diamond" }, { name: "demon wing", value: "demonWing" })
    )
    .addStringOption((option) => option.setName("amount").setDescription("The amount you want to sell. Type max to sell all of that item.").setRequired(true)),
  async execute(interaction) {
    const item = interaction.options.getString("item");
    const user = interaction.user;

    // Check if amount is valid number
    const amount = interaction.options.getString("amount");
    if (isNaN(amount) && amount !== "max") {
      return interaction.reply({ content: "Please enter a valid number.", ephemeral: true });
    }

    // Check amount is not negative
    if (amount < 0 && amount !== "max") {
      return interaction.reply({ content: "Please enter a positive number.", ephemeral: true });
    }

    // Selling items
    if (item === "wood") {
      if (amount === "max") {
        const wood = Number(await get(`${user.id}_wood`));
        if (wood === null) {
          return interaction.reply({ content: "You don't have any wood to sell.", ephemeral: true });
        }
        if ((await get(`${user.id}_sellConfirmation`)) === "1" || (await get(`${user.id}_sellConfirmation`)) === null) {
          // Buttons
          const yes = new ButtonBuilder().setCustomId("yes").setLabel("Yes").setStyle(ButtonStyle.Success);
          const no = new ButtonBuilder().setCustomId("no").setLabel("No").setStyle(ButtonStyle.Danger);
          const row = new ActionRowBuilder().addComponents(yes, no);
          const reply = await interaction.reply({ content: `Are you sure you want to sell ${emoji.wood}${wood} for ${emoji.coins}${wood}?`, components: [row] });
          const collectorFilter = (i) => i.user.id === interaction.user.id;
          try {
            const confirmation = await reply.awaitMessageComponent({ filter: collectorFilter, time: 60000 }); // Waits 1 minute for a response.
            if (confirmation.customId === "yes") {
              await decr(user.id, "wood", wood);
              await incr(user.id, "coins", wood);
              await confirmation.update({ content: `You sold ${emoji.wood}${wood} for ${emoji.coins}${wood}.`, components: [] });
            } else if (confirmation.customId === "no") {
              await confirmation.update({ content: "Sell cancelled.", components: [] });
            }
          } catch (error) {
            await interaction.editReply({ content: "You did not respond in time." });
          }
        } else if ((await get(`${user.id}_sellConfirmation`)) === "0") {
          await decr(user.id, "wood", wood);
          await incr(user.id, "coins", wood);
          await interaction.reply({ content: `You sold ${emoji.wood}${wood} for ${emoji.coins}${wood}.`, components: [] });
        }
      } else {
        const wood = Number(await get(`${user.id}_wood`));
        if (wood === null) {
          return interaction.reply({ content: "You don't have any wood to sell.", ephemeral: true });
        }
        if (amount > wood) {
          return interaction.reply({ content: "You don't have enough wood to sell.", ephemeral: true });
        }
        if ((await get(`${user.id}_sellConfirmation`)) === "1" || (await get(`${user.id}_sellConfirmation`)) === null) {
          // Buttons
          const yes = new ButtonBuilder().setCustomId("yes").setLabel("Yes").setStyle(ButtonStyle.Success);
          const no = new ButtonBuilder().setCustomId("no").setLabel("No").setStyle(ButtonStyle.Danger);
          const row = new ActionRowBuilder().addComponents(yes, no);
          const reply = await interaction.reply({ content: `Are you sure you want to sell ${emoji.wood}${amount} for ${emoji.coins}${amount}?`, components: [row] });
          const collectorFilter = (i) => i.user.id === interaction.user.id;
          try {
            const confirmation = await reply.awaitMessageComponent({ filter: collectorFilter, time: 60000 }); // Waits 1 minute for a response.
            if (confirmation.customId === "yes") {
              // Check if user STILL has enough wood
              const wood = Number(await get(`${user.id}_wood`));
              if (wood === null) {
                return confirmation.update({ content: "You no longer have any wood to sell.", components: [] });
              }
              if (amount > wood) {
                return confirmation.update({ content: "You no longer have enough wood to sell.", components: [] });
              }

              await decr(user.id, "wood", amount);
              await incr(user.id, "coins", amount);
              await confirmation.update({ content: `You sold ${emoji.wood}${amount} for ${emoji.coins}${amount}.`, components: [] });
            } else if (confirmation.customId === "no") {
              await confirmation.update({ content: "Sell cancelled.", components: [] });
            }
          } catch (error) {
            await interaction.editReply({ content: "You did not respond in time." });
          }
        }
      }
    } else if (item === "stone") {
      if (amount === "max") {
        const stone = Number(await get(`${user.id}_stone`));
        if (stone === null) {
          return interaction.reply({ content: "You don't have any stone to sell.", ephemeral: true });
        }
        if ((await get(`${user.id}_sellConfirmation`)) === "1" || (await get(`${user.id}_sellConfirmation`)) === null) {
          // Buttons
          const yes = new ButtonBuilder().setCustomId("yes").setLabel("Yes").setStyle(ButtonStyle.Success);
          const no = new ButtonBuilder().setCustomId("no").setLabel("No").setStyle(ButtonStyle.Danger);
          const row = new ActionRowBuilder().addComponents(yes, no);
          const reply = await interaction.reply({ content: `Are you sure you want to sell ${emoji.stone}${stone} for ${emoji.coins}${stone * 5}?`, components: [row] });
          const collectorFilter = (i) => i.user.id === interaction.user.id;
          try {
            const confirmation = await reply.awaitMessageComponent({ filter: collectorFilter, time: 60000 }); // Waits 1 minute for a response.
            if (confirmation.customId === "yes") {
              await decr(user.id, "stone", stone);
              await incr(user.id, "coins", stone * 5);
              await confirmation.update({ content: `You sold ${emoji.stone}${stone} for ${emoji.coins}${stone * 5}.`, components: [] });
            } else if (confirmation.customId === "no") {
              await confirmation.update({ content: "Sell cancelled.", components: [] });
            }
          } catch (error) {
            await interaction.editReply({ content: "You did not respond in time." });
          }
        } else if ((await get(`${user.id}_sellConfirmation`)) === "0") {
          await decr(user.id, "stone", stone);
          await incr(user.id, "coins", stone * 5);
          await interaction.reply({ content: `You sold ${emoji.stone}${stone} for ${emoji.coins}${stone * 5}.`, components: [] });
        }
      } else {
        const stone = Number(await get(`${user.id}_stone`));
        if (stone === null) {
          return interaction.reply({ content: "You don't have any stone to sell.", ephemeral: true });
        }
        if (amount > stone) {
          return interaction.reply({ content: "You don't have enough stone to sell.", ephemeral: true });
        }
        if ((await get(`${user.id}_sellConfirmation`)) === "1" || (await get(`${user.id}_sellConfirmation`)) === null) {
          // Buttons
          const yes = new ButtonBuilder().setCustomId("yes").setLabel("Yes").setStyle(ButtonStyle.Success);
          const no = new ButtonBuilder().setCustomId("no").setLabel("No").setStyle(ButtonStyle.Danger);
          const row = new ActionRowBuilder().addComponents(yes, no);
          const reply = await interaction.reply({ content: `Are you sure you want to sell ${emoji.stone}${amount} for ${emoji.coins}${amount * 5}?`, components: [row] });
          const collectorFilter = (i) => i.user.id === interaction.user.id;
          try {
            const confirmation = await reply.awaitMessageComponent({ filter: collectorFilter, time: 60000 }); // Waits 1 minute for a response.
            if (confirmation.customId === "yes") {
              // Check if user STILL has enough stone
              const stone = Number(await get(`${user.id}_stone`));
              if (stone === null) {
                return confirmation.update({ content: "You no longer have any stone to sell.", components: [] });
              }
              if (amount > stone) {
                return confirmation.update({ content: "You no longer have enough stone to sell.", components: [] });
              }

              await decr(user.id, "stone", amount);
              await incr(user.id, "coins", amount * 5);
              await confirmation.update({ content: `You sold ${emoji.stone}${amount} for ${emoji.coins}${amount * 5}.`, components: [] });
            } else if (confirmation.customId === "no") {
              await confirmation.update({ content: "Sell cancelled.", components: [] });
            }
          } catch (error) {
            await interaction.editReply({ content: "You did not respond in time." });
          }
        } else if ((await get(`${user.id}_sellConfirmation`)) === "0") {
          await decr(user.id, "stone", amount);
          await incr(user.id, "coins", amount * 5);
          await interaction.reply({ content: `You sold ${emoji.stone}${amount} for ${emoji.coins}${amount * 5}.`, components: [] });
        }
      }
    } else if (item === "diamond") {
      if (amount === "max") {
        const diamond = Number(await get(`${user.id}_diamond`));
        if (diamond === null) {
          return interaction.reply({ content: "You don't have any diamond to sell.", ephemeral: true });
        }
        if ((await get(`${user.id}_sellConfirmation`)) === "1" || (await get(`${user.id}_sellConfirmation`)) === null) {
          // Buttons
          const yes = new ButtonBuilder().setCustomId("yes").setLabel("Yes").setStyle(ButtonStyle.Success);
          const no = new ButtonBuilder().setCustomId("no").setLabel("No").setStyle(ButtonStyle.Danger);
          const row = new ActionRowBuilder().addComponents(yes, no);
          const reply = await interaction.reply({ content: `Are you sure you want to sell ${emoji.diamond}${diamond} for ${emoji.coins}${amount * 250}?`, components: [row] });
          const collectorFilter = (i) => i.user.id === interaction.user.id;
          try {
            const confirmation = await reply.awaitMessageComponent({ filter: collectorFilter, time: 60000 }); // Waits 1 minute for a response.
            if (confirmation.customId === "yes") {
              await decr(user.id, "diamond", diamond);
              await incr(user.id, "coins", diamond * 250);
              await confirmation.update({ content: `You sold ${emoji.diamond}${diamond} for ${emoji.coins}${diamond * 250}.`, components: [] });
            } else if (confirmation.customId === "no") {
              await confirmation.update({ content: "Sell cancelled.", components: [] });
            }
          } catch (error) {
            await interaction.editReply({ content: "You did not respond in time." });
          }
        }
      } else {
        const diamond = Number(await get(`${user.id}_diamond`));
        if (diamond === null) {
          return interaction.reply({ content: "You don't have any diamond to sell.", ephemeral: true });
        }
        if (amount > diamond) {
          return interaction.reply({ content: "You don't have enough diamond to sell.", ephemeral: true });
        }
        if ((await get(`${user.id}_sellConfirmation`)) === "1" || (await get(`${user.id}_sellConfirmation`)) === null) {
          // Buttons
          const yes = new ButtonBuilder().setCustomId("yes").setLabel("Yes").setStyle(ButtonStyle.Success);
          const no = new ButtonBuilder().setCustomId("no").setLabel("No").setStyle(ButtonStyle.Danger);
          const row = new ActionRowBuilder().addComponents(yes, no);
          const reply = await interaction.reply({ content: `Are you sure you want to sell ${emoji.diamond}${amount} for ${emoji.coins}${amount * 250}?`, components: [row] });
          const collectorFilter = (i) => i.user.id === interaction.user.id;
          try {
            const confirmation = await reply.awaitMessageComponent({ filter: collectorFilter, time: 60000 }); // Waits 1 minute for a response.
            if (confirmation.customId === "yes") {
              // Check if user STILL has enough diamond
              const diamond = Number(await get(`${user.id}_diamond`));
              if (diamond === null) {
                return confirmation.update({ content: "You no longer have any diamond to sell.", components: [] });
              }
              if (amount > diamond) {
                return confirmation.update({ content: "You no longer have enough diamond to sell.", components: [] });
              }

              await decr(user.id, "diamond", amount);
              await incr(user.id, "coins", amount * 250);
              await confirmation.update({ content: `You sold ${emoji.diamond}${amount} for ${emoji.coins}${amount * 250}.`, components: [] });
            } else if (confirmation.customId === "no") {
              await confirmation.update({ content: "Sell cancelled.", components: [] });
            }
          } catch (error) {
            await interaction.editReply({ content: "You did not respond in time." });
          }
        } else if ((await get(`${user.id}_sellConfirmation`)) === "0") {
          await decr(user.id, "diamond", amount);
          await incr(user.id, "coins", amount * 250);
          await interaction.reply({ content: `You sold ${emoji.diamond}${amount} for ${emoji.coins}${amount * 250}.`, components: [] });
        }
      }
    } else if (item === "demonWing") {
      if (amount === "max") {
        const demonWing = Number(await get(`${user.id}_demonWing`));
        if (demonWing === null) {
          return interaction.reply({ content: "You don't have any demon wings to sell.", ephemeral: true });
        }
        if ((await get(`${user.id}_sellConfirmation`)) === "1" || (await get(`${user.id}_sellConfirmation`)) === null) {
          // Buttons
          const yes = new ButtonBuilder().setCustomId("yes").setLabel("Yes").setStyle(ButtonStyle.Success);
          const no = new ButtonBuilder().setCustomId("no").setLabel("No").setStyle(ButtonStyle.Danger);
          const row = new ActionRowBuilder().addComponents(yes, no);
          const reply = await interaction.reply({
            content: `Are you sure you want to sell ${emoji.demonWing}${demonWing} for ${emoji.coins}${demonWing * 300}?`,
            components: [row],
          });
          const collectorFilter = (i) => i.user.id === interaction.user.id;
          try {
            const confirmation = await reply.awaitMessageComponent({ filter: collectorFilter, time: 60000 }); // Waits 1 minute for a response.
            if (confirmation.customId === "yes") {
              await decr(user.id, "demonWing", demonWing);
              await incr(user.id, "coins", demonWing * 300);
              await confirmation.update({ content: `You sold ${emoji.demonWing}${demonWing} for ${emoji.coins}${demonWing * 300}.`, components: [] });
            } else if (confirmation.customId === "no") {
              await confirmation.update({ content: "Sell cancelled.", components: [] });
            }
          } catch (error) {
            await interaction.editReply({ content: "You did not respond in time." });
          }
        }
      } else {
        const demonWing = Number(await get(`${user.id}_demonWing`));
        if (demonWing === null) {
          return interaction.reply({ content: "You don't have any demon wings to sell.", ephemeral: true });
        }
        if (amount > demonWing) {
          return interaction.reply({ content: "You don't have enough demon wings to sell.", ephemeral: true });
        }
        if ((await get(`${user.id}_sellConfirmation`)) === "1" || (await get(`${user.id}_sellConfirmation`)) === null) {
          // Buttons
          const yes = new ButtonBuilder().setCustomId("yes").setLabel("Yes").setStyle(ButtonStyle.Success);
          const no = new ButtonBuilder().setCustomId("no").setLabel("No").setStyle(ButtonStyle.Danger);
          const row = new ActionRowBuilder().addComponents(yes, no);
          const reply = await interaction.reply({ content: `Are you sure you want to sell ${emoji.demonWing}${amount} for ${emoji.coins}${amount * 300}?`, components: [row] });
          const collectorFilter = (i) => i.user.id === interaction.user.id;
          try {
            const confirmation = await reply.awaitMessageComponent({ filter: collectorFilter, time: 60000 }); // Waits 1 minute for a response.
            if (confirmation.customId === "yes") {
              // Check if user STILL has enough demon wings
              const demonWing = Number(await get(`${user.id}_demonWing`));
              if (demonWing === null) {
                return confirmation.update({ content: "You no longer have any demon wings to sell.", components: [] });
              }
              if (amount > demonWing) {
                return confirmation.update({ content: "You no longer have enough demon wings to sell.", components: [] });
              }
              await decr(user.id, "demonWing", amount);
              await incr(user.id, "coins", amount * 300);
              await confirmation.update({ content: `You sold ${emoji.demonWing}${amount} for ${emoji.coins}${amount * 300}.`, components: [] });
            } else if (confirmation.customId === "no") {
              await confirmation.update({ content: "Sell cancelled.", components: [] });
            }
          } catch (error) {
            await interaction.editReply({ content: "You did not respond in time." });
          }
        } else if ((await get(`${user.id}_sellConfirmation`)) === "0") {
          await decr(user.id, "demonWing", amount);
          await incr(user.id, "coins", amount * 300);
          await interaction.reply({ content: `You sold ${emoji.demonWing}${amount} for ${emoji.coins}${amount * 300}.`, components: [] });
        }
      }
    }
  },
};
