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
        if (user.bot) return;

        if (reaction.emoji.name == '❌') {
            reaction.message.reactions.cache.get('❌').users.remove(user.id);
            if (user.id != element.user) return; // only the author can delete
            
            if (Actions.set(user.id, {type:ActionType.DELETE_REQUEST, data:reaction.message})) {
                user.send({embeds:[new Discord.MessageEmbed({title:'Request Deletion', description:'Are you sure you want to delete this request? Type "confirm" to delete, or "abort" to cancel.'})]}).catch(console.error);
            }
        }
        else if (reaction.emoji.name == '✅') {
            reaction.message.reactions.cache.get('✅').users.remove(user.id);
            if (user.id != element.user) return;// only the author can accept

            if (Actions.set(user.id, {type:ActionType.ACCEPT_REQUEST, data:reaction.message})) {
                user.send({embeds:[new Discord.MessageEmbed({title:'Avatar request fullfilled!', description:'It will now be archived. If you want, you can now send the finished request as a zip file, to attach it to the archive. If you don\' want that, just type "skip".'})]}).catch(console.error);
            }
        }
        else if (reaction.emoji.name == '📝') {
            reaction.message.reactions.cache.get('📝').users.remove(user.id);
            if (user.id != element.user) return;// only the author can edit
            
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
        }
        else if (reaction.emoji.name == '⚙️') {
            if (user.id == element.user) return reaction.message.reactions.cache.get('⚙️').users.remove(user.id); // the author cannot lock it themselves

            element.locked = true;
            DataStorage.save();
            // show the user, that the bot locked it
            reaction.message.embeds.forEach(embed => {
                embed.color = 'f28a2e'; // orange
            });
            reaction.message.edit({embeds:reaction.message.embeds}).catch(console.error);
        }
    });

    collector.on('remove', (reaction, user) => {
        if (reaction.emoji.name == '⚙️' && user.id != element.user) {
            if (reaction.count == 1) { // if only the bots reaction is there, unlock
                element.locked = false;
                DataStorage.save();
                if (element.timestamp + 1000*60*60*24 < Date.now()) {
                    reaction.message.embeds.forEach(embed => {
                        embed.color = '202225'; // older than 24h gray
                    });
                }
                else {
                    reaction.message.embeds.forEach(embed => {
                        embed.color = '2aacf7'; // newer than 24h blue
                    });
                }
                reaction.message.edit({embeds:reaction.message.embeds}).catch(console.error);
            }
        }
    });
    
    collector.on('end', collected => {
        console.log(`Collected ${collected.size} items`);
    });
}

module.exports = {init, createCollector}