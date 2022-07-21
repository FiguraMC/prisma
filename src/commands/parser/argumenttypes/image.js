const CommandParseError = require('../commandParseError');
const utility = require('../../../util/utility');
const user = require('./user');

module.exports = {
    type: 'image',
    validate: async (value, options, client) => {
        const url = utility.getURLs(value)?.at(0);
        if (url) return url;
        try {
            const validUser = await user.validate(value, options, client);
            const avatarUrl = validUser.displayAvatarURL({ format: 'png' });
            return avatarUrl;
        }
        catch {
            throw new CommandParseError(`Invalid image URL or user ID: "${value}"`);
        }
    },
};
