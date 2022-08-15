const CommandParseError = require('../commandParseError');
const utility = require('../../../util/utility');
const member = require('./member');

module.exports = {
    type: 'image',
    validate: async (value, options, client, guild) => {
        const url = utility.getURLs(value)?.at(0);
        if (url) return url;
        try {
            const validMember = await member.validate(value, options, client, guild);
            const avatarUrl = validMember.displayAvatarURL({ format: 'png' });
            return avatarUrl;
        }
        catch {
            throw new CommandParseError(`Invalid image URL or user ID: "${value}"`);
        }
    },
};
