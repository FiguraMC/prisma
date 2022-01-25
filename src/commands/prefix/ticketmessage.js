const DataStorage = require('../../util/dataStorage');
const utility = require('../../util/utility');

// Command for forwarding messages between moderators and ticket creator
module.exports = {
    name: 'ticketmessage',
    usage: '`?ticketmessage <message>` - Forward message through your ticket.',
    dm: true,
    async execute(message, args) {
        try {
            if (message.channel.type == 'DM') {
                // check for authors open ticket (user->moderator)
                const ticket = DataStorage.storage.tickets?.find(x => x.author == message.author.id);
                if (!ticket) return message.reply('You do not have an open ticket, to create a new one use the /ticket command.');
                const ticketChannel = await message.client.channels.fetch(process.env.TICKET_CHANNEL);
                const thread = await ticketChannel.threads.fetch(ticket.thread);
                await thread.send(utility.buildEmbed('📨 Incoming message:', args.join(' ')));
                message.reply(utility.buildEmbed('Message forwarded. ✉️')).catch(console.error);
            }
            else {
                // check thread id for corresponding ticket (moderator->user)
                const ticket = DataStorage.storage.tickets?.find(x => x.thread == message.channel.id);
                if (!ticket) return message.reply('Could not find a ticket for this thread.');
                const ticketUser = await message.guild.members.fetch(ticket.author);
                await ticketUser.send(utility.buildEmbed('↩️ Moderator reply:', args.join(' ')));
                message.reply(utility.buildEmbed('Message forwarded. ✉️')).catch(console.error);
            }
        }
        catch (error) {
            console.error(error);
            message.reply(utility.buildEmbed('Couldn\'t forward message.'));
        }
    },
};
