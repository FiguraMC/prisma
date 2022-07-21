const utility = require('../../util/utility');
const DataStorage = require('../../util/dataStorage');

module.exports = {
    name: 'requestbans',
    description: 'Shows users that are banned from the requests system.',
    moderator: true,
    /**
     * 
     * @param {import('discord.js').Message} message 
     */
    async execute(message) {
        let bannedUsers = '';
        for (const key in DataStorage.storage.people) {
            if (Object.hasOwnProperty.call(DataStorage.storage.people, key)) {
                if (!DataStorage.storage.people) DataStorage.storage.people = {};
                const person = DataStorage.storage.people[key];
                if (person.requestban) {
                    bannedUsers += '<@' + key + '>\n';
                }
            }
        }
        message.reply(utility.buildEmbed('Request Bans', bannedUsers == '' ? 'List is empty.' : bannedUsers));
    },
};
