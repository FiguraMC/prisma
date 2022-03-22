const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const utility = require('../../util/utility');
const DataStorage = require('../../util/dataStorage');

module.exports = {
    name: 'faq',
    usage: '`?faq [question] [answer]` - Add or remove entry to or from the FAQ. Space: `_`, Underscore: `\\_`, Code: `´` (forwardtick!), Split: `%`.',
    moderator: true,
    helper: true,
    /**
     * 
     * @param {Discord.Message} message 
     * @param {String[]} args 
     */
    async execute(message, args) {

        if (!DataStorage.storage.faq) DataStorage.storage.faq = new Map();

        // No arguments, show faq
        if (args.length == 0) {
            let length = 0;
            const lists = [''];
            DataStorage.storage.faq.forEach((value, key, map) => { // eslint-disable-line no-unused-vars
                const line = `Q:\`${key}\`\nA:\`${value}\`\n\n`;
                length += line.length;
                if (length > 4000) {
                    lists.push('');
                    length = 0;
                }
                lists[lists.length - 1] += line;
            });
            for (const list of lists) {
                message.reply(utility.buildEmbed(list == '' ? 'FAQ is empty.' : list));
            }
        }
        // One argument, remove question
        else if (args.length == 1) {
            if (DataStorage.storage.faq.has(args[0].toLowerCase())) {
                DataStorage.storage.faq.delete(args[0].toLowerCase());
                DataStorage.save();
                message.reply(`Removed \`${args[0]}\` from the FAQ.`);
            }
            else {
                message.reply(utility.buildEmbed(`Could not find \`${args[0]}\` in the FAQ.`));
            }
        }
        // Two arguments, add question and answer (or overwrite existing)
        else if (args.length == 2) {
            DataStorage.storage.faq.set(args[0].toLowerCase(), args[1]);
            DataStorage.save();
            message.reply(`Added \`${args[0]}\` to the FAQ.`);
        }
        else {
            return message.reply(utility.buildEmbed('Too many arguments.'));
        }
    },
};
