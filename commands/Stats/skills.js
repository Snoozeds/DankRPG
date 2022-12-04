const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { get, incr, hpEmoji, armorEmoji, attackEmoji } = require('../../globals.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skills')
        .setDescription('Explains your skills.'),
    async execute(interaction) {
        const started = await get(`${interaction.user.id}_hasStarted`);
        if (started === undefined) {
            await interaction.reply({ content: 'You need to start!\nRun </start:1034285921115324517>', ephemeral: true });
        } else {
        const embed = new EmbedBuilder()
            .setTitle('Skills')
            .addFields({
                name: `${hpEmoji} MaxHP (${await get(`${interaction.user.id}_max_hp`)})`,
                value: `The maximum amount of HP you can have.`,
                inline: false
            }, {
                name: `${hpEmoji} HP (${await get(`${interaction.user.id}_hp`)})`,
                value: `Your current HP.`,
                inline: false
            }, {
                name: `${armorEmoji} Armor (${await get(`${interaction.user.id}_armor`)})`,
                value: `Reduces your damage taken **(armor \* 100%)**.`,
                inline: false
            }, {
                name: `${attackEmoji} Damage (${await get(`${interaction.user.id}_damage`)})`,
                value: `Increases your chance of winning fights.`,
                inline: false
            }, {
                name: `:up: Level (${await get(`${interaction.user.id}_level`)})`,
                value: `You gain more rewards per level. You gain XP by using commands.\nEach level, you get +5 damage (max 25), +100hp, +100maxHP, +1 armor.`,
                inline: false
            })
            .setColor(await get(`${interaction.user.id}_color`))
            .setFooter({text: "Requested by " + interaction.user.username})
            .setTimestamp();
            await incr(`${interaction.user.id}`, 'commandsUsed', 1);
            await interaction.reply({ embeds: [embed] });
        }
    },
};
