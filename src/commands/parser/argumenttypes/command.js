const CommandParseError = require('../commandParseError');

module.exports = {
    type: 'command',
    validate: async (value, options, client, guild) => {
        const command = client.prefixCommands.get(value) ?? client.slashCommands.get(value);
        if (command == undefined) {
            throw new CommandParseError(`"${value}" is not a valid command.`);
        }
        return command;
    },
};
