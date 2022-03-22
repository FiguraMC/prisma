const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const utility = require('../../util/utility');

// Help command
// Automatically gets information about other commands to build a reply
module.exports = {
    name: 'help',
    usage: '`?help` - Shows this message.',
    /**
     * 
     * @param {Discord.Message} message 
     */
    async execute(message) {

        const isModerator = utility.isModerator(message.member);

        let commands = '**Available commands**\n';
        let modCommands = '**Moderator commands**\n';

        message.client.slashCommands.forEach(command => {
            if (command.moderator) {
                modCommands += command.usage + '\n';
            }
            else {
                commands += command.usage + '\n';
            }
        });

        message.client.prefixCommands.forEach(command => {
            if (command.moderator) {
                modCommands += command.usage + '\n';
            }
            else {
                commands += command.usage + '\n';
            }
        });

        message.reply({ embeds: [{ description: `${commands}\n${isModerator ? modCommands : ''}` }] });
    },
};
