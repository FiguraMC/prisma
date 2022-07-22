const { WebSocket } = require('ws');
const DataStorage = require('./dataStorage');

// Utility functions

/**
 * Checks if a member has a moderator role
 * @param {import('discord.js').GuildMember} member 
 */
module.exports.isModerator = function (member) {
    const moderatorRoles = process.env.MODERATOR_ROLES.split(',');
    return member.roles.cache.some(r => moderatorRoles.includes(r.id));
};

/**
 * Checks if a member has the helper role
 * @param {import('discord.js').GuildMember} member 
 */
module.exports.isHelper = function (member) {
    return member.roles.cache.some(r => r.id == process.env.HELPER_ROLE);
};

/**
 * Builds simple embed with title, description and components
 * If only 1 argument is given, it is used as the description
 * components is optional
 * @param {String} title 
 * @param {String} description 
 * @param {import('discord.js').MessageComponent[]} components 
 * @returns {import('discord.js').Message} Object similar to Discord.Message (just the embed structure)
 */
module.exports.buildEmbed = function (title, description, components) {
    if (!description) {
        description = title;
        title = '';
    }
    if (!components) components = [];
    const ret =
    {
        embeds: [
            {
                title: title,
                description: description,
            },
        ],
        components: components,
    };
    return ret;
};

/**
 * RegExp to match URLs
 * @param {String} text 
 * @returns 
 */
module.exports.getURLs = function (text) {
    return text.match(/(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])/gi);
};

/**
 * Utility function to escape a RegExp string
 * @param {String} string 
 * @returns {String} Escaped string
 */
module.exports.escapeRegExp = function (string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
};

/**
 * Checks if Figura backend is online
 * @param {import('discord.js').Client} client 
 * @returns boolean
 */
module.exports.checkBackendStatus = function (client) {
    return new Promise((resolve, reject) => { // eslint-disable-line no-unused-vars
        const ws = new WebSocket(`ws://${process.env.FIGURA_BACKEND_URL}:25500`);

        ws.on('open', () => {
            ws.send(JSON.stringify({
                type: 'auth',
                token: process.env.FIGURA_BACKEND_TOKEN,
            }));
        });

        ws.on('message', (raw) => {
            const msg = JSON.parse(raw);
            if (msg.type == 'connected') {
                setBackendStatusChannel(client, true);
                ws.close();
                resolve(true);
            }
        });

        ws.on('error', () => {
            setBackendStatusChannel(client, false);
            ws.close();
            resolve(false);
        });
    });
};

/**
 * Sets the backend status channel to online or offline
 * @param {import('discord.js').Client} client 
 * @param {boolean} status 
 */
function setBackendStatusChannel(client, status) {
    client.guilds.cache.forEach(async guild => {
        try {
            const channel = await guild.channels.fetch(DataStorage.guildsettings?.guilds?.get(guild.id)?.get('backend_status_channel'));
            channel.setName('0.1.0 Backend: ' + (status ? 'Online ✅' : 'Offline ❌')).catch(console.ignore);
        }
        // eslint-disable-next-line no-empty
        catch { }
    });
}

/**
 * 
 * @param {number} r 0...1
 * @param {number} g 0...1
 * @param {number} b 0...1
 * @returns number[] h 0...360 s 0...1 v 0...1
 */
module.exports.rgbToHsv = (r, g, b) => {
    const v = Math.max(r, g, b), c = v - Math.min(r, g, b);
    const h = c && ((v == r) ? (g - b) / c : ((v == g) ? 2 + (b - r) / c : 4 + (r - g) / c));
    return [60 * (h < 0 ? h + 6 : h), v && c / v, v];
};

/**
 * 
 * @param {number} h 0...360
 * @param {number} s 0...1
 * @param {number} v 0...1
 * @returns number[] rgb 0...1
 */
module.exports.hsvToRgb = (h, s, v) => {
    const f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    return [f(5), f(3), f(1)];
};
