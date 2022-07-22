const Discord = require('discord.js');
const petPetGif = require('../../util/petpetgif');
const Argument = require('../parser/argument');

module.exports = {
    name: 'pet',
    description: 'Create a pet-pet gif.',
    allowInOtherGuilds: true,
    overloads: [
        {
            arguments: [new Argument('image', 'image')],
            /**
             * @param {import('discord.js').Message} message 
             * @param {import('../parser/argumentContainer')} args
             */
            async execute(message, args) {
                sendPetPetGif(message, args.getValue('image'), 18);
            },
        },
        {
            arguments: [new Argument('image', 'image'), new Argument('framerate', 'integer', { min: 5, max: 25, clampOutOfBounds: true })],
            /**
             * @param {import('discord.js').Message} message 
             * @param {import('../parser/argumentContainer')} args
             */
            async execute(message, args) {
                sendPetPetGif(message, args.getValue('image'), args.getValue('framerate'));
            },
        },
    ],
};

/**
 * 
 * @param {import('discord.js').Message} message 
 * @param {String} image URL
 * @param {Number} framerate Integer
 */
async function sendPetPetGif(message, image, framerate) {
    try {
        const animatedGif = await petPetGif(image, { resolution: 128, framerate: framerate });
        message.reply({ files: [new Discord.MessageAttachment(animatedGif, 'pet.gif')] }).catch(console.ignore);
    }
    catch (err) {
        message.reply(err.message);
    }
}
