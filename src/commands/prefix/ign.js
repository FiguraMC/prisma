const DataStorage = require('../../util/dataStorage');

module.exports = {
    name: 'ign',
    description: 'Show Minecraft in game name of a Discord user.', 
    /**
     * 
     * @param {import('discord.js').Message} message 
     * @param {String[]} args 
     */
    async execute(message, args) { // eslint-disable-line no-unused-vars

        const memberId = args[0];

        let fetchedMember = undefined;
        try {
            if (memberId) fetchedMember = await message.guild.members.fetch(memberId);
        }
        // eslint-disable-next-line no-empty
        catch { }

        const member = message.mentions.members.first() || fetchedMember || message.member;
        if (member == undefined) return message.channel.send('Please specify a user.');


        if (!DataStorage.storage.people) DataStorage.storage.people = {};
        if (DataStorage.storage.people[member.id] == undefined) DataStorage.storage.people[member.id] = {};

        if (DataStorage.storage.people[member.id].mcign == undefined) {
            message.reply(member.user.tag + ' does not have a Minecraft in game name connected.');
        }
        else {
            message.reply(member.user.tag + ' is ' + DataStorage.storage.people[member.id].mcign + '.');
        }
    },
};
