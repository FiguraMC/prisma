const Discord = require('discord.js');
const svg2img = require('svg2img');

module.exports = {
    name: 'translation',
    description: 'Shows Figura translation status.',
    allowInOtherGuilds: true,
    overloads: [
        {
            arguments: [],
            /**
             * 
             * @param {import('discord.js').Message} message 
             */
            async execute(message) {
                svg2img(
                    'https://translate.figuramc.org/widget/figuramc/figura/horizontal-auto.svg',
                    {
                        resvg: {
                            fitTo: {
                                mode: 'height',
                                value: 600,
                            },
                        }
                    },
                    (error, buffer) => {
                        if (error) {
                            message.reply('Unable to process image, try again later.')
                        }
                        else {
                            message.reply({
                                files: [new Discord.MessageAttachment(
                                    buffer,
                                    'status.png',
                                )],
                            });
                        }
                    });
            },
        },
    ],
};
