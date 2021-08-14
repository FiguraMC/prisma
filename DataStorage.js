const fs = require('fs');

exports.storage = {avatar_requests:[]}

function load() {
    if (!fs.existsSync('./storage.json')) return save();
    exports.storage = JSON.parse(fs.readFileSync('./storage.json').toString());
}

function save() {
    fs.writeFileSync('./storage.json', JSON.stringify(exports.storage));
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