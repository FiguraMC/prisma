const Discord = require('discord.js');
const DataStorage = require('../../util/dataStorage');

module.exports = {
    name: 'storagedump',
    usage: '`?storagedump` - Create storage dump.',
    moderator: true,
    /**
     * 
     * @param {Discord.Message} message 
     */
    async execute(message) {
        message.author.send({
            files: [
                new Discord.MessageAttachment(
                    Buffer.from(JSON.stringify(DataStorage.storage)),
                    'storage.json',
                ),
            ],
        }).catch();
    },
};
