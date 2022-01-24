const ChatFilter = require('../filters/chatFilter');
const ShowcaseFilter = require('../filters/showcaseFilter');
const FaqFilter = require('../filters/faqFilter');
const utility = require('../util/utility');

module.exports = {
    name: 'messageCreate',
    async execute(message) {

        if (message.author.bot) return; // Ignore bots

        // Prefix commands handling
        if (message.content.startsWith(process.env.PREFIX)) {
            const args = message.content.split(/ +/);
            const commandName = args.shift().toLowerCase().substring(process.env.PREFIX.length);
            const command = message.client.prefixCommands.get(commandName);

            if (!command) return;

            // Only allow commands that have dm property set to true in DMs
            if (message.channel.type == 'DM' && !command.dm) return message.channel.send(utility.buildEmbed('Commands don\'t work in DMs.'));

            // Check if command needs moderator perms and check if sender has moderator role
            if (command.moderator && !(await utility.isModerator(message.member))) return;

            // Execute the command
            try {
                command.execute(message, args);
            }
            catch (error) {
                console.error(error);
            }
        }
        // If not a command, do some chat filter stuff
        else {
            ChatFilter.filter(message);
            ShowcaseFilter.filter(message);
            FaqFilter.filter(message);
        }
    },
};
