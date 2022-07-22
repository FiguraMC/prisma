const Discord = require('discord.js');
const hexagonalImage = require('../../util/hexagonImage');
const utility = require('../../util/utility');

module.exports = {
    name: 'hexagon',
    description: 'Create a hexagonal profile picture.',
    allowInOtherGuilds: true,
    /**
     * 
     * @param {import('discord.js').Message} message 
     * @param {String[]} args 
     */
    async execute(message, args) { // eslint-disable-line no-unused-vars

        let fetchedMember = undefined;
        try {
            if (args[0]) fetchedMember = await message.guild.members.fetch(args[0]);
        }
        // eslint-disable-next-line no-empty
        catch { }

        const member = fetchedMember || message.mentions.members.first();

        const url = member?.displayAvatarURL({ format: 'png' }) ?? utility.getURLs(args[0] ?? '')?.at(0) ?? message.attachments.first()?.url;

        try {
            const image = await hexagonalImage(url);
            message.reply({
                files: [new Discord.MessageAttachment(
                    image,
                    'avatar.png',
                )],
            });
        }
        catch (err) {
            console.log(err);
            message.reply('Couldn\'t find an image.');
        }
    },
};
