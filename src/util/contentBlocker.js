const DataStorage = require('./dataStorage');
const got = require('got');

module.exports.thirdPartyScamList = [];

module.exports.scam = function (text) {
    if (DataStorage.storage.scamfilter == undefined) DataStorage.storage.scamfilter = [];
    for (const element of DataStorage.storage.scamfilter) {
        const regexp = new RegExp(`\\b${escapeRegExp(element)}\\b`, 'gmi');
        if (text?.match(regexp)) {
            return true;
        }
    }
    for (const element of module.exports.thirdPartyScamList) {
        const regexp = new RegExp(`\\b${escapeRegExp(element)}\\b`, 'gmi');
        if (text?.match(regexp)) {
            return true;
        }
    }
    return false;
};

module.exports.nsfw = function (text) {
    if (DataStorage.storage.nsfwfilter == undefined) DataStorage.storage.nsfwfilter = [];
    for (const element of DataStorage.storage.nsfwfilter) {
        const regexp = new RegExp('\\b' + escapeRegExp(element) + '\\b', 'gmi');
        if (text?.match(regexp)) {
            return true;
        }
    }
    return false;
};

module.exports.expandUrl = async function (url) {
    try {
        return (await got(url)).url;
    }
    catch (err) {
        return url;
    }
};

module.exports.expandMultipleUrls = async function (urls) {
    const expanded = [];
    if (urls) {
        for (const url of urls) {
            expanded.push(await module.exports.expandUrl(url));
        }
    }
    return expanded;
};

module.exports.fetchThirdPartyScamListAll = async function () {
    module.exports.thirdPartyScamList = JSON.parse((await got('https://phish.sinking.yachts/v2/all', { headers: { 'X-Identity': process.env.IDENTITY } })).body);
};

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

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
