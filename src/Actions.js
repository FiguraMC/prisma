exports.actions = new Map();
exports.set = function(key, value) {
    if (!exports.actions.has(key)) {
        exports.actions.set(key, value);
        return true;
    }
    return false;
};
exports.get = function(key) {
    return exports.actions.get(key);
};
exports.has = function(key) {
    return exports.actions.has(key);
};
exports.delete = function(key) {
    return exports.actions.delete(key);
};