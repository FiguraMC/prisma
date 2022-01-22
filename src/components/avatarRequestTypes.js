const Discord = require('discord.js');

module.exports = new Discord.MessageActionRow()
    .addComponents(
        new Discord.MessageSelectMenu()
            .setCustomId('types')
            .setPlaceholder('Nothing selected')
            .addOptions([
                {
                    label: 'Full Avatar',
                    description: 'A full character as an avatar.',
                    value: '[Full Avatar]',
                },
                {
                    label: 'Accessory',
                    description: 'Something that could be worn or equipped.',
                    value: '[Accessory]',
                },
                {
                    label: 'Texture',
                    description: 'A texture is needed.',
                    value: '[Texture]',
                },
                {
                    label: 'Model',
                    description: 'A model is needed.',
                    value: '[Model]',
                },
                {
                    label: 'Script',
                    description: 'A script is needed.',
                    value: '[Script]',
                },
            ]),
    );
