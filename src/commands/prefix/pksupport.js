const DataStorage = require('../../util/dataStorage');

module.exports = {
    name: 'pksupport',
    description: 'Toggle PluralKit support for commands. Note that replies will be slower when turned on to wait for pluralkit.',
    allowInOtherGuilds: true,
    /**
     * 
     * @param {import('discord.js').Message} message 
     */
    async execute(message) {
        DataStorage.pksettings.userlist = DataStorage.pksettings.userlist || new Set();
        if (DataStorage.pksettings.userlist.has(message.author.id)) {
            DataStorage.pksettings.userlist.delete(message.author.id);
            message.reply('PluralKit support **disabled**.');
        }
        else {
            DataStorage.pksettings.userlist.add(message.author.id);
            message.reply('PluralKit support **enabled**.');
        }
        DataStorage.save('pksettings');
    },
};
