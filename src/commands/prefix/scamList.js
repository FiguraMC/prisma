const DataStorage = require('../../util/dataStorage');

module.exports = {
    name: 'scamlist',
    usage: '`?scamList [domain]` - Adds, removes, or shows elements on the Scam list.',
    moderator: true,
    async execute(message, args) {

        if (DataStorage.storage.scamfilter == undefined) DataStorage.storage.scamfilter = [];

        const domain = args[0];

        if (!domain) {
            const scamdomains = '`' + (DataStorage.storage.scamfilter.toString()).replaceAll(',', '`\n`') + '`';
            message.channel.send(scamdomains == '``' ? 'No domains are in the scam list yet.' : scamdomains);
        }
        else if (DataStorage.storage.scamfilter.includes(domain)) {
            DataStorage.storage.scamfilter = DataStorage.storage.scamfilter.filter(x => x != domain);
            message.channel.send('Removed `' + domain + '` from the scam list.');
        }
        else {
            DataStorage.storage.scamfilter.push(domain);
            message.channel.send('Added `' + domain + '` to the scam list.');
        }
        DataStorage.save();
    },
};
