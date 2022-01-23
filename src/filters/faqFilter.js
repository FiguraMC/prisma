const utility = require('../util/utility');
const DataStorage = require('../util/dataStorage');

module.exports.filter = async function (message) {
    if (process.env.HELP_CHANNELS.split(',').find(x => x == message.channel.id)) {
        // if sent in a help channel, check for FAQ keywords

        if (!DataStorage.storage.faq) DataStorage.storage.faq = [];

        DataStorage.storage.faq.forEach(element => {
            let includesAll = true;
            const keywords = element.q.toLowerCase().replaceAll('_', ' ').split('%');
            keywords.forEach(keyword => {
                includesAll &= message.content.toLowerCase().includes(keyword);
            });
            if (includesAll) {
                message.channel.send(utility.buildEmbed(element.a.replaceAll('_', ' ')));
            }
        });
    }
};
