const utility = require('../../util/utility');
const DataStorage = require('../../util/dataStorage');

module.exports = {
    name: 'faq',
    usage: '`?faq [question] [answer]` - Add or remove entry to or from the FAQ. Use `_` as spaces. Use `\\_` as underscores. Use `%` to split.',
    moderator: true,
    async execute(message, args) {

        if (!DataStorage.storage.faq) DataStorage.storage.faq = [];

        // No arguments, show faq
        if (args.length == 0) {
            let list = '';
            DataStorage.storage.faq.forEach(element => {
                list += `Q:\`${element.q}\`\nA:\`${element.a}\`\n\n`;
            });
            message.reply(utility.buildEmbed(list == '' ? 'FAQ is empty.' : list));
        }
        // One argument, remove question
        else if (args.length == 1) {
            if (DataStorage.storage.faq.find(x => x.q?.toLowerCase() == args[0].toLowerCase())) {
                DataStorage.storage.faq = DataStorage.storage.faq.filter(x => x.q?.toLowerCase() != args[0].toLowerCase());
                DataStorage.save();
                message.reply(`Removed \`${args[0]}\` from the FAQ.`);
            }
            else {
                message.reply(utility.buildEmbed(`Could not find \`${args[0]}\` in the FAQ.`));
            }
        }
        // Two arguments, add question and answer
        else if (args.length == 2) {
            DataStorage.storage.faq.push({ q: args[0], a: args[1] });
            DataStorage.save();
            message.reply(`Added \`${args[0]}\` to the FAQ.`);
        }
        else {
            return message.reply(utility.buildEmbed('Too many arguments.'));
        }
    },
};
