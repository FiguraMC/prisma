// Utility functions

// Checks if a member has a moderator role
module.exports.isModerator = async function (member) {
    const moderatorRoles = process.env.MODERATOR_ROLES.split(',');
    const isModerator = await member.roles.cache.some(r => moderatorRoles.includes(r.id));
    return isModerator;
};

// Builds simple embed with title, description and components
// If only 1 argument is given, it is used as the description
// components is optional
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

// RegExp to match URLs
module.exports.getURLs = function (text) {
    return text.match(/(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])/gi);
};
