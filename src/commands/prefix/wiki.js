const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const wiki = require('../../../storage/wiki.json');
const utility = require('../../util/utility');

module.exports = {
    name: 'wiki',
    usage: '`?wiki <search>` - Figura wiki command.',
    allowInOtherGuilds: true,
    /**
     * 
     * @param {Discord.Message} message 
     * @param {String[]} args 
     */
    async execute(message, args) {
        if (args.length == 0) {
            message.channel.send(utility.buildEmbed('Nothing was given as an argument.')).catch(console.error);
            return;
        }
        let result = search(args);
        if (result.length == 0) {
            message.channel.send(utility.buildEmbed(`Could not find anything about "${args.join(' ')}".`)).catch(console.error);
            return;
        }
        const max = 10;
        let missing = result.length - max;
        if (result.length > max) {
            result = result.slice(0, max);
        }
        let string = '';
        for (const entry of result) {
            const append = `\n[${entry.name ?? 'No Name Provided'}](${entry.url ?? 'No Url Provided'})`;
            if ((string + append).length < 3800) { // 4000 max, 200 to be save when adding missing note
                string += append;
            }
            else {
                missing++;
            }
        }
        if (missing > 0) {
            string += `\n...and ${missing} more.`;
        }
        message.channel.send(utility.buildEmbed(`Search results for "${args.join(' ')}"`, string));
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
            currentPriority = entry.priority ?? 0;
            matches = [entry];
        }
    }
    return matches;
}
