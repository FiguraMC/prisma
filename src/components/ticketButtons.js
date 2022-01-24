const Discord = require('discord.js');

module.exports = new Discord.MessageActionRow()
    .addComponents(
        new Discord.MessageButton()
            .setCustomId('ticket_buttons')
            .setLabel('Close Ticket')
            .setStyle('DANGER'),
    );
