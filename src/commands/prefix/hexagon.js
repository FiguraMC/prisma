const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const hexagonalImage = require('../../util/hexagonImage');

module.exports = {
    name: 'hexagon',
    usage: '`?hexagon [userID|@user]` - Create a hexagonal profile picture.',
    /**
     * 
     * @param {Discord.Message} message 
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

        const url = member?.user.avatarURL({ format: 'png', size: 512 });

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
            console.error(err);
            message.reply('Couldn\'t find an image.');
        }
    },
};
