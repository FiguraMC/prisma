const Discord = require('discord.js');

// Component template for the close ticket confirmation buttons
module.exports = new Discord.MessageActionRow()
    .addComponents(
        new Discord.MessageButton()
            .setCustomId('close_ticket_confirmation_button_yes')
            .setLabel('Confirm')
            .setStyle('DANGER'),
        new Discord.MessageButton()
            .setCustomId('close_ticket_confirmation_button_no')
            .setLabel('Cancel')
            .setStyle('SUCCESS'),
    );
