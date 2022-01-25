const DataStorage = require('../../util/dataStorage');
const requestTierRoles = require('../../util/requestTierRoles');

// Adds amount of levels to a user
// This works with negative numbers as well
module.exports = {
    name: 'addlevel',
    usage: '`?addLevel <@user|userId> <amount>` - Adds specified amount of levels to a user.',
    moderator: true,
    async execute(message, args) {

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

        const addedLevels = parseInt(args[1]);
        if (isNaN(addedLevels)) return message.channel.send('Please specify the amount of requests.');

        if (!DataStorage.storage.people) {
            DataStorage.storage.people = {};
        }

        const person = DataStorage.storage.people[member.id];

        let newLevel = 0;

        if (person == undefined || person.level == undefined) {
            newLevel = addedLevels;
            message.reply(`Changed level of ${member.user.tag} to ${newLevel}.`);
        }
        else {
            newLevel = person.level + addedLevels;
            message.reply(`Changed level of ${member.user.tag} from ${person.level} to ${newLevel}.`);
        }
        requestTierRoles.levelset(member, newLevel);
    },
};
