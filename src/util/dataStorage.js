const fs = require('fs');
const path = require('path');

const storageDirectoryPath = path.join(__dirname, '../..', 'storage');
const storageFilePath = path.join(storageDirectoryPath, 'storage.json');

// Used for permanent storage
exports.storage = {};

/**
 * Load data storage from file
 */
function load() {
    if (!fs.existsSync(storageFilePath)) return save();
    exports.storage = JSON.parse(fs.readFileSync(storageFilePath).toString());
    save();
}

/**
 * Save data storage to file
 */
function save() {
    fs.mkdirSync(storageDirectoryPath, { recursive: true });
    fs.writeFileSync(storageFilePath, JSON.stringify(exports.storage));
}

/**
 * Utility function to delete an element from an array
 * @param {*} array 
 * @param {*} element 
 */
function deleteFromArray(array, element) {
    const index = array.indexOf(element);
    if (index > -1) {
        array.splice(index, 1);
    }
}

exports.load = load;
exports.save = save;
exports.deleteFromArray = deleteFromArray;
