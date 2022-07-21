const Argument = require('../parser/argument');
const utility = require('../../util/utility');

// Help command
// Gets information about other commands to build a reply
module.exports = {
    name: 'help',
    description: 'Shows this message.',
    allowInOtherGuilds: true,
    overloads: [
        {
            arguments: [],
            /**
            * @param {import('discord.js').Message} message 
            */
            execute: async (message) => {
                const isModerator = utility.isModerator(message.member);

                const commands = { text:'**Available commands**\n' };
                const modCommands = { text:'**Moderator commands**\n' };

                message.client.slashCommands.forEach(command => {
                    if (message.guild.id != process.env.MAIN_GUILD && !command.allowInOtherGuilds) return;
                    const group = command.moderator ? modCommands : commands;
                    group.text += `\`/${command.name}\` - ${command.description}\n`;
                });

                message.client.prefixCommands.forEach(command => {
                    if (message.guild.id != process.env.MAIN_GUILD && !command.allowInOtherGuilds) return;
                    const group = command.moderator ? modCommands : commands;
                    group.text += `\`${process.env.PREFIX}${command.name}\` - ${command.description}\n`;
                });

                message.reply({ embeds: [{ description: `${commands.text}\n${isModerator ? modCommands.text : ''}` }] });
            },
        },
        {
            arguments: [new Argument('command', 'command')],
            /**
            * @param {import('discord.js').Message} message 
            * @param {import('../parser/argumentContainer')} args
            */
            execute: async (message, args) => {
                message.reply(utility.buildEmbed(args.getValue('command').longDescription ?? args.getValue('command').description));
            },
        },
    ],
};
