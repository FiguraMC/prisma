const DataStorage = require('./DataStorage');
const Actions = require('./Actions');
const ActionType = require('./ActionType');
const Discord = require('discord.js');
const {isModerator} = require('./util');

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
            
            let userIsModerator = await isModerator(user.id, msg);
            if (user.id != element.user && !userIsModerator) return; // only the author or a moderator can delete
            
            if (Actions.set(user.id, {type:ActionType.DELETE_REQUEST, data:reaction.message})) {
                user.send({embeds:[new Discord.MessageEmbed({title:'Request Deletion', description:'Are you sure you want to delete this request? Type "confirm" to delete, or "abort" to cancel.'})]}).catch(console.error);
            }
        }
        else if (reaction.emoji.name == '✅') {
            reaction.message.reactions.cache.get('✅').users.remove(user.id);
            const gearReactionPeople = await reaction.message.reactions.cache.get('⚙️')?.users.fetch();
            
            let userIsModerator = await isModerator(user.id, msg);
            if (user.id != element.user && !userIsModerator) return;// only the author or a moderator can archive

            if (Actions.set(user.id, {type:ActionType.ACCEPT_REQUEST, data:reaction.message, gearReactionPeople:gearReactionPeople})) {
                await user.send({embeds:[new Discord.MessageEmbed({title:'Archiving the avatar request!', description:'Please follow a few steps to finish this request. Type "abort" at any time to cancel this action.'})]}).catch(console.error);
                user.send({embeds:[new Discord.MessageEmbed({title:'Request Files (1/2)', description:'You can now send the finished request as a zip file, to attach it to the archive. If you don\'t want that, just type "skip".'})]}).catch(console.error);
            }
        }
        else if (reaction.emoji.name == '📝') {
            reaction.message.reactions.cache.get('📝').users.remove(user.id);

            let userIsModerator = await isModerator(user.id, msg);
            if (user.id != element.user && !userIsModerator) return;// only the author can edit
            
            if (Actions.set(user.id, {type:ActionType.EDIT_REQUEST, data:reaction.message})) {
                await user.send({embeds:[new Discord.MessageEmbed({title:'Edit Avatar Request!', description:'We will now update the details of the request. You can cancel this at any point by typing "abort".'})]}).catch(console.error);
                user.send({
                    embeds: [
                        new Discord.MessageEmbed({
                            title: 'Title (1/5)',
                            description: 'The title of your request. Should only be 1-5 words. Just start typing below and send the message:'
                        })
                    ],
                    components: []
                });
            }
        }
        else if (reaction.emoji.name == '⚙️') {
            if (user.id == element.user || DataStorage.storage.people[user.id]?.ban) return reaction.message.reactions.cache.get('⚙️').users.remove(user.id); // the author cannot lock it themselves, and banned people neither

            // check if user has hit the ⚙️ limit
            if (DataStorage.storage.avatar_requests.filter(x => x.workers?.includes(user.id))?.length >= 5) {
                reaction.message.reactions.cache.get('⚙️').users.remove(user.id);
                user.send({embeds:[{description:'Your are already working on 5 requests! Please finish another request first, before working on new ones. This limit has been implemented to avoid spam.'}]});
                return;
            }

            // add user to the workers list
            let avatar_request = DataStorage.storage.avatar_requests.find(x => x.message == reaction.message.id);
            if (avatar_request.workers == undefined) avatar_request.workers = [];
            avatar_request.workers.push(user.id);

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
            // remove user from the workers list
            let avatar_request = DataStorage.storage.avatar_requests.find(x => x.message == reaction.message.id);
            avatar_request.workers = avatar_request.workers?.filter(x => x != user.id);

            // if only the bots reaction is there, unlock
            if (reaction.count == 1) {
                element.locked = false;
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

            DataStorage.save();
        }
    });
    
    collector.on('end', collected => {
        console.log(`Collected ${collected.size} items`);
    });
}

module.exports = {init, createCollector}