const Discord = require('discord.js');
const Actions = require('./Actions');
const DataStorage = require('./DataStorage');

async function handle(client, message) {
    const messageToArchive = Actions.get(message.author.id).data;
    const avatarRequest = DataStorage.storage.avatar_requests.find(x => x.message == messageToArchive.id);
    const thread = await messageToArchive.channel.threads.fetch(avatarRequest.thread).catch(console.error);

    if (message.content.toLowerCase() == 'skip') {
        Archive(client, messageToArchive, thread);
        Actions.delete(message.author.id);
    }
    else if (message.content.toLowerCase() == 'abort') {
        message.author.send({embeds:[new Discord.MessageEmbed({description:'Action canceled.'})]}).catch(console.error);
        Actions.delete(message.author.id);
    }
    else {
        let attachment = message.attachments.values().next().value; // first attachment
        if (attachment != undefined) {
            ArchiveWithFile(client, Actions.get(message.author.id).data, thread, attachment.url);
            Actions.delete(message.author.id);
        }
        else {
            message.author.send({embeds:[new Discord.MessageEmbed({description:'Please send either "skip", "abort" or a zip file.'})]}).catch(console.error);
        }
    }
}

function Archive(client, message, thread) {
    message.embeds.forEach(embed => {
        embed.color = '202225'; // gray
    });
    client.channels.fetch(process.env.REQUESTS_ARCHIVE_CHANNEL)
        .then(channel => channel.send({embeds:message.embeds}).catch(console.error))
        .catch(console.error);
    message.delete().catch(console.error);
    thread.setArchived(true).catch(console.error);
}
function ArchiveWithFile(client, message, thread, file) {
    message.embeds.forEach(embed => {
        embed.color = '77b255'; // green
    });
    client.channels.fetch(process.env.REQUESTS_ARCHIVE_CHANNEL)
        .then(channel => channel.send({embeds:message.embeds, files:[file]}).catch(console.error))
        .catch(console.error);
    message.delete().catch(console.error);
    thread.setArchived(true).catch(console.error);
}

module.exports = { handle }