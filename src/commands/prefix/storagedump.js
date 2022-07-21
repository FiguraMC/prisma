const Discord = require('discord.js');
const DataStorage = require('../../util/dataStorage');

module.exports = {
    name: 'storagedump',
    description: 'Create storage dump.',
    moderator: true,
    /**
     * 
     * @param {import('discord.js').Message} message 
     */
    async execute(message) {
        const dump = DataStorage.createDump();
        const files = [];
        dump.forEach((value, key) => {
            files.push(
                new Discord.MessageAttachment(
                    Buffer.from(value),
                    key + '.json',
                ),
            );
        });
        message.author.send({ files: files }).catch();
    },
};
