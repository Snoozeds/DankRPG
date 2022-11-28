const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { get, incr } = require('../../globals.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('marriage')
        .setDescription('Shows your/another user\'s marriage status.')
        .addUserOption (
            option => option.setName('user')
                .setDescription('The user you want to check the marriage status of.')
                .setRequired(false),
        ),
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const marriageStatus = await get(`${user.id}_marriageStatus`);
        const marriageRequest = await get(`${user.id}_marriageRequest`);
        const marriageTime = await get(`${user.id}_marriageTime`);

        if (marriageStatus == null || marriageStatus == 'single') {
            return interaction.reply({ content: 'This user is not married!', ephemeral: true});
        }
        if (marriageStatus === 'married') {
            await incr(`${user.id}`, 'commandsUsed', 1);
            const embed = new EmbedBuilder()
            .setTitle(`Marriage Status: ${user.username}`)
            .setDescription(`This user is married.`)
            .setFields(
                { name: 'Married to:', value: `<@${marriageRequest}>`, inline: true },
                { name: 'Married since:', value: `<t:${marriageTime}:R>`, inline: true },
                )
                .setColor(await get(`${user.id}_color`))
                .setTimestamp()
                .setThumbnail(interaction.user.displayAvatarURL(
                    { format: 'jpg', size: 4096 }
                ))
                return interaction.reply({ embeds: [embed] });
            }
        }
    };

    // discord.js :)



    