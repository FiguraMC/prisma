// checks if user has moderator role, uses msg to get the guild member of the user
async function isModerator(userid, msg) {
    const member = await msg.guild.members.fetch(userid);
    const userIsModerator = await member.roles.cache.some(r => r.id == process.env.MODERATOR_ROLE);
    return userIsModerator;
}

module.exports = {isModerator}