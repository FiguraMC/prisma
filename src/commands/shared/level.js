const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const DataStorage = require('../../util/dataStorage');

/**
 * Shared command for prefix as well as slash command
 * @param {Discord.User} user 
 */
module.exports = function (user) {
    if (!DataStorage.storage.people) {
        DataStorage.storage.people = {};
    }
    if (DataStorage.storage.people[user.id] == undefined) {
        return 'This user hasn\'t done any requests yet.';
    }
    const person = DataStorage.storage.people[user.id];
    if (person == undefined || person.level == undefined) {
        return user.tag + ' has not completed any requests yet.';
    }
    else {
        return user.tag + ' has completed ' + person.level + ' requests.';
    }
};
