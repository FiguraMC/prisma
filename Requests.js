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
    .setMaxValues(9)
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
        },
    ]),
);

let requests = new Map();

function handle(client, message) {
    if (message.content.toLowerCase() == 'abort') {
        requests.delete(message.author.id);
        Actions.delete(message.author.id);
        message.author.send({embeds:[new Discord.MessageEmbed({description:'Action aborted.'})]}).catch(console.error);
    }
    if (!requests.has(message.author.id)) {
        if (message.content.toLowerCase() == 'request') {
            if (!Actions.set(message.author.id, {type:ActionType.BUILD_REQUEST})) return;
            requests.set(message.author.id, new RequestBuilder([
                new RequestItem('title', 'Title (1/4)', 'The title of your request. Should only be 1-5 words. Just start typing below and send the message:', [], RequestItemType.TEXT),
                new RequestItem('description', 'Description (2/4)', 'Explain what exactly you need, what requirements it should have, any important details, style, whatever you can think of that might be useful for others to know.', [], RequestItemType.TEXT),
                new RequestItem('tags', 'Tags (3/4)', 'Select the tags that fit your request.', [tags], RequestItemType.TAGS),
                new RequestItem('image', 'Reference Image (4/4)', 'We highly recommend adding an image to your request, so that people can more easily make your request. If you dont want an image, just type "skip".', [], RequestItemType.IMAGE)
            ]));
            message.author.send({
                embeds: [
                    new Discord.MessageEmbed({
                        title: 'New Avatar Request',
                        description: 'We will now fill in the details of the request. Take your time to read the descriptions to ensure to make a high quality request. Low quality ones might get deleted by a moderator.'
                    })
                ]
            }).catch(console.error)
            .then(() => {
                let state = requests.get(message.author.id).getState();
                message.author.send({
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
    }
    else {
        // check for the type first
        const request = requests.get(message.author.id);
        let state = request.getState();
        if (state.next.type == RequestItemType.TAGS) return;

        // then use the text message
        request.input(message);
        state = request.getState();

        if (state.status == 'done') {
            message.author.send({
                embeds: [
                    new Discord.MessageEmbed({
                        title: 'Done!',
                        description: 'The request is now completed!\nTip: You can react to your request\'s message for some actions.\n✅ Accept/Archive request\n❌ Delete request\n📝 Edit request'
                    })
                ]
            }).catch(console.error);
            let embed = new Discord.MessageEmbed();
            embed.setTitle(state.items.find(item => item.name == 'title').value);
            embed.setDescription(state.items.find(item => item.name == 'description').value);
            embed.setAuthor(message.author.username, message.author.avatarURL());
            embed.setImage(state.items.find(item => item.name == 'image').value);
            embed.setFields([
                {
                    name: 'Tags',
                    value: state.items.find(item => item.name == 'tags').value.join('\n')
                }
            ]);
            embed.setColor('2aacf7'); // blue
            requests.delete(message.author.id);
            Actions.delete(message.author.id);
            client.channels.fetch(process.env.REQUESTS_CHANNEL)
                .then(channel => {
                    channel.send({ embeds: [embed] })
                        .then(msg => {
                            msg.react('✅').then(()=>msg.react('❌').then(()=>msg.react('📝').then(()=>msg.react('⚙️'))));
                            msg.startThread({name: state.items.find(item => item.name == 'title').value, autoArchiveDuration: 'MAX'})
                                .then(thread=>{
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
                                    msg.react('✅').then(()=>msg.react('❌').then(()=>msg.react('📝').then(()=>msg.react('⚙️'))));
                                    msg.startThread({name: state.items.find(item => item.name == 'title').value, autoArchiveDuration: 'MAX'})
                                        .then(thread=>{
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
    if (!interaction.isSelectMenu()) return;

    if (interaction.customId == 'tags') {
        if (requests.has(interaction.user.id)) {

            // check for the type first
            const request = requests.get(interaction.user.id);
            let state = request.getState();
            if (state.next.type != RequestItemType.TAGS) return;

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
}

function handleEdit(client, message) {
    if (message.content.toLowerCase() == 'abort') {
        requests.delete(message.author.id);
        Actions.delete(message.author.id);
        message.author.send({embeds:[new Discord.MessageEmbed({description:'Action aborted.'})]}).catch(console.error);
    }
    if (!requests.has(message.author.id)) {
        requests.set(message.author.id, new RequestBuilder([
            new RequestItem('title', '', '', [], RequestItemType.TEXT),
            new RequestItem('description', 'Description (2/4)', 'Explain what exactly you need, what requirements it should have, any important details, style, whatever you can think of that might be useful for others to know.', [], RequestItemType.TEXT),
            new RequestItem('tags', 'Tags (3/4)', 'Select the tags that fit your request.', [tags], RequestItemType.TAGS),
            new RequestItem('image', 'Reference Image (4/4)', 'We highly recommend adding an image to your request, so that people can more easily make your request. If you dont want an image, just type "skip".', [], RequestItemType.IMAGE)
        ]));
    }
    // check for the type first
    const request = requests.get(message.author.id);
    let state = request.getState();
    if (state.next.type == RequestItemType.TAGS) return;

    // then use the text message
    request.input(message);
    state = request.getState();

    if (state.status == 'done') {
        message.author.send({
            embeds: [
                new Discord.MessageEmbed({
                    title: 'Done!',
                    description: 'The request is now updated!\nTip: You can react to your request\'s message for some actions.\n✅ Accept/Archive request\n❌ Delete request\n📝 Edit request'
                })
            ]
        }).catch(console.error);
        let embed = new Discord.MessageEmbed();
        embed.setTitle(state.items.find(item => item.name == 'title').value);
        embed.setDescription(state.items.find(item => item.name == 'description').value);
        embed.setAuthor(message.author.username, message.author.avatarURL());
        embed.setImage(state.items.find(item => item.name == 'image').value);
        embed.setFields([
            {
                name: 'Tags',
                value: state.items.find(item => item.name == 'tags').value.join('\n')
            }
        ]);
        
        const messageToEdit = Actions.get(message.author.id).data;

        const element = DataStorage.storage.avatar_requests.find(x=>x.message==messageToEdit.id);
        if (element != undefined) {
            if (element.timestamp + 1000*60*60*24 < Date.now()) {
                embed.setColor('202225'); // older than 24h gray
            }
            else {
                embed.setColor('2aacf7'); // newer than 24h blue
            }
        }
        else {
            embed.setColor('202225'); // default gray
        }
        
        requests.delete(message.author.id);
        Actions.delete(message.author.id);

        messageToEdit.edit({ embeds: [embed] }).catch(err => {
            embed.setImage(undefined);
            messageToEdit.edit({ embeds: [embed] }).catch(console.error);
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

module.exports = { handle, onInteract, handleEdit }