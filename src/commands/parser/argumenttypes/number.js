const CommandParseError = require('../commandParseError');

module.exports = {
    type: 'number',
    validate: async (value, options = {}, client) => {

        options.min = options.min ?? -Infinity;
        options.max = options.max ?? Infinity;
        options.clampOutOfBounds = options.clampOutOfBounds ?? false;

        if (isNaN(value)) throw new CommandParseError(`"${value}" is not a number.`);

        value = Number(value);

        if (value < options.min) {
            if (options.clampOutOfBounds) {
                return options.min;
            }
            else {
                throw new CommandParseError(`"${value}" is too small. Minimum is ${options.min}.`);
            }
        }
        if (value > options.max) {
            if (options.clampOutOfBounds) {
                return options.max;
            }
            else {
                throw new CommandParseError(`"${value}" is too large. Maximum is ${options.max}.`);
            }
        }
        return value;
    },
};
