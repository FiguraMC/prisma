const Discord = require('discord.js');

// Template for the workers select menu
// Content will be added dynamically
module.exports = new Discord.MessageActionRow()
    .addComponents(
        new Discord.MessageSelectMenu()
            .setCustomId('request_workers')
            .setPlaceholder('Nothing selected')
            .setMinValues(1),
    );
