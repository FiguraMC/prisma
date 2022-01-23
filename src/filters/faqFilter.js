const utility = require('../util/utility');
const DataStorage = require('../util/dataStorage');

module.exports.filter = async function (message) {
    if (process.env.HELP_CHANNELS.split(',').find(x => x == message.channel.id)) {
        // if sent in a help channel, check for FAQ keywords

        if (!DataStorage.storage.faq) DataStorage.storage.faq = [];

        DataStorage.storage.faq.forEach(element => {
            if (message.content.toLowerCase().includes(element.q.toLowerCase().replaceAll('_', ' '))) {
                message.channel.send(utility.buildEmbed(element.a.replaceAll('_', ' ')));
            }
        });
    }
};
