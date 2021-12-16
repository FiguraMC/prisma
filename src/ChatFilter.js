const DataStorage = require('./DataStorage');
const got = require('got');

module.exports.thirdPartyScamList = [];

module.exports.scam = function (text) {
    if (DataStorage.storage.scamfilter == undefined) DataStorage.storage.scamfilter = [];
    for (const element of DataStorage.storage.scamfilter) {
        let regexp = new RegExp('\\b'+escapeRegExp(element)+'\\b','gmi');
        if (text?.match(regexp)) {
            return true;
        }
    }
    for (const element of module.exports.thirdPartyScamList) {
        let regexp = new RegExp('\\b'+escapeRegExp(element)+'\\b','gmi');
        if (text?.match(regexp)) {
            return true;
        }
    }
    return false;
}

module.exports.nsfw = function (text) {
    if (DataStorage.storage.nsfwfilter == undefined) DataStorage.storage.nsfwfilter = [];
    for (const element of DataStorage.storage.nsfwfilter) {
        let regexp = new RegExp('\\b'+escapeRegExp(element)+'\\b','gmi');
        if (text?.match(regexp)) {
            return true;
        }
    }
    return false;
}

module.exports.expandUrl = function (url) {
    return new Promise(async (resolve) => {
        try {
            resolve((await got(url)).url);
        }
        catch(err) { resolve(url); }
    });
}

module.exports.expandMultipleUrls = function (urls) {
    return new Promise(async (resolve) => {
        expanded = [];
        if (urls) {
            for (const url of urls) {
                expanded.push(await module.exports.expandUrl(url));
            }
        }
        resolve(expanded);
    });
}

module.exports.fetchThirdPartyScamListAll = async function() {
    module.exports.thirdPartyScamList = JSON.parse((await got('https://phish.sinking.yachts/v2/all', {headers:{'X-Identity':'Blancworks Discord Bot'}})).body);
}

module.exports.fetchThirdPartyScamListRecent = async function(seconds) {
    let recent = JSON.parse((await got('https://phish.sinking.yachts/v2/recent/'+seconds, {headers:{'X-Identity':'Blancworks Discord Bot'}})).body);

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
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
