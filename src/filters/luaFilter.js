const utility = require('../util/utility');
const { checkMessageForLuaError } = require('../util/lua');

/**
 * 
 * @param {import('discord.js').Message} message 
 */
module.exports.filter = async function (message) {
    if (message.guild.id == process.env.MAIN_GUILD && process.env.HELP_CHANNELS.split(',').find(x => x == message.channel.id || x == message.channel.parentId)) {
        // if sent in a help channel, check for Lua code
        const luaError = checkMessageForLuaError(message.content);
        if (luaError !== null) {
            const embed = utility.buildEmbed(luaError);
            embed.embeds[0].footer = { text: 'React with ❌ to delete.' };
            const sentMessage = await message.reply(embed);
            sentMessage.createReactionCollector().on('collect', async (reaction, user) => {
                const member = await message.guild.members.fetch(user.id);
                if (reaction.emoji.name == '❌' && (user.id == message.author.id || utility.isHelper(member))) {
                    sentMessage.delete().catch(console.ignore);
                }
            });
        } 
    }
};
