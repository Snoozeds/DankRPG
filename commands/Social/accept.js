const { SlashCommandBuilder, UserPremiumType } = require('discord.js');
const { get, set, incr } = require('../../globals.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('accept')
        .setDescription('Accept an active marriage request.'),
    async execute(interaction) {
        const user = interaction.user;
        const marriageRequest = await get(`${user.id}_marriageRequest`);
        if (marriageRequest == null) {
            return interaction.reply({ content: 'You don\'t have any active marriage requests!', ephemeral: true});
        } 
        else {
        if(await get(`${user.id}_marriageStatus`) === 'married') {return interaction.reply({ content: 'You are already married!', ephemeral: true});}
        if(await get(`${marriageRequest}_marriageStatus`) === 'married') {return interaction.reply({ content: 'This user has married to another user since their request.', ephemeral: true});}
        if(await get(`${marriageRequest}_marriageRequest`) != user.id) {return interaction.reply({ content: 'This user has cancelled their request, or married another user.', ephemeral: true});}
        if(await get(`${user.id}_sender`) === 'true') {return interaction.reply({ content: 'You can\'t accept your own request!', ephemeral: true});} else{
        await set(`${user.id}_marriageStatus`, 'married');
        await set(`${marriageRequest}_marriedTo`, user.id);
        await set(`${user.id}_marriedTo`, marriageRequest);
        await set(`${marriageRequest}_marriageStatus`, 'married');
        await set(`${user.id}_marriageTime`, Math.round(Date.now() / 1000));
        await set(`${marriageRequest}_marriageTime`, Math.round(Date.now() / 1000));
        await set(`${user.id}_sender`, null);
        await set(`${marriageRequest}_sender`, null);
        await incr(user.id, 'commandsUsed', 1);
        return interaction.reply({ content: 'You are now married to <@' + marriageRequest + '>!',});
    }
}}};