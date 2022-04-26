const Discord = require('discord.js');

// Select Menu for avatar request tags
module.exports = new Discord.MessageActionRow()
    .addComponents(
        new Discord.MessageSelectMenu()
            .setCustomId('tags')
            .setPlaceholder('Nothing selected')
            .setMinValues(1)
            .setMaxValues(8)
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
                {
                    label: 'BB Animation',
                    description: 'BlockBench Animations are needed.',
                    value: '[BB Animation]',
                },
            ]),
    );
