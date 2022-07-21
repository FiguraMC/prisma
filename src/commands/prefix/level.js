const getLevelReplyOf = require('../shared/level');

module.exports = {
    name: 'level',
    description: 'Shows Avatar Request Level of a user.',
    allowInOtherGuilds: true,
    /**
     * 
     * @param {import('discord.js').message} message 
     * @param {String[]} args 
     */
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

        // Shared command for prefix as well as slash command
        const reply = getLevelReplyOf(member.user);

        message.reply(reply);
    },
};
