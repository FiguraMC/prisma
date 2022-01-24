const wiki = require('./wiki.json');

module.exports = {
    name: 'wiki',
    usage: '`?wiki <search>` - Outdated wiki command.',
    async execute(message, args) {
        const result = search(args.join(' '));
        if (result) {
            message.channel.send('<' + result + '>');
        }
        else {
            message.channel.send(`Could not find anything about "${args.join(' ')}".`);
        }
    },
};

function search(s) {
    // exact matches
    for (const entry of wiki) {
        for (const key of entry.keys) {
            for (const word of key.split('.')) {
                if (word == s) {
                    return entry.value;
                }
            }
        }
    }
    // search word is a substring of key
    for (const entry of wiki) {
        for (const key of entry.keys) {
            if (key.includes(s)) {
                return entry.value;
            }
        }
    }
    // key is a substring of search word
    for (const entry of wiki) {
        for (const key of entry.keys) {
            if (s.includes(key)) {
                return entry.value;
            }
        }
    }
    return null;
}
