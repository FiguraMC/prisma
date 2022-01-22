const { startDialog, canStartDialog } = require('../../dialogs/startDialog');
const utility = require('../../util/utility');

module.exports = {
    name: 'request',
    usage: '`?request` - Create new avatar request.',
    async execute(message) {
        if (canStartDialog(message.client, message.author)) {
            await message.author.send(utility.buildEmbed('New Avatar Request', 'We will now fill in the details of the request. Take your time to read the descriptions to ensure to make a high quality request. Low quality ones might get deleted by a moderator. You can type "abort" at any point if you make a mistake.'));
            startDialog(message.client, message.author, 'createAvatarRequest');
        }
        else {
            message.channel.send(utility.buildEmbed('', 'Please finish the current dialog first.'));
        }
    },
};
