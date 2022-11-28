const { SlashCommandBuilder } = require('@discordjs/builders');
const { set, get, incr } = require('../../globals.js');
require('../../globals.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('settings')
	.setDescription('Change your own settings.')
	.addSubcommand(subcommand =>
		subcommand
			.setName('embedcolor')
			.setDescription('Changes the color of embeds.')
			.addStringOption(option =>
                option.setName('color')
                    .setDescription('The HEX color code you want to set. Add a # before the code.')
                    .setRequired(true)))
            .addSubcommand(subcommand =>
                subcommand
                    .setName('xpalerts')
                    .setDescription('Changes whether or not you get xp alerts.')
                    .addBooleanOption(option =>
                        option.setName('xpalerts')
                            .setDescription('Whether or not you want xp alerts.')
                            .setRequired(true))),
        async execute(interaction) {
            const response = interaction.options.getString('color');
            if (interaction.options.getSubcommand() === 'embedcolor') {
                var reg=/^#([0-9a-f]{3}){1,2}$/i;
                const started = await get(interaction.user.id_hasStarted);
                if(started === undefined) {
                    await interaction.reply({ content: 'You need to start!\nRun </start:1034285921115324517>', ephemeral: true });
                } else if (reg.test(response) === false) {
                    await interaction.reply({ content: 'That is not a valid HEX color code.', ephemeral: true });
                } else {
                    await set(`${interaction.user.id}_color`, response);
                    await interaction.reply({ content: 'Your embed color has been set to ' + response + '.', ephemeral: true });
                    await incr(`${interaction.user.id}`, 'commandsUsed', 1);
                }
            } else if (interaction.options.getSubcommand() === 'xpalerts') {
                const started = await get(interaction.user.id_hasStarted);
                if(started === undefined) {
                    await interaction.reply({ content: 'You need to start!\nRun </start:1034285921115324517>', ephemeral: true });
                } else {
                    let response = interaction.options.getBoolean('xpalerts');
                    if (response === true) {
                        await set(`${interaction.user.id}_xp_alerts`, '1');
                        await interaction.reply({ content: 'You will now get xp alerts.', ephemeral: true });
                    }
                    if (response === false) {
                        await set(`${interaction.user.id}_xp_alerts`, '0');
                        await interaction.reply({ content: 'You will no longer get xp alerts. However, you\'ll still be told *when* you level up.', ephemeral: true });
                    }
                }
            }
        },
    };