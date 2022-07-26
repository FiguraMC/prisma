const DataStorage = require('../util/dataStorage');

module.exports = {
    name: 'guildMemberRemove',
    /**
     * 
     * @param {import('discord.js').GuildMember} member 
     */
    async execute(member) {
        if (member.guild.id != process.env.MAIN_GUILD) return;
        
        const roles = member.roles.cache.filter(role => role.name != '@everyone').map(role => role.id);
        if (!DataStorage.rolescache.cache) DataStorage.rolescache.cache = new Map();
        DataStorage.rolescache.cache.set(member.id, roles);
        DataStorage.save('rolescache');
    },
};
