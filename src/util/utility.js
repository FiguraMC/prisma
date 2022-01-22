module.exports.isModerator = async function (member) {
    const moderatorRoles = process.env.MODERATOR_ROLES.split(',');
    const isModerator = await member.roles.cache.some(r => moderatorRoles.includes(r.id));
    return isModerator;
};

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

module.exports.getURLs = function (text) {
    return text.match(/(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])/gi);
};
