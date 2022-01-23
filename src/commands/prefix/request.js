const { startDialog, canStartDialog } = require('../../dialogs/startDialog');
const utility = require('../../util/utility');
const DataStorage = require('../../util/dataStorage');

module.exports = {
    name: 'request',
    usage: '`?request` - Create new avatar request.',
    async execute(message) {
        if (DataStorage.storage.people[message.author.id]?.requestban) return message.author.send(utility.buildEmbed('Sorry, you can\'t create a request at the moment.'));

        if (canStartDialog(message.client, message.author)) {
            await message.author.send(utility.buildEmbed('New Avatar Request', 'We will now fill in the details of the request. Take your time to read the descriptions to ensure to make a high quality request. Low quality ones might get deleted by a moderator. You can type "cancel" at any point if you make a mistake.'));
            startDialog(message.client, message.author, 'createAvatarRequest');
            message.reply(utility.buildEmbed('I have sent you a DM.'));
        }
        else {
            message.reply(utility.buildEmbed('', 'Please finish the current dialog first.'));
        }
    },
};
