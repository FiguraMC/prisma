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
    exports.storage = JSON.parse(fs.readFileSync(storageFilePath).toString(), reviver);
    save();
}

/**
 * Save data storage to file
 */
function save() {
    fs.mkdirSync(storageDirectoryPath, { recursive: true });
    fs.writeFileSync(storageFilePath, JSON.stringify(exports.storage, replacer));
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

/**
 * Replacer Function to support storing Map objects
 */
function replacer(key, value) {
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()),
        };
    }
    else {
        return value;
    }
}

/**
 * Reviver Function to support loading Map objects
 */
function reviver(key, value) {
    if (typeof value == 'object' && value != null) {
        if (value.dataType == 'Map') {
            return new Map(value.value);
        }
    }
    return value;
}

exports.load = load;
exports.save = save;
exports.deleteFromArray = deleteFromArray;
