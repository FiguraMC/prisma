const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const utility = require('../../util/utility');
const workersSelectMenu = require('../../components/workersSelectMenu');
const DataStorage = require('../../util/dataStorage');
const requestTierRoles = require('../../util/requestTierRoles');

// Dialog for archiving an avatar request
module.exports = {
    name: 'archiveAvatarRequest',
    /**
     * 
     * @param {Discord.Message} message 
     * @param {Discord.TextChannel | Discord.User} channel 
     * @param {*} dialog 
     */
    async handle(message, channel, dialog) {

        if (dialog.step != -1 && (message.content.toLowerCase() == 'cancel' || message.content.toLowerCase() == 'abort')) {
            channel.send(utility.buildEmbed('Action canceled.'));
            return true;
        }

        if (dialog.step == -1) {
            channel.send(utility.buildEmbed('Request Files (1/2)', 'You can now send the finished request as a zip file, to attach it to the archive. If you don\'t want that, just type "skip".', [])).catch(console.error);
            dialog.step++;

            return false;
        }
        else if (dialog.step == 0) {
            if (message.content.toLowerCase() == 'skip') {
                dialog.data.push(undefined);
            }
            else {
                const attachment = message.attachments.values().next().value; // first attachment

                if (!attachment) {
                    channel.send(utility.buildEmbed('Please send either "skip", "cancel" or a zip file.')).catch(console.error);
                    return false;
                }

                dialog.data.push(attachment.url);
            }

            dialog.step++;

            // people who reacted with the gear emoji get added to a select menu
            const options = [];
            dialog.extras.workers.forEach(worker => {
                if (worker.bot) return;
                options.push({ label: worker.username, value: worker.id });
            });
            if (options.length == 0) {
                dialog.data.push(undefined);
                const archiveMessage = await archive(dialog, channel, message.client);
                notify(dialog.extras.lurkers, archiveMessage);
                return true;
            }
            workersSelectMenu.components[0].setOptions([]);
            workersSelectMenu.components[0].addOptions(options);
            channel.send(utility.buildEmbed('Who worked on this request? (2/2)', '', [workersSelectMenu])).catch(console.error);

            return false;
        }
        else if (dialog.step == 1) {
            channel.send(utility.buildEmbed('Please select a user in the list.')).catch(console.error);
            return false;
        }
    },
    /**
     * 
     * @param {Discord.Interaction} interaction 
     * @param {*} dialog 
     */
    async handleInteraction(interaction, dialog) {

        if (dialog.step == 1 && interaction.customId == 'request_workers' && interaction.isSelectMenu()) {

            interaction.update(utility.buildEmbed('Saved.')).catch(console.error);
            dialog.data.push(interaction.values);

            const archiveMessage = await archive(dialog, interaction.user, interaction.client);
            notify(dialog.extras.lurkers, archiveMessage);

            return true;
        }
    },
};

/**
 * Archives the request
 * Also levels up the workers
 * @param {*} dialog 
 * @param {Discord.TextChannel | Discord.User} channel 
 * @param {Discord.Client} client 
 */
async function archive(dialog, channel, client) {

    const files = [];
    if (dialog.data[0]) {
        dialog.extras.embed.color = '77b255'; // green
        files.push(dialog.data[0]);
    }
    else {
        dialog.extras.embed.color = '202225'; // gray
    }

    if (dialog.data[1]) {
        let workers = '';
        for (const worker of dialog.data[1]) {
            workers += `<@${worker}>\n`;
            try {
                requestTierRoles.levelup(await dialog.extras.requestMessage.guild.members.fetch(worker));
            }
            catch (error) { console.error(error); }
        }
        dialog.extras.embed.addField('Made by', workers, false);
    }

    const archiveChannel = await client.channels.fetch(process.env.REQUESTS_ARCHIVE_CHANNEL).catch(console.error);
    const archiveMessage = await archiveChannel.send({ embeds: [dialog.extras.embed], files: files }).catch(console.error);

    const avatarRequest = DataStorage.storage.avatar_requests.find(x => x.message == dialog.extras.requestMessage.id);
    const thread = await dialog.extras.requestMessage.channel.threads.fetch(avatarRequest.thread).catch(console.error);

    thread.setArchived(true).catch(console.error);
    dialog.extras.requestMessage.delete().catch(console.error);

    DataStorage.deleteFromArray(DataStorage.storage.avatar_requests, avatarRequest);
    DataStorage.save('storage');

    channel.send(utility.buildEmbed('Done!', 'The request is now archived!', [])).catch(console.error);

    return archiveMessage;
}

/**
 * Sends DMs to the users to tell
 * them that the request is finished
 * @param {Discord.Collection<String,Discord.User>} users 
 * @param {Discord.Message} message 
 */
async function notify(users, message) {
    users.forEach(user => {
        if (user.id != message.client.id) user.send(utility.buildEmbed('Request Notification!', `A request you have been watching has been completed! Hooray!\n[${message?.embeds[0]?.title}](${message?.url})`)).catch(console.error);
    });
}
