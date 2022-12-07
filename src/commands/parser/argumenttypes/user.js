const CommandParseError = require('../commandParseError');

module.exports = {
    type: 'user',
    validate: async (value, options, commandMessage) => {
        let id = value;
        // get discord user id from mention string
        if (value.startsWith('<@') && value.endsWith('>')) {
            id = value.substring(2, value.length - 1);
        }
        try {
            return await commandMessage.client.users.fetch(id);
        }
        catch {
            throw new CommandParseError(`"${value}" is not a valid user.`);
        }
    },
};
