const getLevelReplyOf = require('../shared/level');

module.exports = {
    name: 'level',
    usage: '`?level [@user|userId]` - Shows Avatar Request Level of a user.',
    async execute(message, args) {

        const memberId = args[0];

        let fetchedMember = undefined;
        try {
            if (memberId) fetchedMember = await message.guild.members.fetch(memberId);
        }
        // eslint-disable-next-line no-empty
        catch { }

        const member = message.mentions.members.first() || fetchedMember || message.member;
        if (member == undefined) return message.channel.send('Please specify a user.');

        const reply = getLevelReplyOf(member);

        message.reply(reply);
    },
};
