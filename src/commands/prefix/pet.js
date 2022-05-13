const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const petPetGif = require('../../util/petpetgif');
const utility = require('../../util/utility');

module.exports = {
    name: 'pet',
    usage: '`?pet [userID|@user|imageURL] [framerate|"slow"|"fast"]` - Create a pet-pet gif.',
    allowInOtherGuilds: true,
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

        // Speed is either args[1] or, if it doesn't exist, args[0], except when args[0] was a valid user ID.
        const defaultSpeed = 18;
        let speed = args[1] ?? (fetchedMember ? defaultSpeed : parseFloat(args[0]) || defaultSpeed);
        if (speed == 'slow') speed = 10;
        else if (speed == 'fast') speed = 24;
        speed = Math.min(Math.max(speed, 5), 65);
        if (isNaN(speed)) speed = defaultSpeed;

        try {
            const animatedGif = await petPetGif(url, {
                resolution: 128,
                framerate: speed,
            });

            message.reply({
                files: [new Discord.MessageAttachment(
                    animatedGif,
                    'pet.gif',
                )],
            }).catch(console.error);
        }
        catch (err) {
            message.reply(err.message);
        }
    },
};
