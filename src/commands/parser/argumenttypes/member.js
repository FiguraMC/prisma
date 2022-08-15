const CommandParseError = require('../commandParseError');

module.exports = {
    type: 'member',
    validate: async (value, options, client, guild) => {
        let id = value;
        // get discord user id from mention string
        if (value.startsWith('<@') && value.endsWith('>')) {
            id = value.substring(2, value.length - 1);
        }
        try {
            return await guild.members.fetch(id);
        }
        catch {
            throw new CommandParseError(`"${value}" is not a valid member.`);
        }
    },
};
