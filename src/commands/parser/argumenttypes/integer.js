const number = require('./number');

module.exports = {
    type: 'integer',
    validate: async (value, options, commandMessage) => {
        const n = await number.validate(value, options, commandMessage);
        return Math.floor(n);
    },
};
