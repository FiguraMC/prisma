const levenshtein = require('fastest-levenshtein');
const DataStorage = require('../util/dataStorage');
const utility = require('../util/utility');
const confirmationButtons = require('../components/confirmationButtons');
const closeTicketButton = require('../components/closeTicketButton');
const docs = require('../../storage/docs.json');
const ticketMenu = require('../components/ticketMenu');

module.exports = {
    name: 'interactionCreate',
    /**
     * 
     * @param {import('discord.js').Interaction} interaction 
     */
    async execute(interaction) {

        // Handle slash commands
        if (interaction.isCommand()) {
            const command = interaction.client.slashCommands.get(interaction.commandName);

            // If command doesnt exist, return
            if (!command) return;

            // If not in main guild only allow specific commands
            if (interaction.guild?.id != process.env.MAIN_GUILD && !command.allowInOtherGuilds) return;

            try {
                await command.execute(interaction);
            }
            catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this command!' }).catch(console.ignore);
            }
        }
        // Handle buttons
        else if (interaction.isButton()) {
            // Close ticket button attached to each ticket
            // Replaces itself with the two confirmation buttons
            if (interaction.customId == 'close_ticket_button') {
                interaction.update({ embeds: interaction.message.embeds, components: [confirmationButtons] }).catch(console.ignore);
            }
            // Confirm close ticket
            else if (interaction.customId == 'close_ticket_confirmation_button_yes') {
                if (interaction.message?.thread) {
                    // Update visuals and remove buttons
                    const updatedEmbed = interaction.message.embeds[0];
                    if (updatedEmbed) updatedEmbed.title = '🔒' + updatedEmbed.title.substring(1);
                    interaction.update({ embeds: [updatedEmbed], components: [] }).catch(console.ignore);
                    // Notify user, archive thread and delete ticket from storage
                    const ticket = DataStorage.storage.tickets?.find(x => x.thread == interaction.message.thread.id);
                    const author = await interaction.guild.members.fetch(ticket?.author).catch(console.ignore);
                    author?.send(utility.buildEmbed('🔒 Your ticket has been closed.')).catch(console.ignore);
                    DataStorage.storage.tickets = DataStorage.storage.tickets?.filter(x => x.thread != interaction.message.thread.id);
                    DataStorage.save('storage');
                    await interaction.message.thread.send(utility.buildEmbed('🔒 Ticket has been closed.')).catch(console.ignore);
                    interaction.message.thread.setArchived(true);
                }
            }
            // Cancel close ticket
            // Replaces itself with the close ticket button
            else if (interaction.customId == 'close_ticket_confirmation_button_no') {
                interaction.update({ embeds: interaction.message.embeds, components: [closeTicketButton] });
            }
            // Subscribe to tickets
            else if (interaction.customId == 'subscribe_to_tickets') {
                if (!DataStorage.storage.ticketsubscribers) DataStorage.storage.ticketsubscribers = [];
                if (!DataStorage.storage.ticketsubscribers.find(x => x == interaction.user.id)) {
                    DataStorage.storage.ticketsubscribers.push(interaction.user.id);
                    DataStorage.save('storage');
                    interaction.update({
                        content: '\u200b',
                        embeds: [{
                            title: 'Ticket notifications.',
                            description: '<@' + DataStorage.storage.ticketsubscribers.join('>\n<@') + '>',
                        }],
                        components: [ticketMenu],
                    });
                }
                else {
                    interaction.deferUpdate();
                }
            }
            // Unsubscribe from tickets
            else if (interaction.customId == 'unsubscribe_from_tickets') {
                if (!DataStorage.storage.ticketsubscribers) DataStorage.storage.ticketsubscribers = [];
                if (DataStorage.storage.ticketsubscribers.find(x => x == interaction.user.id)) {
                    DataStorage.storage.ticketsubscribers = DataStorage.storage.ticketsubscribers.filter(x => x != interaction.user.id);
                    DataStorage.save('storage');
                    interaction.update({
                        content: '\u200b',
                        embeds: [{
                            title: 'Ticket notifications.',
                            description: '<@' + DataStorage.storage.ticketsubscribers.join('>\n<@') + '>',
                        }],
                        components: [ticketMenu],
                    });
                }
                else {
                    interaction.deferUpdate();
                }
            }
        }
        // Handle /docs command autocomplete
        else if (interaction.isAutocomplete() && interaction.commandName == 'docs') {
            const search = interaction.options.getFocused().toLowerCase(); // the text the user is currently typing
            const results = browseDocs(search); // find matching docs entries
            results.sort((a, b) => a.levenshtein - b.levenshtein); // sort by levenshtein distance
            interaction.respond(results.slice(0, 25)).catch(console.ignore); // max of 25 autocomplete entries allowed
        }
    },
};

/**
 * Finds matches for the search string in the 0.1.0 docs
 * @param {String} search The search string
 * @returns Array of possible matches
 */
function browseDocs(search) {
    const results = [];
    function check(category, parent) {
        parent = parent ?? category;
        const isGlobal = parent.name == 'globals';
        const prefix_m = isGlobal ? '' : parent.name + '#';
        category.methods.forEach(method => {
            if (similar(prefix_m + method.name.toLowerCase(), search)) {
                results.push({ name: prefix_m + method.name, value: prefix_m + method.name, levenshtein: levenshtein.distance(prefix_m + method.name, search) });
            }
        });
        const prefix_f = isGlobal ? '' : category.name + '.';
        category.fields.forEach(field => {
            if (similar(prefix_f + field.name.toLowerCase(), search)) {
                results.push({ name: prefix_f + field.name, value: prefix_f + field.name, levenshtein: levenshtein.distance(prefix_f + field.name, search) });
            }
            if (field.children?.length > 0) {
                field.children.forEach(child => {
                    check(child, field);
                });
            }
        });
    }
    for (const [, category] of Object.entries(docs)) {
        if (Array.isArray(category)) {
            category.forEach(list => {
                const prefix = list.name + '.';
                list.entries.forEach(entry => {
                    if (similar((prefix + entry).toLowerCase(), search)) {
                        results.push({ name: prefix + entry, value: prefix + entry, levenshtein: levenshtein.distance(prefix + entry, search) });
                    }
                });
            });
        }
        else {
            check(category);
        }
    }
    return results;
}

function similar(text, search) {
    return text.match(search.split('').join('.*'));
}
