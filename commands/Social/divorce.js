const { ButtonBuilder, ButtonStyle, SlashCommandBuilder, ActionRowBuilder } = require("discord.js");
const { set, get, incr } = require("../../globals.js");

module.exports = {
  data: new SlashCommandBuilder().setName("divorce").setDescription("Divorce your spouse"),
  async execute(interaction) {
    const user = interaction.user;
    const spouse = await get(`${user.id}_marriedTo`);
    if (spouse == null) {
      return interaction.reply({
        content: "You are not married!",
        ephemeral: true,
      });
    } else {
      // Buttons
      const yes = new ButtonBuilder().setCustomId("yes").setLabel("Yes").setStyle(ButtonStyle.Success);

      const no = new ButtonBuilder().setCustomId("no").setLabel("No").setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(yes, no);

      // get spouse as a user object
      const spouseUser = await interaction.client.users.fetch(spouse);

      // Send message
      const message = await interaction.reply({
        content: `Are you sure you want to divorce **${spouseUser.username}**?`,
        components: [row],
      });

      // Await button click
      const collectorFilter = (i) => i.user.id === interaction.user.id;

      // Waits 1 minute for a response.
      try {
        const confirmation = await message.awaitMessageComponent({
          filter: collectorFilter,
          time: 60000,
        });

        if (confirmation.customId === "yes") {
          await confirmation.update({
            content: `You divorced <@${spouse}>.`,
            components: [],
          });
          // set variables
          await set(`${user.id}_marriageStatus`, "single");
          await set(`${user.id}_marriageTime`, null);
          await set(`${user.id}_marriageRequest`, null);
          await set(`${user.id}_sender`, null);
          await set(`${spouse}_marriageStatus`, "single");
          await set(`${spouse}_marriedTo`, null);
          await set(`${spouse}_marriageTime`, null);
          await set(`${spouse}_sender`, null);
          await set(`${spouse}_marriageRequest`, null);
          await set(`${user.id}_marriedTo`, null);
        } else if (confirmation.customId === "no") {
          await confirmation.update({
            content: "Divorce cancelled.",
            components: [],
          });
        }
      } catch (e) {
        await interaction.editReply({
          content: "No buttons have been pressed within 1 minute, cancelling divorce.",
          components: [],
        });
      }
    }
  },
};
