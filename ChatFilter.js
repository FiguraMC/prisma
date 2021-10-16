const DataStorage = require('./DataStorage');

module.exports.scam = function (text) {
    if (DataStorage.storage.scamfilter == undefined) DataStorage.storage.scamfilter = [];
    for (const element of DataStorage.storage.scamfilter) {
        if (text?.includes(element)) {
            return true;
        }
    }
    return false;
}

module.exports.nsfw = function (text) {
    if (DataStorage.storage.nsfwfilter == undefined) DataStorage.storage.nsfwfilter = [];
    for (const element of DataStorage.storage.nsfwfilter) {
        if (text?.includes(element)) {
            return true;
        }
    }
    return false;
}