const { SlashCommandBuilder } = require('@discordjs/builders');
const DataStorage = require('../../util/dataStorage');

module.exports = {
    name: 'settings',
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Show or change server specific settings.')
        .addStringOption((option) => option.setName('name').setDescription('The setting to show or change.').setRequired(false).setChoices([
            ['Backend Status Channel ID', 'backend_status_channel'],
            ['Log Channel ID', 'log_channel'],
            ['Moderation Log Channel ID', 'mod_log_channel'],
            ['Muted Role ID', 'muted_role'],
            ['Clear Roles On Mute (yes/no)', 'clear_roles_on_mute'],
            ['Enable Scam Filter (yes/no)', 'enable_scam_filter'],
            ['Enable Message Logging (yes/no)', 'enable_message_logging'],
        ]))
        .addStringOption((option) => option.setName('value').setDescription('The value to set the setting to.').setRequired(false)),
    description: 'Show or change server specific settings.',
    allowInOtherGuilds: true,
    /**
     * 
     * @param {import('discord.js').CommandInteraction} interaction 
     */
    async execute(interaction) {
        if (!interaction.guild) return interaction.reply('This command can only be used in your server.');
        if (!interaction.memberPermissions.has('ADMINISTRATOR')) return interaction.reply('You do not have permission to use this command.');

        if (!DataStorage.guildsettings.guilds) DataStorage.guildsettings.guilds = new Map();

        if (!DataStorage.guildsettings.guilds.has(interaction.guild.id)) {
            DataStorage.guildsettings.guilds.set(interaction.guild.id, new Map());
            
            // Set default values
            DataStorage.guildsettings.guilds.get(interaction.guild.id).set('backend_status_channel', null);
            DataStorage.guildsettings.guilds.get(interaction.guild.id).set('log_channel', null);
            DataStorage.guildsettings.guilds.get(interaction.guild.id).set('mod_log_channel', null);
            DataStorage.guildsettings.guilds.get(interaction.guild.id).set('muted_role', null);
            DataStorage.guildsettings.guilds.get(interaction.guild.id).set('clear_roles_on_mute', 'no');
            DataStorage.guildsettings.guilds.get(interaction.guild.id).set('enable_scam_filter', 'no');
            DataStorage.guildsettings.guilds.get(interaction.guild.id).set('enable_message_logging', 'no');

            DataStorage.save('guildsettings');
        }

        const name = interaction.options.getString('name');
        let value = interaction.options.getString('value');

        if (name == null && value == null) {
            interaction.reply('```json\n' +
                '"Backend Status Channel ID": ' + DataStorage.guildsettings.guilds.get(interaction.guild.id).get('backend_status_channel') + '\n' +
                '"Log Channel ID": ' + DataStorage.guildsettings.guilds.get(interaction.guild.id).get('log_channel') + '\n' +
                '"Moderation Log Channel ID": ' + DataStorage.guildsettings.guilds.get(interaction.guild.id).get('mod_log_channel') + '\n' +
                '"Muted Role ID": ' + DataStorage.guildsettings.guilds.get(interaction.guild.id).get('muted_role') + '\n' +
                '"Clear Roles On Mute": ' + DataStorage.guildsettings.guilds.get(interaction.guild.id).get('clear_roles_on_mute') + '\n' +
                '"Enable Scam Filter": ' + DataStorage.guildsettings.guilds.get(interaction.guild.id).get('enable_scam_filter') + '\n' +
                '"Enable Message Logging": ' + DataStorage.guildsettings.guilds.get(interaction.guild.id).get('enable_message_logging') + '\n' +
                '```');
        }
        else if (name != null && value == null) {
            switch (name) {
                case 'backend_status_channel':
                    interaction.reply('The backend status channel is currently set to ' + DataStorage.guildsettings.guilds.get(interaction.guild.id).get('backend_status_channel') + '.');
                    break;
                case 'log_channel':
                    interaction.reply('The log channel is currently set to ' + DataStorage.guildsettings.guilds.get(interaction.guild.id).get('log_channel') + '.');
                    break;
                case 'mod_log_channel':
                    interaction.reply('The moderation log channel is currently set to ' + DataStorage.guildsettings.guilds.get(interaction.guild.id).get('mod_log_channel') + '.');
                    break;
                case 'muted_role':
                    interaction.reply('The muted role is currently set to ' + DataStorage.guildsettings.guilds.get(interaction.guild.id).get('muted_role') + '.');
                    break;
                case 'clear_roles_on_mute':
                    interaction.reply('The clear roles on mute setting is currently set to ' + DataStorage.guildsettings.guilds.get(interaction.guild.id).get('clear_roles_on_mute') + '.');
                    break;
                case 'enable_scam_filter':
                    interaction.reply('The enable scam filter setting is currently set to ' + DataStorage.guildsettings.guilds.get(interaction.guild.id).get('enable_scam_filter') + '.');
                    break;
                case 'enable_message_logging':
                    interaction.reply('The enable message logging setting is currently set to ' + DataStorage.guildsettings.guilds.get(interaction.guild.id).get('enable_message_logging') + '.');
                    break;
                default:
                    interaction.reply('That setting does not exist.');
                    break;
            }
        }
        else if (name != null && value != null) {
            switch (name) {
                case 'backend_status_channel':
                    try { await interaction.guild.channels.fetch(value); }
                    catch { return interaction.reply('That channel does not exist.'); }
                    DataStorage.guildsettings.guilds.get(interaction.guild.id).set('backend_status_channel', value);
                    interaction.reply('The backend status channel has been set to ' + value + '.');
                    break;
                case 'log_channel':
                    try { await interaction.guild.channels.fetch(value); }
                    catch { return interaction.reply('That channel does not exist.'); }
                    DataStorage.guildsettings.guilds.get(interaction.guild.id).set('log_channel', value);
                    interaction.reply('The log channel has been set to ' + value + '.');
                    break;
                case 'mod_log_channel':
                    try { await interaction.guild.channels.fetch(value); }
                    catch { return interaction.reply('That channel does not exist.'); }
                    DataStorage.guildsettings.guilds.get(interaction.guild.id).set('mod_log_channel', value);
                    interaction.reply('The moderation log channel has been set to ' + value + '.');
                    break;
                case 'muted_role':
                    if (!(await interaction.guild.roles.fetch(value))) { return interaction.reply('That role does not exist.'); }
                    DataStorage.guildsettings.guilds.get(interaction.guild.id).set('muted_role', value);
                    interaction.reply('The muted role has been set to ' + value + '.');
                    break;
                case 'clear_roles_on_mute':
                    if (value == 'yes' || value == 'true') { value = 'true'; }
                    else if (value == 'no' || value == 'false') { value = 'false'; }
                    else { return interaction.reply('Please put either "yes" or "no" or "true" or "false"'); }
                    DataStorage.guildsettings.guilds.get(interaction.guild.id).set('clear_roles_on_mute', value);
                    interaction.reply('The clear roles on mute setting has been set to ' + value + '.');
                    break;
                case 'enable_scam_filter':
                    if (value == 'yes' || value == 'true') { value = 'true'; }
                    else if (value == 'no' || value == 'false') { value = 'false'; }
                    else { return interaction.reply('Please put either "yes" or "no" or "true" or "false"'); }
                    DataStorage.guildsettings.guilds.get(interaction.guild.id).set('enable_scam_filter', value);
                    interaction.reply('The enable scam filter setting has been set to ' + value + '.');
                    break;
                case 'enable_message_logging':
                    if (value == 'yes' || value == 'true') { value = 'true'; }
                    else if (value == 'no' || value == 'false') { value = 'false'; }
                    else { return interaction.reply('Please put either "yes" or "no" or "true" or "false"'); }
                    DataStorage.guildsettings.guilds.get(interaction.guild.id).set('enable_message_logging', value);
                    interaction.reply('The enable message logging setting has been set to ' + value + '.');
                    break;
                default:
                    interaction.reply('That setting does not exist.');
                    break;
            }
            DataStorage.save('guildsettings');
        }
    },
};
