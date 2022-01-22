const ChatFilter = require('../filters/chatFilter');
const ShowcaseFilter = require('../filters/showcaseFilter');
const utility = require('../util/utility');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot) return;

        if (message.content.startsWith(process.env.PREFIX)) {
            const args = message.content.split(/ +/);
            const commandName = args.shift().toLowerCase().substring(process.env.PREFIX.length);
            const command = message.client.prefixCommands.get(commandName);

            if (!command) return;

            if (message.channel.type == 'DM') return message.channel.send(utility.buildEmbed('Commands don\'t work in DMs.'));

            if (command.moderator && !(await utility.isModerator(message.member))) return;

            try {
                command.execute(message, args);
            }
            catch (error) {
                console.error(error);
            }
        }
        else {
            ChatFilter.filter(message);
            ShowcaseFilter.filter(message);
        }
    },
};
