const DataStorage = require('./dataStorage');
const utility = require('./utility');
const got = require('got');

module.exports.thirdPartyScamList = [];

/**
 * Check text for scam domains
 * @param {String} text 
 * @returns {boolean} True if scam domain was found
 */
module.exports.scam = function (text) {
    if (DataStorage.storage.scamfilter == undefined) DataStorage.storage.scamfilter = [];
    // Check for local scam domain list
    for (const element of DataStorage.storage.scamfilter) {
        const regexp = new RegExp(`\\b${utility.escapeRegExp(element)}\\b`, 'gmi');
        if (text?.match(regexp)) {
            return true;
        }
    }
    // Check for third party scam list
    for (const element of module.exports.thirdPartyScamList) {
        const regexp = new RegExp(`\\b${utility.escapeRegExp(element)}\\b`, 'gmi');
        if (text?.match(regexp)) {
            return true;
        }
    }
    return false;
};

/**
 * Check text for nsfw domains/keywords
 * This only uses the local list
 * @param {String} text 
 * @returns {boolean} True if nsfw domain/keyword was found
 */
module.exports.nsfw = function (text) {
    if (DataStorage.storage.nsfwfilter == undefined) DataStorage.storage.nsfwfilter = [];
    for (const element of DataStorage.storage.nsfwfilter) {
        const regexp = new RegExp('\\b' + utility.escapeRegExp(element) + '\\b', 'gmi');
        if (text?.match(regexp)) {
            return true;
        }
    }
    return false;
};

/**
 * Checks if a message contains an attempt to mention @ everyone and has "free nitro" in it.
 * @param {import('discord.js').Message} message 
 * @returns {boolean} True if it matches
 */
module.exports.matchesGenericScamMessage = function (message) {
    const content = message.content.toLowerCase();
    const urls = utility.getURLs(content);
    if (content.includes('@everyone') && ((content.includes('free') && content.includes('nitro')) || urls != null)) {
        if (!message.member.permissions.has('MENTION_EVERYONE')) {
            return true;
        }
    }
    return false;
};

/**
 * Follow the shortened URL redirects and return the expanded URL
 * Returns the unshortened URL or the same URL if it couldnt unshorten
 * @param {String} url 
 * @returns {String} Expanded URL, or same URL if couldn't expand
 */
module.exports.expandUrl = async function (url) {
    try {
        return (await got(url)).url;
    }
    catch (err) {
        return url;
    }
};

/**
 * Unshortens multiple URLs
 * @param {String[]} urls 
 * @returns {String[]} Array of expanded URLs
 * @see {@link module.exports.expandUrl expandUrl}
 */
module.exports.expandMultipleUrls = async function (urls) {
    const expanded = [];
    if (urls) {
        for (const url of urls) {
            expanded.push(await module.exports.expandUrl(url));
        }
    }
    return expanded;
};

/**
 * Fetch all scam domains from phishing API
 */
module.exports.fetchThirdPartyScamListAll = async function () {
    module.exports.thirdPartyScamList = JSON.parse((await got('https://phish.sinking.yachts/v2/all', { headers: { 'X-Identity': process.env.IDENTITY } })).body);
};

/**
 * Fetch recent scam domains from phishing API
 * Adds only the new entries to the list
 * @param {Number} seconds 
 */
module.exports.fetchThirdPartyScamListRecent = async function (seconds) {
    const recent = JSON.parse((await got('https://phish.sinking.yachts/v2/recent/' + seconds, { headers: { 'X-Identity': process.env.IDENTITY } })).body);

    for (const entry of recent) {
        if (entry.type == 'add') {
            for (const domain of entry.domains) {
                module.exports.thirdPartyScamList.push(domain);
            }
        }
        else if (entry.type == 'delete') {
            for (const domain of entry.domains) {
                const index = module.exports.thirdPartyScamList.indexOf(domain);
                if (index > -1) {
                    module.exports.thirdPartyScamList.splice(index, 1);
                }
            }
        }
    }
};
