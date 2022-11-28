const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { config } = require('process');
const { get, incr } = require('../../globals.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cooldowns')
        .setDescription('Shows all cooldowns'),
    async execute(interaction) {
        const fs = require('fs'); // fs is used to read the json file, as require() caches data.
        fs.readFile('./node_modules/discord-command-cooldown/activeTimeouts.json', async (err, data) => {
            if (err) throw err;
            let cd = JSON.parse(data);
            const user = interaction.user;
            
            if(!cd.daily || !cd.fight || !cd.adventure || !cd.forage || !cd.mine || !cd.chop) {
                console.log(`No cooldowns are present within the config.json, make sure users run commands first.`)
                return interaction.reply({ content: `No cooldowns are currently present.`, ephemeral: true });
            }
            
            // if the user's id is not in the json file, return null (used later), else get their cooldown.
            // this would probably be more understood with if/else statements, but I prefer the ternary operator ;)
            const daily = cd.daily[user.id] === undefined ? null : new Date(cd.daily[user.id].timeEnd);
            const fight = cd.fight[user.id] === undefined ? null : new Date(cd.fight[user.id].timeEnd);
            const adventure = cd.adventure[user.id] === undefined ? null : new Date(cd.adventure[user.id].timeEnd);
            const forage = cd.forage[user.id] === undefined ? null : new Date(cd.forage[user.id].timeEnd);
            const mine = cd.mine[user.id] === undefined ? null : new Date(cd.mine[user.id].timeEnd);
            const chop = cd.chop[user.id] === undefined ? null : new Date(cd.chop[user.id].timeEnd);
            const embed = new EmbedBuilder()
                .setTitle(`Cooldowns: ${user.username}`)
                .setColor(await get(`${user.id}_color`))
                .setFields(
                {
                    name: `Daily:`, // if null, return "Not run yet!", else return "ready" if timeEnd is less than Date.now() or return time left.
                    value: `${daily === null ? `**Not run yet!**` : Math.round(daily.getTime() / 1000) < Math.round(Date.now() / 1000) ? `**Ready!**` : `<t:` + Math.round(daily.getTime() / 1000) + `:R>`}`,
                    inline: true
                },
                {
                    name: `Fight:`,
                    value: `${fight === null ? `**Not run yet!**` : Math.round(fight.getTime() / 1000) < Math.round(Date.now() / 1000) ? `**Ready!**` : `<t:` + Math.round(fight.getTime() / 1000) + `:R>`}`,
                    inline: true
                },
                {
                    name: `Adventure:`,
                    value: `${adventure === null ? `**Not run yet!**` : Math.round(adventure.getTime() / 1000) < Math.round(Date.now() / 1000) ? `**Ready!**` : `<t:` + Math.round(adventure.getTime() / 1000) + `:R>`}`,
                    inline: true
                },
                {
                    name: `Forage:`,
                    value: `${forage === null ? `**Not run yet!**` : Math.round(forage.getTime() / 1000) < Math.round(Date.now() / 1000) ? `**Ready!**` : `<t:` + Math.round(forage.getTime() / 1000) + `:R>`}`,
                    inline: true
                },
                {
                    name: `Mine:`,
                    value: `${mine === null ? `**Not run yet!**` : Math.round(mine.getTime() / 1000) < Math.round(Date.now() / 1000) ? `**Ready!**` : `<t:` + Math.round(mine.getTime() / 1000) + `:R>`}`,
                    inline: true
                },
                {
                    name: `Chop:`,
                    value: `${chop === null ? `**Not run yet!**` : Math.round(chop.getTime() / 1000) < Math.round(Date.now() / 1000) ? `**Ready!**` : `<t:` + Math.round(chop.getTime() / 1000) + `:R>`}`,
                    inline: true
                }
                )
                .setThumbnail(user.displayAvatarURL({
                    format: 'jpg',
                    size: 4096
                }))
                .setTimestamp();
            await interaction.reply({
                embeds: [embed]
            });
            await incr(`${interaction.user.id}`, 'commandsUsed', 1);
        });
    },
};
