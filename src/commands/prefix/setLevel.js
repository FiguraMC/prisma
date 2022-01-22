const DataStorage = require('../../util/dataStorage');
const requestTierRoles = require('../../util/requestTierRoles');

module.exports = {
    name: 'setlevel',
    usage: '`?setLevel <@user|userId> <amount>` - Sets levels of a user to specified amount.',
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

        const newLevel = parseInt(args[1]);
        if (isNaN(newLevel)) return message.channel.send('Please specify the amount of requests.');

        if (!DataStorage.storage.people) {
            DataStorage.storage.people = {};
        }

        const person = DataStorage.storage.people[member.id];

        if (person == undefined || person.level == undefined) {
            message.reply(`Changed level of ${member.user.tag} to ${newLevel}.`);
        }
        else {
            message.reply(`Changed level of ${member.user.tag} from ${person.level} to ${newLevel}.`);
        }
        requestTierRoles.levelset(member, newLevel);
    },
};
