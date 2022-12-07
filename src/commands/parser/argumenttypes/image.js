const CommandParseError = require('../commandParseError');
const utility = require('../../../util/utility');
const member = require('./member');
const user = require('./user');

module.exports = {
    type: 'image',
    validate: async (value, options, commandMessage) => {
        const url = utility.getURLs(value)?.at(0);
        if (url) return url;
        try {
            const validUser = await user.validate(value, options, commandMessage);
            const validMember = await member.validate(value, options, commandMessage).catch(console.ignore);
            const memberOrUser = validMember || validUser;
            const avatarUrl = memberOrUser.displayAvatarURL({ format: 'png' });
            return avatarUrl;
        }
        catch {
            throw new CommandParseError(`Invalid image URL or user ID: "${value}"`);
        }
    },
};
