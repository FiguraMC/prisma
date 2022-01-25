const DataStorage = require('../util/dataStorage');
const roles = process.env.REQUEST_TIER_ROLES.split(',');

// Increases level of a member by 1
function levelup(member) {
    if (!DataStorage.storage.people) DataStorage.storage.people = {};

    if (!DataStorage.storage.people[member.id]?.level) {
        DataStorage.storage.people[member.id] = { level: 1 };
    }
    else {
        DataStorage.storage.people[member.user.id].level++;
    }
    DataStorage.save();
    updateroles(member, DataStorage.storage.people[member.user.id].level);
}

// Sets level of a member to specified amount
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
    DataStorage.save();
    updateroles(member, level);
}

// Uses level to determine Request Tier Role and updates the members roles
async function updateroles(member, level) {
    const tier = parseInt(level / 10);
    let tierindex = tier - 1;
    if (tierindex > roles.length - 1) {
        tierindex = roles.length - 1;
    }
    await member.roles.remove(roles.filter(role => role != roles[tierindex])).catch(console.error);
    if (tierindex < 0) return;
    await member.roles.add(roles[tierindex]).catch(console.error);
}

module.exports = { levelset, levelup };
