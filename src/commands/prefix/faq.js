const utility = require('../../util/utility');
const DataStorage = require('../../util/dataStorage');
const Argument = require('../parser/argument');
const MessageAttachment = require('discord.js').MessageAttachment;

module.exports = {
    name: 'faq',
    description: 'Add or remove entry to or from the FAQ.',
    longDescription: 'Add or remove entry to or from the FAQ.\nCode: `´` (forwardtick!), Split: `%`.',
    moderator: true,
    helper: true,
    overloads: [
        {
            arguments: [],
            /**
             * @param {import('discord.js').Message} message
             */
            execute: async (message) => {
                // Show faq
                if (!DataStorage.storage.faq) DataStorage.storage.faq = new Map();

                const simplifiedFaq = [];

                DataStorage.storage.faq.forEach((value, key, map) => { // eslint-disable-line no-unused-vars
                    simplifiedFaq.push({
                        Q: key,
                        A: value,
                    });
                });
                
                message.reply({ files: [new MessageAttachment(Buffer.from(JSON.stringify(simplifiedFaq, null, 2)), 'faq.json')] });
            },
        },
        {
            arguments: [new Argument('question', 'string')],
            /**
             * @param {import('discord.js').Message} message
             * @param {import('../parser/argumentContainer')} args
             */
            execute: async (message, args) => {
                // Remove question
                if (!DataStorage.storage.faq) DataStorage.storage.faq = new Map();

                if (DataStorage.storage.faq.has(args.getValue('question').toLowerCase())) {
                    DataStorage.storage.faq.delete(args.getValue('question').toLowerCase());
                    DataStorage.save('storage');
                    message.reply(`Removed \`${args.getValue('question')}\` from the FAQ.`);
                }
                else {
                    message.reply(utility.buildEmbed(`Could not find \`${args.getValue('question')}\` in the FAQ.`));
                }
            },
        },
        {
            arguments: [new Argument('question', 'string'), new Argument('answer', 'string')],
            /**
             * @param {import('discord.js').Message} message
             * @param {import('../parser/argumentContainer')} args
             */
            execute: async (message, args) => {
                // Add question and answer or change an answer
                if (!DataStorage.storage.faq) DataStorage.storage.faq = new Map();

                DataStorage.storage.faq.set(args.getValue('question').toLowerCase(), args.getValue('answer'));
                DataStorage.save('storage');
                message.reply(`Added \`${args.getValue('question')}\` to the FAQ.`);
            },
        },
    ],
};
