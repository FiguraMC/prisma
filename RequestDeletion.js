const DataStorage = require('./DataStorage');

async function RequestDeletion(client) {
    const channel = await client.channels.fetch(process.env.REQUESTS_CHANNEL);
    DataStorage.storage.avatar_requests.forEach(async element => {
        if (element.timestamp + 1000*60*60*24*7 < Date.now() && !element.locked) {
            // delete message
            const msg = await channel.messages.fetch(element.message).catch(console.error);
            const user = await client.users.fetch(element.user).catch(console.error);
            if (msg != undefined) {
                if (user != undefined) user.send({content: 'Your request has been deleted. We delete the ones older than 1 week to keep the channel clean.\nYour request:', embeds: msg.embeds}).catch(console.error);
                msg.delete().catch(console.error);
            };
            // delete from storage
            DataStorage.deleteFromArray(DataStorage.storage.avatar_requests, element);
            DataStorage.save();
        }
    });
}

module.exports = RequestDeletion