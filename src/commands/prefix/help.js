const Argument = require('../parser/argument');
const utility = require('../../util/utility');
const syntax = require('../parser/syntax');

// Help command
// Gets information about other commands to build a reply
module.exports = {
    name: 'help',
    description: 'Shows help about a command.',
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
                const command = args.getValue('command');
                message.reply({ embeds: [{
                    fields: [
                        {
                            name: process.env.PREFIX + command.name,
                            value: command.longDescription ?? command.description,
                        },
                        {
                            name: 'Syntax',
                            value: syntax(command),
                        },
                    ],
                }] });
            },
        },
    ],
};
