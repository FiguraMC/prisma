const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const DataStorage = require('../../util/dataStorage');

module.exports = {
    name: 'nsfwlist',
    usage: '`?nsfwList [domain]` - Adds, removes, or shows elements on the NSFW list.',
    moderator: true,
    /**
     * 
     * @param {Discord.Message} message 
     * @param {String[]} args 
     */
    async execute(message, args) {

        if (DataStorage.storage.nsfwfilter == undefined) DataStorage.storage.nsfwfilter = [];

        const domain = args[0];

        // No arguments, show list
        if (!domain) {
            const nsfwdomains = '`' + (DataStorage.storage.nsfwfilter.toString()).replaceAll(',', '`\n`') + '`';
            message.reply(nsfwdomains == '``' ? 'No domains are in the nsfw list yet.' : nsfwdomains);
        }
        // Domain exists, remove
        else if (DataStorage.storage.nsfwfilter.includes(domain)) {
            DataStorage.storage.nsfwfilter = DataStorage.storage.nsfwfilter.filter(x => x != domain);
            message.reply('Removed `' + domain + '` from the nsfw list.');
        }
        // Domain doesnt exist, add
        else {
            DataStorage.storage.nsfwfilter.push(domain);
            message.reply('Added `' + domain + '` to the nsfw list.');
        }
        DataStorage.save();
    },
};
