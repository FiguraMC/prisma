const Discord = require('discord.js');

// Select Menu for avatar request tags
module.exports = new Discord.MessageActionRow()
    .addComponents(
        new Discord.MessageSelectMenu()
            .setCustomId('tags')
            .setPlaceholder('Nothing selected')
            .setMinValues(1)
            .setMaxValues(10)
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
                {
                    label: 'Figura Alpha 0.0.8',
                    description: 'This request is for Figura version 0.0.8.',
                    value: '[Figura Alpha 0.0.8]',
                },
                {
                    label: 'Figura Beta/Rewrite 0.1.0',
                    description: 'This request is for Figura version 0.1.0 or later.',
                    value: '[Figura Beta/Rewrite 0.1.0]',
                },
            ]),
    );
