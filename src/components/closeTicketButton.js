const Discord = require('discord.js');

module.exports = new Discord.MessageActionRow()
    .addComponents(
        new Discord.MessageButton()
            .setCustomId('close_ticket_button')
            .setLabel('Close Ticket')
            .setStyle('DANGER'),
    );
