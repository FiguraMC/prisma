const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const DataStorage = require('../../util/dataStorage');

module.exports = {
    name: 'requestunban',
    usage: '`?requestunban <@user|userId>` - Unbans a user previously banned from the request system.',
    moderator: true,
    /**
     * 
     * @param {Discord.Message} message 
     * @param {String[]} args 
     */
    async execute(message, args) {
        const memberId = args[0];

        let fetchedMember = undefined;
        if (memberId) fetchedMember = await message.guild.members.fetch(memberId).catch(console.error);

        const member = message.mentions.members.first() || fetchedMember;

        if (!member) return message.reply('Please specify a user.');

        if (!DataStorage.storage.people) DataStorage.storage.people = {};

        const person = DataStorage.storage.people[member.id];
        if (person?.requestban) {
            delete person.requestban;
            DataStorage.save('storage');
            message.reply('Request unbanned ' + member.user.tag);
        }
        else {
            message.reply('This user is not banned.');
        }
    },
};
