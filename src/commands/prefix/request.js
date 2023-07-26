const { startDialog, canStartDialog } = require('../../dialogs/startDialog');
const utility = require('../../util/utility');
const DataStorage = require('../../util/dataStorage');
const Discord = require('discord.js');

// Command to start a request instead of clicking the new request button
module.exports = {
    name: 'request',
    description: 'Create new avatar request.',
    /**
     * 
     * @param {import('discord.js').Message} message 
     */
    async execute(message) {
        message.reply({
            embeds: [new Discord.MessageEmbed()
                .setTitle('Requests are closed.')
                .setDescription('We regret to inform you that the option to create requests is no longer available. However, if you wish to commission someone, kindly do so in the designated channel, <#1076400440465432676>. Thank you for your understanding.')
                .setColor('a53b3b'),
            ]
        });
        // if (!DataStorage.storage.people) DataStorage.storage.people = {};
        // if (DataStorage.storage.people[message.author.id]?.requestban) return message.author.send(utility.buildEmbed('Sorry, you can\'t create a request at the moment.'));

        // if (canStartDialog(message.client, message.author)) {
        //     await message.author.send(utility.buildEmbed('New Avatar Request', 'We will now fill in the details of the request. Take your time to read the descriptions to ensure to make a high quality request. Low quality ones might get deleted by a moderator. You can type "cancel" at any point if you make a mistake.'));
        //     startDialog(message.client, message.author, 'createAvatarRequest');
        //     message.reply(utility.buildEmbed('I have sent you a DM.'));
        // }
        // else {
        //     message.reply(utility.buildEmbed('', 'Please finish the current dialog first.'));
        // }
    },
};
