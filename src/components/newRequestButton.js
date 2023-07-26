const Discord = require('discord.js');

// Message template for the new request button
module.exports = {
    content: '\u200b',
    components: [/*new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageButton()
                .setCustomId('new_avatar_request')
                .setStyle('SUCCESS')
                .setLabel('New Request'),
        ),*/
    ],
    embeds: [new Discord.MessageEmbed()
        .setTitle('Requests are closed.')
        .setDescription('We regret to inform you that the option to create requests is no longer available. However, if you wish to commission someone, kindly do so in the designated channel, <#1076400440465432676>. Thank you for your understanding.')
        .setColor('a53b3b'),
    ],
};
