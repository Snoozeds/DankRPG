const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { get, coinEmoji, incr, checkXP } = require('../../globals.js');
const { CommandCooldown, msToMinutes } = require('discord-command-cooldown');
const ms = require('ms');
const chance = require('chance').Chance();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('adventure')
        .setDescription('Starts an RPG adventure. Random chance of getting coins, doesn\'t scale.'),
    async execute(interaction) {
        const started = await get(`${interaction.user.id}_hasStarted`);
        const xp = chance.integer({ min: 10, max: 25 });
        if (started === undefined) {
            await interaction.reply({ content: 'You need to start!\nRun </start:1034285921115324517>', ephemeral: true });
        } else {
            
            const adventureCommandCooldown = new CommandCooldown('adventure', ms(`${chance.integer({min: 20, max: 30})}s`)); // random cooldown between 20 and 30 seconds.
            const userCooldowned = await adventureCommandCooldown.getUser(interaction.user.id);
            if(userCooldowned){
                const timeLeft = msToMinutes(userCooldowned.msLeft, false);
                await interaction.reply({ content: `You need to wait ${timeLeft.seconds}s before using this command again!`, ephemeral: true });
            }
            
            else{
                await adventureCommandCooldown.addUser(interaction.user.id);
                // 50% chance to get a random amount of coins.
                if (chance.bool({likelihood: 50}) == true) {
                    const outcome = Math.floor(chance.normal({mean: 15, dev: 5})); // https://chancejs.com/miscellaneous/normal.html
                    await incr(`${interaction.user.id}`, `coins`, outcome);
                    const trueEmbed = new EmbedBuilder()
                    .setTitle(`${interaction.user.username}'s adventure`)
                    .setDescription(`<@${interaction.user.id}> starts an adventure.\nThey find **${coinEmoji}${outcome}**, for a total of **${coinEmoji}${await get(`${interaction.user.id}_coins`)}**.${await get(`${interaction.user.id}_xp_alerts`) == '1' ? `\n+${xp}XP` : ''} ${await checkXP(interaction.user.id, xp) == true ? ` :up: **Level up!** Check /levels.` : ''}`)
                    .setColor(await get(`${interaction.user.id}_color`))
                    .setTimestamp();
                    await interaction.reply({ embeds: [trueEmbed] });
                    await incr(interaction.user.id, 'commandsUsed', 1);
                } else {
                    const falseEmbed = new EmbedBuilder()
                    .setTitle(`${interaction.user.username}'s adventure`)
                    .setDescription(`<@${interaction.user.id}> starts an adventure.\nThey find **Nothing**.`)
                    .setColor(await get(`${interaction.user.id}_color`))
                    .setTimestamp();
                    await interaction.reply({ embeds: [falseEmbed] });
                    await incr(`${interaction.user.id}`, 'commandsUsed', 1);
                }
            }
        }
    }
};