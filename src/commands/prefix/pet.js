const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const petPetGif = require('../../util/petpetgif');
const utility = require('../../util/utility');

module.exports = {
    name: 'pet',
    usage: '`?pet [userID|@user|imageURL] [framerate]` - Create a pet-pet gif.',
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

        const url = member?.displayAvatarURL({ format: 'png' }) ?? utility.getURLs(args[0] ?? '')?.at(0) ?? message.attachments.first()?.url;

        const speed = args[1] ?? (parseFloat(args[0]) || 18);

        try {
            const animatedGif = await petPetGif(url, {
                resolution: 128,
                framerate: Math.min(Math.max(speed, 5), 65),
            });

            message.reply({
                files: [new Discord.MessageAttachment(
                    animatedGif,
                    'pet.gif',
                )],
            }).catch(console.error);
        }
        catch (err) {
            console.error(err);
            message.reply('Couldn\'t find an image.');
        }
    },
};
