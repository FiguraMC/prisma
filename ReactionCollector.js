const DataStorage = require('./DataStorage');
const Actions = require('./Actions');
const ActionType = require('./ActionType');
const Discord = require('discord.js');

async function init(client) {
    const channel = await client.channels.fetch(process.env.REQUESTS_CHANNEL);
    DataStorage.storage.avatar_requests.forEach(async element => {
        const msg = await channel.messages.fetch(element.message).catch(console.error);
        if (msg == undefined) {
            // delete from storage
            DataStorage.deleteFromArray(DataStorage.storage.avatar_requests, element);
            DataStorage.save();
            return;
        };
        createCollector(msg, element);
    });
}

async function createCollector(msg, element) {
    collector = msg.createReactionCollector({ dispose: true });

    collector.on('collect', async (reaction, user) => {
        if (reaction.emoji.name == '❌' && user.id == element.user) { // only the author can delete, accept or edit
            // delete message
            msg.delete();
            // delete from storage
            DataStorage.deleteFromArray(DataStorage.storage.avatar_requests, element);
            DataStorage.save();
        }
        else if (reaction.emoji.name == '✅' && user.id == element.user) {
            if (Actions.set(user.id, {type:ActionType.ACCEPT_REQUEST, data:reaction.message})) {
                user.send({embeds:[new Discord.MessageEmbed({title:'Avatar request fullfilled!', description:'It will now be archived. If you want, you can now send the finished request as a zip file, to attach it to the archive. If you don\' want that, just type "skip".'})]}).catch(console.error);
            }
            else {
                reaction.message.reactions.cache.get('✅').users.remove(user.id);
            }
        }
        else if (reaction.emoji.name == '📝' && user.id == element.user) {
            if (Actions.set(user.id, {type:ActionType.EDIT_REQUEST, data:reaction.message})) {
                await user.send({embeds:[new Discord.MessageEmbed({title:'Edit Avatar Request!', description:'We will now update the details of the request.'})]}).catch(console.error);
                user.send({
                    embeds: [
                        new Discord.MessageEmbed({
                            title: 'Title (1/4)',
                            description: 'The title of your request. Should only be 1-5 words. Just start typing below and send the message:'
                        })
                    ],
                    components: []
                });
            }
            else {
                reaction.message.reactions.cache.get('📝').users.remove(user.id);
            }
        }
        else if (reaction.emoji.name == '⚙️' && user.id != element.user) { // the author cannot lock it themselves
            element.locked = true;
            DataStorage.save();
            reaction.message.react('⚙️'); // show the user, that the bot locked it
        }
        else if (reaction.emoji.name == '⚙️' && user.id == element.user) { // delete the reaction of the author
            reaction.message.reactions.cache.get('⚙️').users.remove(user.id);
        }
    });

    collector.on('remove', (reaction, user) => {
        if (reaction.emoji.name == '⚙️' && user.id != element.user) {
            if (reaction.count == 1) { // if only the bots reaction is there, remove reaction and unlock
                reaction.message.reactions.cache.get('⚙️').remove().catch(console.error);
                element.locked = false;
                DataStorage.save();
            }
        }
    });
    
    collector.on('end', collected => {
        console.log(`Collected ${collected.size} items`);
    });
}

module.exports = {init, createCollector}