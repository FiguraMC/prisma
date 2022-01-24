const Discord = require('discord.js');

// Component template for the close ticket button
module.exports = new Discord.MessageActionRow()
    .addComponents(
        new Discord.MessageButton()
            .setCustomId('close_ticket_button')
            .setLabel('Close Ticket')
            .setStyle('DANGER'),
    );
