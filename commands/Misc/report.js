const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("report")
        .setDescription("Send a bug report, suggestion, or user report to the developer."),
    async execute(interaction) {
        // Note: You'll need to change the channelID inside ./events/interactionCreate.js to your own report channelID for this to work properly.
        // It's set in there after 'else if (interaction.isModalSubmit())'.

        const user = interaction.user;
        const blacklistedUsers = [];

        if (blacklistedUsers.includes(user.id)) {
            return interaction.reply({
                content: "You are blacklisted from using this command.",
                ephemeral: true,
            });
        }

        const modal = new ModalBuilder()
            .setCustomId("report")
            .setTitle("Report");

        const reportType = new TextInputBuilder()
            .setCustomId("reportType")
            .setLabel("Report type (bug? suggestion? user report?)")
            .setPlaceholder("What type of report is this?")
            .setStyle(TextInputStyle.Short);

        const description = new TextInputBuilder()
            .setCustomId("description")
            .setLabel("Description")
            .setPlaceholder("Please note that your userID will be sent with your report. This is to prevent abuse.")
            .setStyle(TextInputStyle.Paragraph);
        
        const actionRow1 = new ActionRowBuilder().addComponents(reportType);
        const actionRow2 = new ActionRowBuilder().addComponents(description);

        modal.addComponents(actionRow1, actionRow2);

        await interaction.showModal(modal);

    }
};
