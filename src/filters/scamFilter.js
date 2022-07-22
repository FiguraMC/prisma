const Discord = require('discord.js');
const ContentBlocker = require('../util/contentBlocker');
const utility = require('../util/utility');
const DataStorage = require('../util/dataStorage');
const path = require('path');
const Canvas = require('canvas');

/**
 * Filters a message using the scam content blocker
 * @param {import('discord.js').Message} message 
 */
module.exports.filter = async function (message) {
    if (DataStorage.guildsettings.guilds?.get(message.guild.id)?.get('enable_scam_filter') != 'true') return;

    if (
        ContentBlocker.scam(message.content) ||
        ContentBlocker.scam(message.embeds[0]?.url) ||
        ContentBlocker.scam(message.embeds[0]?.thumbnail?.url) ||
        ContentBlocker.scam((await ContentBlocker.expandMultipleUrls(utility.getURLs(message.content))).join()) ||
        ContentBlocker.matchesGenericScamMessage(message)
    ) {
        message.delete().catch(console.ignore);

        // Setting for clearing roles on mute, otherwise just going to add the muted role to the existing ones
        if (DataStorage.guildsettings.guilds?.get(message.guild.id)?.get('clear_roles_on_mute') == 'true') {
            message.member.roles.set([DataStorage.guildsettings.guilds?.get(message.guild.id)?.get('muted_role')]).catch(console.ignore);
        }
        else {
            message.member.roles.add(DataStorage.guildsettings.guilds?.get(message.guild.id)?.get('muted_role')).catch(console.ignore);
        }

        const amogus1 = await Canvas.loadImage(path.resolve(__dirname, 'img/amogus1.png'));
        const amogus2 = await Canvas.loadImage(path.resolve(__dirname, 'img/amogus2.png'));
        const space = await Canvas.loadImage(path.resolve(__dirname, 'img/space.png'));
        const text = await Canvas.loadImage(path.resolve(__dirname, 'img/text.png'));

        const canvas = Canvas.createCanvas(space.width, space.height);
        const ctx = canvas.getContext('2d');

        const canvas2 = Canvas.createCanvas(space.width, space.height);
        const ctx2 = canvas2.getContext('2d');

        ctx2.drawImage(amogus2, 1400, 400, 300, 300);
        const imgdata = ctx2.getImageData(0, 0, canvas2.width, canvas2.height);
        const rotation = Math.random() * 360;
        for (let i = 0; i < imgdata.data.length; i += 4) {
            const r = imgdata.data[i];
            const g = imgdata.data[i + 1];
            const b = imgdata.data[i + 2];
            const hsv = utility.rgbToHsv(r, g, b);
            const rgb = utility.hsvToRgb(hsv[0] + rotation, hsv[1], hsv[2]);
            imgdata.data[i] = rgb[0];
            imgdata.data[i + 1] = rgb[1];
            imgdata.data[i + 2] = rgb[2];
        }
        ctx2.putImageData(imgdata, 0, 0);

        ctx.drawImage(space, 0, 0);
        ctx.drawImage(text, 0, 0);
        ctx.drawImage(amogus1, 1400, 400, 300, 300);
        ctx.drawImage(canvas2, 0, 0);
        const buf = Buffer.from(canvas.toBuffer());
        const sentMessage = await message.channel.send({
            files: [new Discord.MessageAttachment(
                buf,
                'scammer_ejected.png',
            )],
        }).catch(console.ignore);

        // Send special message in showcase channels
        if (process.env.SHOWCASE_CHANNELS.split(',').find(x => x == message.channel.id)) {
            sentMessage.react(process.env.UPVOTE_EMOJI).catch(console.ignore);
        }

        message.guild.channels.fetch(DataStorage.guildsettings.guilds?.get(message.guild.id)?.get('mod_log_channel'))
            .then(channel => {
                channel.send({
                    embeds: [
                        {
                            title: 'Scam Filter',
                            fields: [
                                {
                                    name: 'User',
                                    value: `<@${message.author.id}> (${message.author.tag})`,
                                },
                                {
                                    name: 'Message',
                                    value: message.content == '' ? '[empty]' : message.content,
                                },
                            ],
                            color: 'ff5114',
                        },
                    ],
                }).catch(console.ignore);
            })
            .catch(console.ignore);
    }
};
