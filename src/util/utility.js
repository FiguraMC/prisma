const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const got = require('got');

// Utility functions

/**
 * Checks if a member has a moderator role
 * @param {Discord.GuildMember} member 
 */
module.exports.isModerator = function (member) {
    const moderatorRoles = process.env.MODERATOR_ROLES.split(',');
    return member.roles.cache.some(r => moderatorRoles.includes(r.id));
};

/**
 * Checks if a member has the helper role
 * @param {Discord.GuildMember} member 
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
 * @param {Discord.MessageComponent[]} components 
 * @returns {Discord.Message} Object similar to Discord.Message (just the embed structure)
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
 * @returns boolean
 */
module.exports.checkBackendStatus = function (client) {
    return new Promise((resolve, reject) => { // eslint-disable-line no-unused-vars
        got(process.env.FIGURA_BACKEND_URL, {
            https: {
                rejectUnauthorized: false,
            },
            timeout: 5000,
            retry: 1,
        })
            .then(res => {
                setBackendStatusChannel(client, res.statusCode == 200);
                resolve(res.statusCode == 200);
            })
            .catch(() => {
                setBackendStatusChannel(client, false);
                resolve(false);
            });
    });
};

/**
 * Sets the backend status channel to online or offline
 * @param {Discord.Client} client 
 * @param {boolean} status 
 */
async function setBackendStatusChannel(client, status) {
    const channel = await client.channels.fetch(process.env.BACKEND_STATUS_CHANNEL);
    if (channel) {
        channel.setName('Backend: ' + (status ? 'Online ✅' : 'Offline ❌')).catch(console.error);
    }
}
