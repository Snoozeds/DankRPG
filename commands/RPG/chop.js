const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { incr, get } = require('../../globals');
const chance = require('chance').Chance();
const { CommandCooldown, msToMinutes } = require('discord-command-cooldown');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chop')
        .setDescription('Chop down a tree to get wood. Requires an axe.'),
    async execute(interaction) {
        const chopCooldown = new CommandCooldown('chop', ms('10s'));
        const userCooldowned = await chopCooldown.getUser(interaction.user.id);
        if(userCooldowned) {
            const timeLeft = msToMinutes(userCooldowned.msLeft, false);
            await interaction.reply({
                content: `You need to wait ${timeLeft.seconds}s before using this command again!`,
                ephemeral: true
            });
        }
        const user = interaction.user
        const axe = await get(`${user.id}_axe`);
        if(axe == 1) {
            const wood = chance.integer({min: 5, max: 10});
            const xp = 5;
            const embed = new EmbedBuilder()
            .setTitle('Wood chopped!')
            .setDescription(`<@${user.id}> chopped down a tree and got **${wood} wood!**${await get(`${interaction.user.id}_xp_alerts`) == '1' ? `\n+${xp}XP` : ''} ${await checkXP(interaction.user.id, xp) == true ? ` :up: **Level up!** Check /levels.` : ''}`)
            .setColor(await get(`${user.id}_color`))
            await incr(`${user.id}`, 'wood', wood)
            await incr(`${user.id}`, 'xp', xp)
            await incr(`${user.id}`, 'commandsUsed', 1)
            await interaction.reply({ embeds: [embed] });
        } else {
            await interaction.reply({"content": "You don't have an axe to chop down a tree!\nYou can /craft one with 5 wood and 10 stone.", "ephemeral": true});
            console.log(axe)
        }
    }
}