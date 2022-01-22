const Discord = require('discord.js');

module.exports = {
    content: '\u200b',
    components: [new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageButton()
                .setCustomId('new_avatar_request')
                .setStyle('SUCCESS')
                .setLabel('New Request'),
        ),
    ],
    embeds: [new Discord.MessageEmbed()
        .setTitle('Create your own')
        .setDescription('Before making a request, here is a checklist:\n• Search if a similar avatar already exists.\n• If its *very* simple (glowing texture, hiding armor, spawn particles, etc..) then just ask in the <#808155531389698079> channel.\n• Provide as much detail as possible, if its too vague it might be deleted.\n• **Do not repost for visibility!**')
        .setColor('3ba55d'),
    ],
};
