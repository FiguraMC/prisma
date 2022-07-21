const DataStorage = require('../../util/dataStorage');
const got = require('got');

module.exports = {
    name: 'setign',
    description: 'Set a Discord user\'s Minecraft in game name.',
    moderator: true,
    /**
     * 
     * @param {import('discord.js').Message} message 
     * @param {String[]} args 
     */
    async execute(message, args) { // eslint-disable-line no-unused-vars

        if (args.length < 2) return message.channel.send('Not enough arguments.');

        const memberId = args[0];

        let fetchedMember = undefined;
        try {
            if (memberId) fetchedMember = await message.guild.members.fetch(memberId);
        }
        // eslint-disable-next-line no-empty
        catch { }

        const member = message.mentions.members.first() || fetchedMember;
        if (member == undefined) return message.channel.send('Please specify a user.');

        const username = args[1];
        if (username == undefined) return message.channel.send('Please specify an in game name.');

        if (!DataStorage.storage.people) DataStorage.storage.people = {};
        if (DataStorage.storage.people[member.id] == undefined) DataStorage.storage.people[member.id] = {};
        const person = DataStorage.storage.people[member.id];

        let uuid;
        let ign;
        try {
            const res = JSON.parse((await got('https://api.mojang.com/users/profiles/minecraft/' + username)).body);
            uuid = res.id;
            ign = res.name;
        }
        catch (err) {
            return message.channel.send('This is not a valid Minecraft account.');
        }

        if (person.mcuuid == undefined) {
            message.reply(`Set in game name of ${member.user.tag} to ${ign}(${uuid}).`);
        }
        else {
            message.reply(`Changed in game name of ${member.user.tag} from ${person.mcign} to ${ign}(${uuid}).`);
        }
        person.mcuuid = uuid;
        person.mcign = ign;
        DataStorage.save('storage');
    },
};
