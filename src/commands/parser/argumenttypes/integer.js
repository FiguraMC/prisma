const number = require('./number');

module.exports = {
    type: 'integer',
    validate: async (value, options, client) => {
        const n = await number.validate(value, options, client);
        return Math.floor(n);
    },
};
