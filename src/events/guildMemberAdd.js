const DataStorage = require('../util/dataStorage');

module.exports = {
    name: 'guildMemberAdd',
    /**
     * 
     * @param {import('discord.js').GuildMember} member 
     */
    async execute(member) {
        if (member.guild.id != process.env.MAIN_GUILD) return;

        if (!DataStorage.rolescache.cache) DataStorage.rolescache.cache = new Map();
        const roles = DataStorage.rolescache.cache.get(member.id);
        if (!roles) return;
        for (const role of roles) {
            member.roles.add(role);
        }
        DataStorage.rolescache.cache.delete(member.id);
        DataStorage.save('rolescache');
    },
};
