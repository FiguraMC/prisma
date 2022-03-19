const fs = require('fs');
const path = require('path');

const storageDirectoryPath = path.join(__dirname, '../..', 'storage');
const backupDirectoryPath = path.join(storageDirectoryPath, 'backups');
const file_old = path.join(storageDirectoryPath, 'storage.json');
const file = [path.join(storageDirectoryPath, 'storage0.json'), path.join(storageDirectoryPath, 'storage1.json')];

let flip = 0;

// Used for permanent storage
exports.storage = {};

/**
 * Load data storage from file.
 * Uses the newer one of the two files or,
 * if one is corrupted, the working one.
 */
function load() {
    fs.mkdirSync(storageDirectoryPath, { recursive: true });
    if (!fs.existsSync(file[0])) fs.writeFileSync(file[0], '{}');
    if (!fs.existsSync(file[1])) fs.writeFileSync(file[1], '{}');
    if (fs.existsSync(file_old)) {
        // Move old storage.json file over to the new storage0 and storage1 alternating system
        exports.storage = JSON.parse(fs.readFileSync(file_old).toString(), reviver);
        save();
        fs.unlinkSync(file_old);
        return;
    }
    // Attempt reading both files, treat as empty with timestamp 0 on error
    let st0;
    let st1;
    try {
        st0 = JSON.parse(fs.readFileSync(file[0]).toString(), reviver);
    }
    catch (error) {
        st0 = { timestamp: 0 };
    }
    try {
        st1 = JSON.parse(fs.readFileSync(file[1]).toString(), reviver);
    }
    catch (error) {
        st1 = { timestamp: 0 };
    }
    // Use the newer one of the two files
    if (st0.timestamp > st1.timestamp) {
        exports.storage = st0;
        flip = 1;
    }
    else {
        exports.storage = st1;
        flip = 0;
    }
}

/**
 * Save data storage to file.
 * Uses two files alternating between them in
 * case the process gets killed or the bot crashes
 * during the writing process.
 */
function save() {
    fs.mkdirSync(storageDirectoryPath, { recursive: true });
    exports.storage.timestamp = Date.now();
    fs.writeFileSync(file[flip], JSON.stringify(exports.storage, replacer));
    if (flip == 0) {
        flip = 1;
    }
    else {
        flip = 0;
    }
}

/**
 * Create a backup of the current data.
 */
function backup() {
    fs.mkdirSync(backupDirectoryPath, { recursive: true });
    exports.storage.timestamp = Date.now();
    const date = new Date();
    const options = { hour12: false, hour: 'numeric', minute: 'numeric', second: 'numeric' };
    fs.writeFileSync(path.join(backupDirectoryPath, date.toLocaleDateString('en-US', options).replace(/[ ,\\/:-]/g, '_') + '.json'), JSON.stringify(exports.storage, replacer));
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
exports.backup = backup;
exports.deleteFromArray = deleteFromArray;
