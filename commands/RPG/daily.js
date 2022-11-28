const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { get, coinEmoji, incr, checkXP } = require('../../globals.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily reward.'),
    async execute(interaction) {
        const started = await get(`${interaction.user.id}_hasStarted`);
        if (started === undefined) {
            await interaction.reply({ content: 'You need to start!\nRun </start:1034285921115324517>', ephemeral: true });
        } else {
        const {CommandCooldown, msToMinutes} = require('discord-command-cooldown');
        const ms = require('ms');
        const dailyCommandCooldown = new CommandCooldown('daily', ms('24h'));
        const userCooldowned = await dailyCommandCooldown.getUser(interaction.user.id);
        if(userCooldowned){
            const timeLeft = msToMinutes(userCooldowned.msLeft, false);
            await interaction.reply({ content: `You need to wait **${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s** before running daily again!`, ephmeral: true });
            }
            else{
                await dailyCommandCooldown.addUser(interaction.user.id);
                const xp = 100;
                await incr(`${interaction.user.id}`, `coins`, 250);
                await incr(`${interaction.user.id}`, 'xp', xp);
                const Embed = new EmbedBuilder()
                .setTitle('Daily Reward')
                .setDescription(`:white_check_mark: You collected your daily reward of ${coinEmoji}**250**. You now have ${coinEmoji}**${await get(`${interaction.user.id}_coins`)}**. ${await get(`${interaction.user.id}_xp_alerts`) == '1' ? `\n+${xp}XP` : ''} ${await checkXP(interaction.user.id, xp) == true ? ` :up: **Level up!** Check /levels.` : ''}`)
                .setColor(await get(`${interaction.user.id}_color`));
                await interaction.reply({ embeds: [Embed] });
                await incr(`${interaction.user.id}`, 'commandsUsed', 1);
            }
        }}
    };