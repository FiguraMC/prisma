const number = require('./number');

module.exports = {
    type: 'integer',
    validate: async (value, options, client, guild) => {
        const n = await number.validate(value, options, client, guild);
        return Math.floor(n);
    },
};
