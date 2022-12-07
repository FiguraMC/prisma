const CommandParseError = require('../commandParseError');

module.exports = {
    type: 'command',
    validate: async (value, options, commandMessage) => {
        const command = commandMessage.client.prefixCommands.get(value) ?? commandMessage.client.slashCommands.get(value);
        if (command == undefined) {
            throw new CommandParseError(`"${value}" is not a valid command.`);
        }
        return command;
    },
};
