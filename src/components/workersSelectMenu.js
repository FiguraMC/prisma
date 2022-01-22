const Discord = require('discord.js');

module.exports = new Discord.MessageActionRow()
    .addComponents(
        new Discord.MessageSelectMenu()
            .setCustomId('request_workers')
            .setPlaceholder('Nothing selected')
            .setMinValues(1),
    );
