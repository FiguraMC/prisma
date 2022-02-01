const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const DataStorage = require('../../util/dataStorage');

/**
 * Shared command for prefix as well as slash command
 * @param {Discord.GuildMember} member 
 */
module.exports = function (member) {
    if (!DataStorage.storage.people) {
        DataStorage.storage.people = {};
    }
    if (DataStorage.storage.people[member.id] == undefined) {
        return 'This user hasn\'t done any requests yet.';
    }
    const person = DataStorage.storage.people[member.id];
    if (person == undefined || person.level == undefined) {
        return member.user.tag + ' has not completed any requests yet.';
    }
    else {
        return member.user.tag + ' has completed ' + person.level + ' requests.';
    }
};
