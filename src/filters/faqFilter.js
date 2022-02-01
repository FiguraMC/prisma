const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const utility = require('../util/utility');
const DataStorage = require('../util/dataStorage');

/**
 * 
 * @param {Discord.Message} message 
 */
module.exports.filter = async function (message) {
    if (process.env.HELP_CHANNELS.split(',').find(x => x == message.channel.id)) {
        // if sent in a help channel, check for FAQ keywords

        // this is basically a crappy pattern check thing
        // underscores are used as spaces so when adding a pattern using
        // a command is less pain to program, % character splits the
        // string and can therefore pretty much be called "any characters in between"

        if (!DataStorage.storage.faq) DataStorage.storage.faq = [];

        DataStorage.storage.faq.forEach(element => {
            let includesAll = true;
            const keywords = element.q.toLowerCase().replaceAll('_', ' ').replaceAll('\\ ', '_').split('%');
            keywords.forEach(keyword => {
                includesAll &= message.content.toLowerCase().includes(keyword);
            });
            // if all keywords are found in the message then send the corresponding answer
            if (includesAll) {
                message.channel.send(utility.buildEmbed(element.a.replaceAll('_', ' ').replaceAll('\\ ', '_')));
            }
        });
    }
};
