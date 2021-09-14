const Discord = require('discord.js');
const Actions = require('./Actions');
const DataStorage = require('./DataStorage');
const TierRolesManager = require('./TierRolesManager');

const steps = new Map();

async function handle(client, message) {
    if (!steps.has(message.author.id)) {
        steps.set(message.author.id, {step:0});
    }
    const step = steps.get(message.author.id).step;

    const messageToArchive = Actions.get(message.author.id).data;
    const avatarRequest = DataStorage.storage.avatar_requests.find(x => x.message == messageToArchive.id);
    const thread = await messageToArchive.channel.threads.fetch(avatarRequest.thread).catch(console.error);

    if (step == 0) {
        if (message.content.toLowerCase() == 'abort') {
            message.author.send({embeds:[new Discord.MessageEmbed({description:'Action canceled.'})]}).catch(console.error);
            Actions.delete(message.author.id);
        }
        else {
            if (message.content.toLowerCase() == 'skip') {
                // Archive(client, messageToArchive, thread);
                // Actions.delete(message.author.id);
                steps.set(message.author.id, {step:1,client:client,thread:thread});
            }
            else {
                let attachment = message.attachments.values().next().value; // first attachment
                if (attachment == undefined) return message.author.send({embeds:[new Discord.MessageEmbed({description:'Please send either "skip", "abort" or a zip file.'})]}).catch(console.error);
                steps.set(message.author.id, {step:1,file:attachment.url,client:client,thread:thread});
            }
            let options = []
            Actions.get(message.author.id).gearReactionPeople.forEach((value,key,map) => {
                if (value.bot) return;
                options.push({
                    label:value.username,
                    value:value.id,
                });
            });
            
            if (options.length == 0) return StartArchiving(client, thread, steps.get(message.author.id).file, message.author);

            let requestFulfillerSelectMenu = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageSelectMenu()
                .setCustomId('request_fulfillers')
                .setPlaceholder('Nothing selected')
                .setMinValues(1)
                .addOptions(options)
            );
            message.author.send({embeds:[new Discord.MessageEmbed({description:'Who worked on this request? (2/2)'})], components:[requestFulfillerSelectMenu]}).catch(console.error);
        }
    }
    else if (step == 1) {
        if (message.content.toLowerCase() == 'skip') {
            message.author.send({embeds:[new Discord.MessageEmbed({description:'You can\'t skip this step.'})]}).catch(console.error);
        }
        else if (message.content.toLowerCase() == 'abort') {
            message.author.send({embeds:[new Discord.MessageEmbed({description:'Action canceled.'})]}).catch(console.error);
            Actions.delete(message.author.id);
            steps.delete(message.author.id);
        }
        else {
            message.author.send({embeds:[new Discord.MessageEmbed({description:'Please select a user in the list.'})]}).catch(console.error);
        }
    }
}

function onInteract(interaction) {
    if (interaction.customId == 'request_fulfillers') {
        if (steps.has(interaction.user.id)) {
            const step = steps.get(interaction.user.id)
            const stepNumber = steps.get(interaction.user.id).step;
            if (stepNumber == 1) {
                
                interaction.values.forEach(async userid => {
                    const messageToArchive = Actions.get(interaction.user.id).data;
                    TierRolesManager.levelup(await messageToArchive.guild.members.fetch(userid));
                });

                interaction.update({
                    embeds: [
                        new Discord.MessageEmbed({
                            description: 'Saved.'
                        })
                    ], components: []
                });
                
                StartArchiving(step.client, step.thread, step.file, interaction.user);
            }
        }
    }
}

function StartArchiving(client, thread, file, user) {
    if (file == undefined) {
        Archive(client, Actions.get(user.id).data, thread);
    }
    else {
        ArchiveWithFile(client, Actions.get(user.id).data, thread, file);
    }
    Actions.delete(user.id);
    steps.delete(user.id);

    user.send({
        embeds: [
            new Discord.MessageEmbed({
                title: 'Done!',
                description: 'The request is now archived!'
            })
        ]
    }).catch(console.error);
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

module.exports = { handle, onInteract }