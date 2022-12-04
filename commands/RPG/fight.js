const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const { get, set, incr, decr, hpEmoji, coinEmoji, checkXP } = require('../../globals.js');
const chance = require('chance').Chance();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fight')
        .setDescription('Start a fight. Rewards and damage increase per level. Higher chance of winning per damage.'),
    async execute(interaction) {

        const user = interaction.user;
        const hp = await get(`${user.id}_max_hp`);
        const hpLoss = Math.floor(chance.integer({min: hp / 7, max: hp / 6}));
        const hpLossT = hpLoss - (await get(`${user.id}_armor`) * 1);
        const coins = Math.floor(chance.integer({min: hp / 5, max: hp / 4}));
        const xp = Math.floor(chance.integer({min: hp / 10, max: hp / 6}));
        const newHP = await get(`${user.id}_hp`) - hpLossT;
        const newCoins = Number(await get(`${user.id}_coins`)) + coins
        const successrate = await get(`${user.id}_damage`) * 4;

        const started = await get(`${interaction.user.id}_hasStarted`);
        if (started === undefined) {
            await interaction.reply({
                content: 'You need to start!\nRun </start:1034285921115324517>',
                ephemeral: true
            });
        } else {
            const {
                CommandCooldown,
                msToMinutes
            } = require('discord-command-cooldown');
            const ms = require('ms');
            const fightCommandCooldown = new CommandCooldown('fight', ms(`${chance.integer({min: 10, max: 20})}s`));
            const userCooldowned = await fightCommandCooldown.getUser(interaction.user.id);
            if (userCooldowned) {
                const timeLeft = msToMinutes(userCooldowned.msLeft, false);
                await interaction.reply({
                    content: `You need to wait ${timeLeft.seconds}s before using this command again!`,
                    ephemeral: true
                });
            } else {
                // Die condition
                if (await get(`${user.id}_hp`) <= hpLossT) {
                    if (await get(`${user.id}_lifesaver`) >= 1) {
                        await decr(`${user.id}_lifesaver,`, 1);
                        await interaction.reply({
                            content: `You died, but you used a lifesaver! Your stats stay the same.\n**You should heal.**`,
                            ephemeral: true
                        });
                    } else {
                        await interaction.reply({
                            content: `You died! You lose everything.`,
                            ephemeral: true
                        });
                        await set(`${user.id}_coins`, '0');
                        await set(`${user.id}_hp`, '100');
                        await set(`${user.id}_max_hp`, '100');
                        await set(`${user.id}_armor`, '0');
                        await set(`${user.id}_damage`, '5');
                        await set(`${user.id}_xp`, '0');
                        await set(`${user.id}_xp_needed`, '100');
                        await set(`${user.id}_level_xp`, '100');
                        await set(`${user.id}_next_level`, '2');
                        await set(`${user.id}_level`, '1');
                        await set(`${user.id}_hasStarted`, '1');
                        await set(`${user.id}_color`, '#FFE302');
                        await set(`${user.id}_lifesaver`, '0');
                    }
                } else {
                    await fightCommandCooldown.addUser(interaction.user.id);
                    if (chance.bool({
                            likelihood: 0 + successrate
                        }) === true) { // Chance of winning increases with damage (damage * 4)
                        if (newHP < hpLossT) {
                            const embed = new EmbedBuilder()
                                .setTitle('Fight')
                                .setDescription(`You start a fight.\n**- ${hpLossT} ${hpEmoji} (${newHP}) :warning:**\n**+ ${coins} ${coinEmoji} (${newCoins})**${await get(`${interaction.user.id}_xp_alerts`) == '1' ? `\n**+ ${xp}XP**` : ''} ${await checkXP(interaction.user.id, xp) == true ? ` :up: **Level up!** Check /levels.` : ''}`)
                                .setColor(await get(`${user.id}_color`));
                            await decr(user.id, 'hp', hpLossT);
                            await incr(user.id, 'coins', coins);
                            await incr(user.id, 'commandsUsed', 1);
                            await interaction.reply({
                                embeds: [embed]
                            });
                        } else {
                            const embed = new EmbedBuilder()
                                .setTitle('Fight')
                                .setDescription(`You start a fight.\n**- ${hpLossT} ${hpEmoji} (${newHP})**\n**+ ${coins} ${coinEmoji} (${newCoins})**${await get(`${interaction.user.id}_xp_alerts`) == '1' ? `\n**+ ${xp}XP**` : ''} ${await checkXP(interaction.user.id, xp) == true ? ` :up: **Level up!** Check /levels.` : ''}`)
                                .setColor(await get(`${user.id}_color`));
                            await decr(user.id, 'hp', hpLossT);
                            await incr(user.id, 'coins', coins);
                            await incr(user.id, 'commandsUsed', 1);
                            await interaction.reply({
                                embeds: [embed]
                            });
                        }
                    } else {
                        if (newHP < hpLossT) {
                            const embed = new EmbedBuilder()
                                .setTitle('Fight')
                                .setTitle('Fight')
                                .setDescription(`You start a fight.\n**You lose your fight!**\n**- ${hpLossT} ${hpEmoji}(${newHP}) :warning:**`)
                                .setColor(await get(`${user.id}_color`));
                            await decr(user.id, 'hp', hpLossT);
                            await incr(user.id, 'commandsUsed', 1);
                            await interaction.reply({
                                embeds: [embed]
                            });
                        } else {
                            const embed = new EmbedBuilder()
                                .setTitle('Fight')
                                .setDescription(`You start a fight.\n**You lose your fight!**\n**- ${hpLossT} ${hpEmoji}(${newHP})**`)
                                .setColor(await get(`${user.id}_color`));
                            await decr(user.id, 'hp', hpLossT);
                            await incr(user.id, 'commandsUsed', 1);
                            await interaction.reply({
                                embeds: [embed]
                            });
                        }
                    }
                }
            }
        }
    }
};