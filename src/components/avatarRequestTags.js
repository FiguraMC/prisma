const Discord = require('discord.js');

module.exports = new Discord.MessageActionRow()
    .addComponents(
        new Discord.MessageSelectMenu()
            .setCustomId('tags')
            .setPlaceholder('Nothing selected')
            .setMinValues(1)
            .setMaxValues(7)
            .addOptions([
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
                {
                    label: 'IRL Payment',
                    description: 'You will pay the person in real life currency.',
                    value: '[IRL Payment]',
                },
                {
                    label: 'Payment',
                    description: 'Payment in some way, could even be MC diamonds.',
                    value: '[Payment]',
                },
                {
                    label: 'Simple',
                    description: 'This request is simple to complete.',
                    value: '[Simple]',
                },
                {
                    label: 'Advanced',
                    description: 'This request is difficult to complete.',
                    value: '[Advanced]',
                },
            ]),
    );
