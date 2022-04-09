const Discord = require('discord.js');

// General ticket menu at the bottom of the ticket channel
module.exports = new Discord.MessageActionRow()
    .addComponents(
        new Discord.MessageButton()
            .setCustomId('subscribe_to_tickets')
            .setLabel('Subscribe')
            .setStyle('PRIMARY'),
        new Discord.MessageButton()
            .setCustomId('unsubscribe_from_tickets')
            .setLabel('Unsubscribe')
            .setStyle('SECONDARY'),
    );
