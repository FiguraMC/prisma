const utility = require('../../util/utility');

module.exports = {
    name: 'help',
    usage: '`?help` - Shows this message.',
    async execute(message) {

        const isModerator = await utility.isModerator(message.member);

        let commands = '**Available commands**\n';
        let modCommands = '**Moderator commands**\n';

        message.client.slashCommands.forEach(command => {
            if (command.moderator && isModerator) {
                modCommands += command.usage + '\n';
            }
            else {
                commands += command.usage + '\n';
            }
        });

        message.client.prefixCommands.forEach(command => {
            if (command.moderator && isModerator) {
                modCommands += command.usage + '\n';
            }
            else {
                commands += command.usage + '\n';
            }
        });

        message.reply({ embeds: [{ description: `${commands}\n${modCommands}` }] });
    },
};
