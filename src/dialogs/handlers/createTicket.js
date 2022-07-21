const utility = require('../../util/utility');
const DataStorage = require('../../util/dataStorage');
const closeTicketButton = require('../../components/closeTicketButton');
const ticketMenu = require('../../components/ticketMenu');

// Ticket creation dialog
module.exports = {
    name: 'createTicket',
    /**
     * 
     * @param {import('discord.js').Message} message 
     * @param {import('discord.js').TextChannel | import('discord.js').User} channel 
     * @param {*} dialog 
     */
    async handle(message, channel, dialog) {

        if (dialog.step != -1 && (message.content.toLowerCase() == 'cancel' || message.content.toLowerCase() == 'abort')) {
            channel.send(utility.buildEmbed('Action canceled.'));
            return true;
        }

        if (dialog.step == -1) {
            channel.send(utility.buildEmbed('Topic/Title (1/2)', 'Could be user report, suggestion, question... just tell us why you are opening this ticket.')).catch(console.error);
            dialog.step++;

            return false;
        }
        else if (dialog.step == 0) {
            if (message.content == '') {
                channel.send(utility.buildEmbed('Please specify a topic. You can\'t send an empty message.'));
                return false;
            }
            dialog.data.push(message.content);

            channel.send(utility.buildEmbed('Description (2/2)', 'Describe your problem. This message will be forwarded to our moderators.')).catch(console.error);
            dialog.step++;

            return false;
        }
        else if (dialog.step == 1) {
            if (message.content == '') {
                channel.send(utility.buildEmbed('Please provide a description. You can\'t send an empty message.'));
                return false;
            }
            dialog.data.push(message.content);

            const ticketChannel = await message.client.channels.fetch(process.env.TICKET_CHANNEL);
            if (!DataStorage.storage.ticketId) DataStorage.storage.ticketId = 0;
            try {
                const id = (DataStorage.storage.ticketId + 1).toString().padStart(4, '0');

                const msg = await ticketChannel.send({
                    embeds: [{
                        title: `✉️ Ticket ${id}`,
                        fields: [
                            { name: 'Topic:', value: dialog.data[0] },
                            { name: 'Description:', value: dialog.data[1] },
                        ],
                    }],
                    components: [closeTicketButton],
                });
                const thread = await msg.startThread({ name: `Ticket-${id}`, autoArchiveDuration: 'MAX' });

                await bringTicketMenuToTheBottom(message.client);

                if (!DataStorage.storage.tickets) DataStorage.storage.tickets = [];
                if (!DataStorage.storage.ticketsubscribers) DataStorage.storage.ticketsubscribers = [];
                DataStorage.storage.tickets.push({ author: message.author.id, thread: thread.id });
                DataStorage.storage.ticketId++;

                DataStorage.save('storage');

                DataStorage.storage.ticketsubscribers.forEach(async (subscriberID) => {
                    const user = await message.client.users.fetch(subscriberID);
                    if (user) {
                        thread.members.add(user).catch(console.error);
                    }
                });

                channel.send(utility.buildEmbed('✉️ Ticket sent!', 'A moderator will check it out shortly. You might get a reply here if more information is required. If you want to forward an additional message to your ticket for moderators to see, you can DM the command `?ticketmessage <message>` which will send that message to us.'));

                return true;
            }
            catch (error) {
                console.error(error);
                channel.send(utility.buildEmbed('ERROR', 'Could not create ticket, please contact a moderator or try again.'));
            }

            return true;
        }
    },
    async handleInteraction() {
        return false;
    },
};

/**
 * Gets the ticket menu from datastorage and puts its at the bottom of the ticket channel
 * @param {import('discord.js').Client} client 
 */
async function bringTicketMenuToTheBottom(client) {
    try {
        const oldMenuId = DataStorage.storage.ticket_menu;
        const channel = await client.channels.fetch(process.env.TICKET_CHANNEL);
        const newMenu = await channel.send({
            content: '\u200b',
            embeds: [{
                title: 'Ticket notifications.',
                description: '<@' + DataStorage.storage.ticketsubscribers?.join('>\n<@') + '>',
            }],
            components: [ticketMenu],
        });
        DataStorage.storage.ticket_menu = newMenu.id;
        if (oldMenuId) {
            const oldMenu = await channel.messages.fetch(oldMenuId);
            oldMenu.delete().catch(console.error);
        }
    }
    catch (error) {
        console.error(error);
    }
}
