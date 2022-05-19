const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const levenshtein = require('fastest-levenshtein');
const { startDialog, canStartDialog } = require('../dialogs/startDialog');
const DataStorage = require('../util/dataStorage');
const utility = require('../util/utility');
const confirmationButtons = require('../components/confirmationButtons');
const closeTicketButton = require('../components/closeTicketButton');
const docs_old = require('../../storage/docs_old.json');
const docs = require('../../storage/docs.json');
const ticketMenu = require('../components/ticketMenu');

module.exports = {
    name: 'interactionCreate',
    /**
     * 
     * @param {Discord.Interaction} interaction 
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
                await interaction.reply({ content: 'There was an error while executing this command!' }).catch(console.error);
            }
        }
        // Handle buttons
        else if (interaction.isButton()) {
            // New avatar request button at the bottom of the requests channel
            if (interaction.customId == 'new_avatar_request') {
                // Update button so it doesnt timeout
                interaction.deferUpdate().catch(console.error);
                // Check bans
                if (DataStorage.storage.people[interaction.user.id]?.requestban) return interaction.user.send(utility.buildEmbed('Sorry, you can\'t create a request at the moment.'));

                // Attempt to start avatar request creation dialog
                if (canStartDialog(interaction.client, interaction.user)) {
                    await interaction.user.send(utility.buildEmbed('New Avatar Request', 'We will now fill in the details of the request. Take your time to read the descriptions to ensure to make a high quality request. Low quality ones might get deleted by a moderator. You can type "cancel" at any point if you make a mistake.', []));
                    startDialog(interaction.client, interaction.user, 'createAvatarRequest');
                }
                else {
                    interaction.user.send(utility.buildEmbed('Please finish the current dialog first.'));
                }
            }
            // Close ticket button attached to each ticket
            // Replaces itself with the two confirmation buttons
            else if (interaction.customId == 'close_ticket_button') {
                interaction.update({ embeds: interaction.message.embeds, components: [confirmationButtons] });
            }
            // Confirm close ticket
            else if (interaction.customId == 'close_ticket_confirmation_button_yes') {
                if (interaction.message?.thread) {
                    // Update visuals and remove buttons
                    const updatedEmbed = interaction.message.embeds[0];
                    if (updatedEmbed) updatedEmbed.title = '🔒' + updatedEmbed.title.substring(1);
                    interaction.update({ embeds: [updatedEmbed], components: [] }).catch(console.error);
                    // Notify user, archive thread and delete ticket from storage
                    const ticket = DataStorage.storage.tickets?.find(x => x.thread == interaction.message.thread.id);
                    const author = await interaction.guild.members.fetch(ticket?.author).catch(console.error);
                    author?.send(utility.buildEmbed('🔒 Your ticket has been closed.')).catch(console.error);
                    DataStorage.storage.tickets = DataStorage.storage.tickets?.filter(x => x.thread != interaction.message.thread.id);
                    DataStorage.save('storage');
                    await interaction.message.thread.send(utility.buildEmbed('🔒 Ticket has been closed.')).catch(console.error);
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
        // Handle /docs_old command autocomplete
        else if (interaction.isAutocomplete() && interaction.commandName == 'docs_old') {
            const search = interaction.options.getFocused().toLowerCase(); // the text the user is currently typing
            const results = browseDocs_old(search); // find matching docs entries
            results.sort((a, b) => a.levenshtein - b.levenshtein); // sort by levenshtein distance
            interaction.respond(results.slice(0, 25)).catch(console.error); // max of 25 autocomplete entries allowed
        }
        // Handle /docs command autocomplete
        else if (interaction.isAutocomplete() && interaction.commandName == 'docs') {
            const search = interaction.options.getFocused().toLowerCase(); // the text the user is currently typing
            const results = browseDocs(search); // find matching docs entries
            results.sort((a, b) => a.levenshtein - b.levenshtein); // sort by levenshtein distance
            interaction.respond(results.slice(0, 25)).catch(console.error); // max of 25 autocomplete entries allowed
        }
    },
};

/**
 * Finds matches for the search string in the 0.0.8 docs
 * Checks inheritance to provide methods and fields
 * @param {String} search The search string
 * @param {*} branch Used for recursion, just leave it undefined
 * @param {*} results Used for recursion, just leave it undefined
 * @returns Array of possible matches
 */
function browseDocs_old(search, branch, results) {
    branch = branch ?? docs_old;
    results = results ?? [];
    branch.forEach(entry => {
        if (similar(entry.name.toLowerCase(), search)) {
            if (!results.find(e => e.name == entry.name)) {
                results.push({ name: entry.name, value: entry.name, levenshtein: levenshtein.distance(entry.name, search) });
            }
        }
        if (entry.extends) {
            let parent = JSON.parse(JSON.stringify(docs_old));
            parent = parent.filter(e => e.name.match(`^${utility.escapeRegExp(entry.extends)}[#\\.]`) || e.name == entry.extends);
            parent.forEach(e => {
                e.name = e.name.replace(entry.extends, entry.name);
            });
            results = browseDocs_old(search, parent, results);
        }
    });
    return results;
}

/**
 * Finds matches for the search string in the 0.1.0 docs
 * @param {String} search The search string
 * @returns Array of possible matches
 */
function browseDocs(search) {
    const results = [];
    // eslint-disable-next-line no-unused-vars
    for (const [_, group] of Object.entries(docs)) {
        group.forEach(api => {
            if (similar(api.name.toLowerCase(), search)) {
                results.push({ name: api.name, value: api.name, levenshtein: levenshtein.distance(api.name, search) });
            }
            api.fields.forEach(field => {
                if (similar(api.name.toLowerCase() + field.name.toLowerCase(), search.replaceAll(/[#.]/g, ''))) {
                    const prefix = api.name + '.';
                    results.push({ name: prefix + field.name, value: prefix + field.name, levenshtein: levenshtein.distance(field.name, search) });
                }
            });
            api.methods.forEach(method => {
                if (similar(api.name.toLowerCase() + method.name.toLowerCase(), search.replaceAll(/[#.]/g, ''))) {
                    const prefix = api.name + '#';
                    results.push({ name: prefix + method.name, value: prefix + method.name, levenshtein: levenshtein.distance(method.name, search) });
                }
            });

        });
    }

    return results;
}

function similar(text, search) {
    return text.match(search.split('').join('.*'));
}
