const fs = require('fs');
const path = require('path');
const storageFilePath = path.join(__dirname,'..','storage.json');

exports.storage = {avatar_requests:[]}

function load() {
    if (!fs.existsSync(storageFilePath)) return save();
    exports.storage = JSON.parse(fs.readFileSync(storageFilePath).toString());

    if (exports.storage.avatar_requests == undefined) {
        exports.storage.avatar_requests = [];
    }
    if (exports.storage.people == undefined) {
        exports.storage.people = {};
    }
    save();
}

function save() {
    fs.writeFileSync(storageFilePath, JSON.stringify(exports.storage));
}

function deleteFromArray(array, element) {
    const index = array.indexOf(element);
    if (index > -1) {
        array.splice(index, 1);
    }
}

exports.load = load
exports.save = save
exports.deleteFromArray = deleteFromArray