const DataStorage = require('../util/dataStorage');
const roles = process.env.REQUEST_TIER_ROLES.split(',');

/**
 * Increases level of a member by 1
 * @param {import('discord.js').GuildMember} member 
 */
function levelup(member) {
    if (!DataStorage.storage.people) DataStorage.storage.people = {};

    if (!DataStorage.storage.people[member.id]?.level) {
        DataStorage.storage.people[member.id] = { level: 1 };
    }
    else {
        DataStorage.storage.people[member.user.id].level++;
    }
    DataStorage.save('storage');
    updateroles(member, DataStorage.storage.people[member.user.id].level);
}

/**
 * Sets level of a member to specified amount
 * @param {import('discord.js').GuildMember} member 
 * @param {Number} level 
 */
function levelset(member, level) {
    if (!DataStorage.storage.people) {
        DataStorage.storage.people = {};
    }
    if (DataStorage.storage.people[member.user.id] == undefined) {
        DataStorage.storage.people[member.user.id] = { level: level };
    }
    else {
        DataStorage.storage.people[member.user.id].level = level;
    }
    DataStorage.save('storage');
    updateroles(member, level);
}

/**
 * Uses level to determine Request Tier Role and updates the members roles
 * @param {import('discord.js').GuildMember} member 
 * @param {Number} level 
 * @returns 
 */
async function updateroles(member, level) {
    const tier = parseInt(level / 10);
    let tierindex = tier - 1;
    if (tierindex > roles.length - 1) {
        tierindex = roles.length - 1;
    }
    await member.roles.remove(roles.filter(role => role != roles[tierindex])).catch(console.ignore);
    if (tierindex < 0) return;
    await member.roles.add(roles[tierindex]).catch(console.ignore);
}

module.exports = { levelset, levelup };
