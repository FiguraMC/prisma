const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

module.exports.handlers = new Collection();

// Initialization for dialog handlers
module.exports.register = function (client) {

    // Get the files inside the handlers directory
    const handlerFiles = fs.readdirSync(path.join(__dirname, 'handlers')).filter(file => file.endsWith('.js'));

    for (const file of handlerFiles) {
        const handler = require(path.join(__dirname, 'handlers', file));
        module.exports.handlers.set(handler.name, handler);
    }

    // Call the handle function of the correct handler on messageCreate
    client.on('messageCreate', async message => {

        if (message.channel.type != 'DM') return;

        const dialogs = message.client.dialogs;
        const user = message.author;

        if (!dialogs.has(user)) return;

        const dialog = dialogs.get(user);

        if (module.exports.handlers.has(dialog.name)) {
            const dialogIsDone = await module.exports.handlers.get(dialog.name).handle(message, message.channel, dialog);
            if (dialogIsDone) {
                dialogs.delete(user);
            }
        }
    });

    // Call the handleInteraction function of the correct handler on interactionCreate
    client.on('interactionCreate', async interaction => {

        const dialogs = interaction.client.dialogs;
        const user = interaction.user;

        if (!dialogs.has(user)) return;

        const dialog = dialogs.get(user);

        if (module.exports.handlers.has(dialog.name)) {
            const dialogIsDone = await module.exports.handlers.get(dialog.name).handleInteraction(interaction, dialog);
            if (dialogIsDone) {
                dialogs.delete(user);
            }
        }
    });
};
