const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const wiki = require('../../../storage/wiki.json');

module.exports = {
    name: 'wiki',
    usage: '`?wiki <search>` - Figura wiki command.',
    /**
     * 
     * @param {Discord.Message} message 
     * @param {String[]} args 
     */
    async execute(message, args) {
        const result = search(args);
        if (!result.length) {
            message.channel.send(`Could not find anything about "${args.join(' ')}".`);
        }
        else if (result.length > 20) {
            message.channel.send('Too many possible matches. Try adding another keyword.');
        }
        else {
            let string = '';
            for (const entry of result) {
                string += `\n${entry.name ?? 'No Name Provided'}\n\t<${entry.url ?? 'No Url Provided'}>`;
            }
            message.channel.send(`Possible matches found:${string}`);
        }
    },
};

/**
 *
 * @param {String[]} argKeywordArray
 */
function search(argKeywordArray) {
    // Prepare the given keywords for searching
    argKeywordArray = argKeywordArray.map(string => string.toLowerCase());
    const keywordSet = new Set();
    for (const keyword of argKeywordArray) {
        // Split the given keywords into seperate keywords if they contain "_", ".", or "-". The set object automatically filters duplicates.
        for (const w of keyword.split(/[_.-]+/g)) {
            keywordSet.add(w);
        }
    }
    // Find all entries that have the most amount of matching keywords
    let mostKeywords = [];
    let currentMaximum = 0;
    for (const entry of wiki) {
        let numKeywords = 0;
        for (const keyword of entry.keywords) {
            for (const word of keywordSet) {
                if (keyword == word) {
                    numKeywords++;
                }
            }
        }
        if (numKeywords == currentMaximum) {
            mostKeywords.push(entry);
        }
        // If an entry has more matches then all the previous entries, nuke the list and only accept entries with the same amount of matches
        else if (numKeywords > currentMaximum) {
            currentMaximum = numKeywords;
            mostKeywords = [entry];
        }
    }
    // If this variable has not changed then no entries have keywords that match the given keywords
    if (currentMaximum == 0) { return []; }
    // Filter out the entries with less priority
    let matches = [];
    let currentPriority = Number.MIN_SAFE_INTEGER;
    for (const entry of mostKeywords) {
        if ((entry.priority ?? 0) == currentPriority) {
            matches.push(entry);
        }
        else if ((entry.priority ?? 0) > currentPriority) {
            currentPriority = (entry.priority??0);
            matches = [entry];
        }
    }
    return matches;
}
