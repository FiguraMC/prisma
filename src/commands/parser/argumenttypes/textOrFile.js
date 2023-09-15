const got = require('got');

module.exports = {
    type: 'textOrFile',
    validate: async (value, options, commandMessage) => {
        try {
            // Attempt to download the file
            const response = await got(value);
            return response.body.toString();
        }
        catch (error) {
            // Means it couldnt download, so treat it as text
            return value;
        }
    },
};
