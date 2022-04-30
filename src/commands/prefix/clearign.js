const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const DataStorage = require('../../util/dataStorage');

module.exports = {
    name: 'clearign',
    usage: '`?clearign <user>` - Clears a Discord user\'s Minecraft in game name.',
    moderator: true,
    /**
     * 
     * @param {Discord.Message} message 
     * @param {String[]} args 
     */
    async execute(message, args) { // eslint-disable-line no-unused-vars

        if (args.length < 1) return message.channel.send('Not enough arguments.');

        const memberId = args[0];

        let fetchedMember = undefined;
        try {
            if (memberId) fetchedMember = await message.guild.members.fetch(memberId);
        }
        // eslint-disable-next-line no-empty
        catch { }

        const member = message.mentions.members.first() || fetchedMember;
        if (member == undefined) return message.channel.send('Please specify a user.');

        message.reply('Cleared in game name of ' + member.user.tag + '.');

        if (!DataStorage.storage.people) DataStorage.storage.people = {};
        if (DataStorage.storage.people[member.id] == undefined) DataStorage.storage.people[member.id] = {};
        delete DataStorage.storage.people[member.id].mcuuid;
        delete DataStorage.storage.people[member.id].mcign;

        DataStorage.save('storage');
    },
};
