const utility = require('../../util/utility');
const DataStorage = require('../../util/dataStorage');

// Simple dialog just for confirming if the user really wants to delete the request
module.exports = {
    name: 'deleteAvatarRequest',
    async handle(message, channel, dialog) {

        if (dialog.step != -1 && (message.content.toLowerCase() == 'cancel' || message.content.toLowerCase() == 'abort')) {
            channel.send(utility.buildEmbed('Action canceled.'));
            return true;
        }

        if (dialog.step == -1) {
            channel.send(utility.buildEmbed('Request Deletion', 'Are you sure you want to delete this request? Type "confirm" to delete, or "cancel" to cancel.')).catch(console.error);
            dialog.step++;

            return false;
        }
        else if (dialog.step == 0) {
            if (message.content.toLowerCase() == 'confirm') {

                for (const e of dialog.extras.requestMessage.embeds) e.setColor('f24671'); // pink

                message.client.channels.fetch(process.env.LOG_CHANNEL)
                    .then(c => c.send({ content: 'Request deleted by user:', embeds: dialog.extras.requestMessage.embeds }).catch(console.error))
                    .catch(console.error);

                const avatarRequest = DataStorage.storage.avatar_requests.find(x => x.message == dialog.extras.requestMessage.id);
                const thread = await dialog.extras.requestMessage.channel.threads.fetch(avatarRequest.thread).catch(console.error);

                thread.setArchived(true).catch(console.error);
                dialog.extras.requestMessage.delete().catch(console.error);

                DataStorage.deleteFromArray(DataStorage.storage.avatar_requests, avatarRequest);
                DataStorage.save();

                channel.send(utility.buildEmbed('Request deleted.'));

                return true;
            }
            else {

                channel.send(utility.buildEmbed('Please send either "confirm" or "cancel".'));

                return false;
            }
        }
    },
    async handleInteraction() {
        return false;
    },
};
