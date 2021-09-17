const Discord = require('discord.js');
const RequestBuilder = require('./RequestBuilder');
const RequestItem = require('./RequestItem');
const RequestItemType = require('./RequestItemType');
const DataStorage = require('./DataStorage');
const ReactionCollector = require('./ReactionCollector');
const Actions = require('./Actions');
const ActionType = require('./ActionType');

const tags = new Discord.MessageActionRow()
.addComponents(
    new Discord.MessageSelectMenu()
    .setCustomId('tags')
    .setPlaceholder('Nothing selected')
    .setMinValues(1)
    .setMaxValues(7)
    .addOptions([
        {
            label: 'Texture',
            description: 'A texture is needed.',
            value: '[Texture]',
        },
        {
            label: 'Model',
            description: 'A model is needed.',
            value: '[Model]',
        },
        {
            label: 'Script',
            description: 'A script is needed.',
            value: '[Script]',
        },
        {
            label: 'IRL Payment',
            description: 'You will pay the person in real life currency.',
            value: '[IRL Payment]',
        },
        {
            label: 'Payment',
            description: 'Payment in some way, could even be MC diamonds.',
            value: '[Payment]',
        },
        {
            label: 'Simple',
            description: 'This request is simple to complete.',
            value: '[Simple]',
        },
        {
            label: 'Advanced',
            description: 'This request is difficult to complete.',
            value: '[Advanced]',
        }
    ]),
);

const types = new Discord.MessageActionRow()
.addComponents(
    new Discord.MessageSelectMenu()
    .setCustomId('types')
    .setPlaceholder('Nothing selected')
    .addOptions([
        {
            label: 'Full Avatar',
            description: 'A full character as an avatar.',
            value: '[Full Avatar]',
        },
        {
            label: 'Accessory',
            description: 'Something that could be worn or equipped.',
            value: '[Accessory]',
        },
        {
            label: 'Texture',
            description: 'A texture is needed.',
            value: '[Texture]',
        },
        {
            label: 'Model',
            description: 'A model is needed.',
            value: '[Model]',
        },
        {
            label: 'Script',
            description: 'A script is needed.',
            value: '[Script]',
        }
    ]),
);

const new_request_button = {
    content:'\u200b\n\u200b',
    components:[new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageButton()
            .setCustomId('new_avatar_request')
            .setStyle('SUCCESS')
            .setLabel('New Request')
        )
    ],
    embeds:[new Discord.MessageEmbed()
        .setDescription('Create your own request by clicking this button!')
        .setColor('3ba55d')
    ]
}

function bringNewRequestButtonToTheBottom(client) {
    client.channels.fetch(process.env.REQUESTS_CHANNEL)
    .then(channel => {
        channel.send(new_request_button)
        .then(msg => {
            if (DataStorage.storage.new_request_button != undefined) {
                channel.messages.fetch(DataStorage.storage.new_request_button)
                .then(oldmsg => {
                    oldmsg.delete().catch(console.error);
                })
                .catch(console.error);
            }
            DataStorage.storage.new_request_button = msg.id;
            DataStorage.save();
        });
    })
    .catch(console.error);
}

let requests = new Map();

function startRequest(author) {
    if (!Actions.set(author.id, {type:ActionType.BUILD_REQUEST})) return;

    requests.set(author.id, new RequestBuilder([
        new RequestItem('title', 'Title (1/5)', 'The title of your request. Should only be 1-5 words. Just start typing below and send the message:', [], RequestItemType.TEXT),
        new RequestItem('description', 'Description (2/5)', 'Explain what exactly you need, what requirements it should have, any important details, style, whatever you can think of that might be useful for others to know.', [], RequestItemType.TEXT),
        new RequestItem('type', 'Type (3/5)', 'Select the type of request.', [types], RequestItemType.TAGS),
        new RequestItem('tags', 'Tags (4/5)', 'Select the tags that fit your request.', [tags], RequestItemType.TAGS),
        new RequestItem('image', 'Reference Image (5/5)', 'We highly recommend adding an image to your request, so that people can more easily make your request. If you dont want an image, just type "skip".', [], RequestItemType.IMAGE)
    ]));
    author.send({
        embeds: [
            new Discord.MessageEmbed({
                title: 'New Avatar Request',
                description: 'We will now fill in the details of the request. Take your time to read the descriptions to ensure to make a high quality request. Low quality ones might get deleted by a moderator. You can type "abort" at any point if you make a mistake.'
            })
        ]
    }).catch(console.error)
    .then(() => {
        let state = requests.get(author.id).getState();
        author.send({
            embeds: [
                new Discord.MessageEmbed({
                    title: state.next.heading,
                    description: state.next.instructions
                })
            ],
            components: state.next?.components
        }).catch(console.error);
    });
}

function handle(client, message) {
    if (message.content.toLowerCase() == 'abort') {
        requests.delete(message.author.id);
        Actions.delete(message.author.id);
        message.author.send({embeds:[new Discord.MessageEmbed({description:'Action canceled.'})]}).catch(console.error);
        return;
    }
    if (!requests.has(message.author.id)) {
        if (message.content.toLowerCase() == 'request') {
            startRequest(message.author);
        }
        else {
            message.author.send({embeds: [new Discord.MessageEmbed({
				title: 'Hello there!',
				description: 'If you want to create an avatar request, send "request" in my DMs here.'+
							 '\n\n'+
							 'If you want to respond to an existing request, please do so in the corresponding thread.'
			})]}).catch(console.error);
        }
    }
    else {
        // check for the type first
        const request = requests.get(message.author.id);
        let state = request.getState();
        if (state.next?.type == RequestItemType.TAGS) return message.author.send({embeds:[new Discord.MessageEmbed({description:'Please select tags.'})]}).catch(console.error);

        // then use the text message
        request.input(message);
        state = request.getState();

        if (state.status == 'done') {
            let embed = new Discord.MessageEmbed();
            embed.setTitle(state.items.find(item => item.name == 'title').value);
            embed.setDescription(state.items.find(item => item.name == 'description').value);
            embed.setAuthor(message.author.username, message.author.avatarURL());
            embed.setImage(state.items.find(item => item.name == 'image').value);
            embed.setFields([
                {
                    name: 'Tags',
                    value: state.items.find(item => item.name == 'tags').value.join('\n'),
                    inline: true
                },
                {
                    name: 'Type',
                    value: state.items.find(item => item.name == 'type').value[0],
                    inline: true
                }
            ]);
            embed.setColor('2aacf7'); // blue

            if (message.content.toLowerCase() != 'confirm') {
                // send preview
                message.author.send({
                    embeds: [
                        new Discord.MessageEmbed({
                            title: 'Preview',
                            description: 'Here is a preview of your request. If you are happy with it, type "confirm". If you want to try again, type "abort".'
                        })
                    ]
                }).catch(console.error);
                message.author.send({ embeds: [embed] }).catch(err => {
                    embed.setImage(undefined);
                    message.author.send({ embeds: [embed] }).catch(console.error);
                });
            }
            else { // if (message.content.toLowerCase() == 'confirm')
                // send actual

                message.author.send({
                    embeds: [
                        new Discord.MessageEmbed({
                            title: 'Done!',
                            description: 'The request is now completed!\n\nYou can react to your request\'s message for some actions.\n✅ Archive request when completed\n❌ Delete request\n📝 Edit request\n\nOthers can react with ⚙️ to show that they are working on your request.'
                        })
                    ]
                }).catch(console.error);

                requests.delete(message.author.id);
                Actions.delete(message.author.id);
                
                client.channels.fetch(process.env.REQUESTS_CHANNEL)
                .then(channel => {
                    channel.send({ embeds: [embed] })
                        .then(msg => {
                            bringNewRequestButtonToTheBottom(client);
                            msg.react('✅').then(()=>msg.react('❌').then(()=>msg.react('📝').then(()=>msg.react('⚙️'))));
                            msg.startThread({name: state.items.find(item => item.name == 'title').value, autoArchiveDuration: 'MAX'})
                                .then(thread=>{
                                    thread.members.add(message.author);
                                    thread.send({embeds:[{description:'Remember to archive the request when it\'s completed ✅.\nOthers can react with ⚙️ to show that they are working on your request.'}]});
                                    const element = {message:msg.id, user:message.author.id, timestamp: Date.now(), locked:false, thread: thread.id};
                                    DataStorage.storage.avatar_requests.push(element);
                                    DataStorage.save();
                                    ReactionCollector.createCollector(msg, element);
                                });
                        })
                        .catch(err => {
                            embed.setImage(undefined);
                            channel.send({ embeds: [embed] }).catch(console.error)
                                .then(msg => {
                                    bringNewRequestButtonToTheBottom(client);
                                    msg.react('✅').then(()=>msg.react('❌').then(()=>msg.react('📝').then(()=>msg.react('⚙️'))));
                                    msg.startThread({name: state.items.find(item => item.name == 'title').value, autoArchiveDuration: 'MAX'})
                                        .then(thread=>{
                                            thread.members.add(message.author);
                                            thread.send({embeds:[{description:'Remember to archive the request when it\'s completed ✅.\nOthers can react with ⚙️ to show that they are working on your request.'}]});
                                            const element = {message:msg.id, user:message.author.id, timestamp: Date.now(), locked:false, thread: thread.id};
                                            DataStorage.storage.avatar_requests.push(element);
                                            DataStorage.save();
                                            ReactionCollector.createCollector(msg, element);
                                        });
                                })
                        });
                })
                .catch(console.error);
            }
        }
        else {
            // request build not done yet, send next step
            message.author.send({
                embeds: [
                    new Discord.MessageEmbed({
                        title: state.next.heading,
                        description: state.next.instructions
                    })
                ],
                components: state.next?.components
            }).catch(console.error);
        }
    }
}

function onInteract(interaction) {
    if (interaction.isSelectMenu()){
        if (interaction.customId == 'tags') {
            if (requests.has(interaction.user.id)) {
    
                // check for the type first
                const request = requests.get(interaction.user.id);
                let state = request.getState();
                if (state.next?.type != RequestItemType.TAGS) return;
    
                // input the selected tags
                request.input(interaction.values);
                state = request.getState();
    
                // edit the message, remove the components
                interaction.update({
                    embeds: [
                        new Discord.MessageEmbed({
                            description: 'Tags saved.'
                        })
                    ], components: []
                });
    
                // send next step
                interaction.user.send({
                    embeds: [
                        new Discord.MessageEmbed({
                            title: state.next.heading,
                            description: state.next.instructions
                        })
                    ],
                    components: state.next?.components
                });
            }
        }
        else if (interaction.customId == 'types') {
            if (requests.has(interaction.user.id)) {
    
                // check for the type first
                const request = requests.get(interaction.user.id);
                let state = request.getState();
                if (state.next?.type != RequestItemType.TAGS) return;
    
                // input the selected tags
                request.input(interaction.values);
                state = request.getState();
    
                // edit the message, remove the components
                interaction.update({
                    embeds: [
                        new Discord.MessageEmbed({
                            description: 'Type saved.'
                        })
                    ], components: []
                });
    
                // send next step
                interaction.user.send({
                    embeds: [
                        new Discord.MessageEmbed({
                            title: state.next.heading,
                            description: state.next.instructions
                        })
                    ],
                    components: state.next?.components
                });
            }
        }
    }
    else if (interaction.isButton()) {
        if (interaction.customId == 'new_avatar_request') {
            interaction.deferUpdate();
            if (DataStorage.storage.people[interaction.user.id]?.ban) {
                interaction.user.send('Sorry, you can\'t create a request at the moment.');
                return;
            }
        startRequest(interaction.user);
        }
    }
}

function handleEdit(client, message) {
    if (message.content.toLowerCase() == 'abort') {
        requests.delete(message.author.id);
        Actions.delete(message.author.id);
        message.author.send({embeds:[new Discord.MessageEmbed({description:'Action canceled.'})]}).catch(console.error);
        return;
    }
    if (!requests.has(message.author.id)) {
        requests.set(message.author.id, new RequestBuilder([
            new RequestItem('title', '', '', [], RequestItemType.TEXT),
            new RequestItem('description', 'Description (2/5)', 'Explain what exactly you need, what requirements it should have, any important details, style, whatever you can think of that might be useful for others to know.', [], RequestItemType.TEXT),
            new RequestItem('type', 'Type (3/5)', 'Select the type of request.', [types], RequestItemType.TAGS),
            new RequestItem('tags', 'Tags (4/5)', 'Select the tags that fit your request.', [tags], RequestItemType.TAGS),
            new RequestItem('image', 'Reference Image (5/5)', 'We highly recommend adding an image to your request, so that people can more easily make your request. If you dont want an image, just type "skip".', [], RequestItemType.IMAGE)
        ]));
    }
    
    // check for the type first
    const request = requests.get(message.author.id);
    let state = request.getState();

    // then use the text message
    if (message.content.toLowerCase() == 'skip') {
        if (state.next?.type == RequestItemType.TAGS) return message.author.send({embeds:[new Discord.MessageEmbed({description:'Sorry, you can\'t skip this step.'})]}).catch(console.error);
        request.input('skip');
    }
    else {
        if (state.next?.type == RequestItemType.TAGS) return message.author.send({embeds:[new Discord.MessageEmbed({description:'Please select tags.'})]}).catch(console.error);
        request.input(message);
    }
    state = request.getState();

    if (state.status == 'done') {
        message.author.send({
            embeds: [
                new Discord.MessageEmbed({
                    title: 'Done!',
                    description: 'The request is now updated!\n\nYou can react to your request\'s message for some actions.\n✅ Archive request when completed\n❌ Delete request\n📝 Edit request\n\nOthers can react with ⚙️ to show that they are working on your request.'
                })
            ]
        }).catch(console.error);
        
        const messageToEdit = Actions.get(message.author.id).data;

        if (messageToEdit.embeds.length != 1) return;

        const title = state.items.find(item => item.name == 'title').value;
        if (title != 'skip') messageToEdit.embeds[0].setTitle(title);
        const description = state.items.find(item => item.name == 'description').value;
        if (description != 'skip') messageToEdit.embeds[0].setDescription(description);
        const image = state.items.find(item => item.name == 'image').value;
        if (image != 'skip') messageToEdit.embeds[0].setImage(image);
        const _tags = state.items.find(item => item.name == 'tags').value.join('\n');
        const _type = state.items.find(item => item.name == 'type').value[0];
        // tags and type are unskippable, so no check necessary
        messageToEdit.embeds[0].setFields([
            {
                name: 'Tags',
                value: _tags,
                inline: true
            },
            {
                name: 'Type',
                value: _type,
                inline: true
            }
        ]);
        const element = DataStorage.storage.avatar_requests.find(x=>x.message==messageToEdit.id);
        if (element != undefined) {
            if (element.timestamp + 1000*60*60*24 < Date.now()) {
                messageToEdit.embeds[0].setColor('202225'); // older than 24h gray
            }
            else {
                messageToEdit.embeds[0].setColor('2aacf7'); // newer than 24h blue
            }
        }
        else {
            messageToEdit.embeds[0].setColor('202225'); // default gray
        }
        
        requests.delete(message.author.id);
        Actions.delete(message.author.id);

        messageToEdit.edit({embeds:messageToEdit.embeds}).catch(err => {
            messageToEdit.embeds[0].setImage(undefined);
            messageToEdit.edit({embeds:messageToEdit.embeds}).catch(console.error);
        });
    }
    else {
        // request build not done yet, send next step
        message.author.send({
            embeds: [
                new Discord.MessageEmbed({
                    title: state.next.heading,
                    description: state.next.instructions
                })
            ],
            components: state.next?.components
        }).catch(console.error);
    }
}

async function handleDelete(client, message) {
    if (message.content.toLowerCase() == 'abort') {
        message.author.send({embeds:[new Discord.MessageEmbed({description:'Action canceled.'})]}).catch(console.error);
        Actions.delete(message.author.id);
        return;
    }
    else if (message.content.toLowerCase() == 'confirm') {
        const msg = Actions.get(message.author.id).data;
        const element = DataStorage.storage.avatar_requests.find(x=>x.message==msg.id);
        client.channels.fetch(process.env.LOG_CHANNEL).then(channel => channel.send({content: 'Request deleted:', embeds: msg.embeds}).catch(console.error)).catch(console.error);
        msg.delete().catch(console.error);
        const thread = await msg.channel.threads.fetch(element.thread).catch(console.error);
        thread.setArchived(true).catch(console.error);
        DataStorage.deleteFromArray(DataStorage.storage.avatar_requests, element);
        DataStorage.save();
        message.author.send({embeds:[new Discord.MessageEmbed({description:'Request deleted.'})]}).catch(console.error);
        Actions.delete(message.author.id);
    }
    else {
        message.author.send({embeds:[new Discord.MessageEmbed({description:'Please send either "confirm" or "abort".'})]}).catch(console.error);
    }
}

module.exports = { handle, onInteract, handleEdit, handleDelete }