const DataStorage = require('./DataStorage');

async function RequestDeletion(client) {
    const channel = await client.channels.fetch(process.env.REQUESTS_CHANNEL);
    DataStorage.storage.avatar_requests.forEach(async element => {
        const msg = await channel.messages.fetch(element.message).catch(console.error);
        if (!element.locked) {
            if (element.timestamp + 1000*60*60*24*7 < Date.now()) { // older than 7 days
                // delete message
                const user = await client.users.fetch(element.user).catch(console.error);
                if (msg != undefined) {
                    if (user != undefined) user.send({content: 'Your request has been deleted. We delete the ones older than 1 week to keep the channel clean.\nYour request:', embeds: msg.embeds}).catch(console.error);
                    for (let e of msg.embeds) e.setColor('f24671');
                    client.channels.fetch(process.env.LOG_CHANNEL)
                        .then(channel => channel.send({content: 'Request automatically deleted:', embeds: msg.embeds}).catch(console.error)).catch(console.error);
                    msg.delete().catch(console.error);
                };
                // delete from storage
                DataStorage.deleteFromArray(DataStorage.storage.avatar_requests, element);
                DataStorage.save();
            }
            else {
                let edit = false;
                if (element.timestamp + 1000*60*60*24 < Date.now()) {
                    msg.embeds.forEach(embed => {
                        if (embed.color != 2105893) { // gray but as int
                            edit = true;
                            embed.color = '202225'; // older than 24h gray
                        }
                    });
                }
                else {
                    msg.embeds.forEach(embed => {
                        if (embed.color != 2796791) { // blue but as int
                            edit = true;
                            embed.color = '2aacf7'; // newer than 24h blue
                        }
                    });
                }
                if (edit) msg.edit({embeds:msg.embeds}).catch(console.error);
            }
        }
    });
}

module.exports = RequestDeletion