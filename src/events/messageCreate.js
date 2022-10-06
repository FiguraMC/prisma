const ScamFilter = require('../filters/scamFilter');
const NsfwFilter = require('../filters/nsfwFilter');
const ShowcaseFilter = require('../filters/showcaseFilter');
const FaqFilter = require('../filters/faqFilter');
const utility = require('../util/utility');
const parser = require('../commands/parser/argumentParser');
const CommandParseError = require('../commands/parser/commandParseError');
const syntax = require('../commands/parser/syntax');
const pluralkit = require('../util/pluralkit');
const DataStorage = require('../util/dataStorage');

module.exports = {
    name: 'messageCreate',
    /**
     * 
     * @param {import('discord.js').Message} message 
     */
    async execute(message) {

        if (message.author.id == message.client.user.id) return; // Ignore self

        // Detect if this user is using PK to auto-enable PK support for commands
        if (message.content.startsWith('pk;')) {
            DataStorage.pksettings.userlist = DataStorage.pksettings.userlist || new Set();
            if (!DataStorage.pksettings.userlist.has(message.author.id)) {
                DataStorage.pksettings.userlist.add(message.author.id);
                DataStorage.save('pksettings');
            }
        }

        // Prefix commands handling
        if (message.content.startsWith(process.env.PREFIX)) {

            // If user has pk support turned on
            if (DataStorage.pksettings.userlist?.has(message.author.id)) {
                // Wait 1.5 seconds to give PluralKit some time
                await new Promise(resolve => setTimeout(resolve, 1500));
                const pkMessageData = await pluralkit.getMessage(message.id);
                if (pkMessageData) {
                    // This either means its a proxied message, or a user message that will be or alrady is deleted
                    // If its a normal message, ignore
                    if (!message.author.bot) return;
                    // If its a proxied message, get the author of the original and attach it to the message
                    const member = await message.guild.members.fetch(pkMessageData.sender);
                    const user = member.user;
                    message.member = member;
                    message.author = user;
                    // Get the reference (reply) if there is one, PK attaches that as an embed with clickable link
                    if (message.embeds.length > 0) {
                        const referenceMessageUrl = /\[Reply to:\]\((.+)\)/.exec(message.embeds[0].description);
                        const referenceMessageId = referenceMessageUrl[1].substring(referenceMessageUrl[1].lastIndexOf('/') + 1);
                        const referenceMessage = await message.channel.messages.fetch(referenceMessageId);
                        message.reference = true;
                        message.fetchReference = () => Promise.resolve(referenceMessage);
                    }
                    
                }
                else if (message.author.bot) {
                    return; // Ignore bots but allow pluralkit webhooks
                }
            }
            else if (message.author.bot) {
                return; // Ignore bots
            }

            const commandName = message.content.split(/ +/).shift().toLowerCase().substring(process.env.PREFIX.length);
            const command = message.client.prefixCommands.get(commandName);

            // If command doesnt exist, return
            if (!command) return;

            // Only allow commands that have dm property set to true in DMs
            if (message.channel.type == 'DM') {
                if (!command.dm) return message.channel.send(utility.buildEmbed('Commands don\'t work in DMs.'));
            }
            else {
                // Guild and Permission check only works in guilds.
                // Note that this means anyone could use a moderator command
                // if that command has the dm property set to true.

                // If not in main guild only allow specific commands
                if (message.guild?.id != process.env.MAIN_GUILD && !command.allowInOtherGuilds) return;

                // Check if command needs moderator or helper perms
                let isAllowedToUse = false;
                if (command.moderator) {
                    isAllowedToUse |= utility.isModerator(message.member);
                }
                if (command.helper) {
                    isAllowedToUse |= utility.isHelper(message.member);
                }
                if (!command.moderator && !command.helper) {
                    isAllowedToUse = true;
                }
                if (!isAllowedToUse) return;
            }

            // Remove any expired cooldowns
            message.client.cooldowns.forEach((userCooldowns) => {
                for (const key in userCooldowns) {
                    if (Object.hasOwnProperty.call(userCooldowns, key)) {
                        const cooldown = userCooldowns[key];
                        if (cooldown < Date.now()) {
                            delete userCooldowns[key];
                        }
                    }
                }
                if (Object.keys(userCooldowns).length == 0) {
                    message.client.cooldowns.delete(message.author.id);
                }
            });
            // Check for cooldowns (Moderators are immune)
            if (command.cooldown && !utility.isModerator(message.member)) {
                let userCooldowns;
                if (message.client.cooldowns.has(message.author.id)) {
                    userCooldowns = message.client.cooldowns.get(message.author.id);
                }
                else {
                    userCooldowns = {};
                }
                // If a cooldown for the command is still there after removing expired ones, return
                if (userCooldowns[command.name]) {
                    const timeLeft = (userCooldowns[command.name] - Date.now()) / 1000;
                    return message.channel.send(utility.buildEmbed('Please wait ' + (timeLeft > 60 ? (timeLeft / 60).toFixed(2) + ' minutes' : timeLeft.toFixed(2) + ' seconds') + ' before using this command again.'));
                }
                // Add new cooldown to user
                userCooldowns[command.name] = Date.now() + command.cooldown;
                message.client.cooldowns.set(message.author.id, userCooldowns);
            }

            // Execute the command

            if (command.overloads) {
                // Parse arguments and execute correct overload
                try {
                    const argumentString = message.content.substring(process.env.PREFIX.length + command.name.length + 1);
                    const reply = message.reference ? await message.fetchReference() : null;

                    const args = parser.read(argumentString, reply, message.attachments);
                    const overload = parser.select(command, args);
                    overload.execute(message, await parser.parse(overload, message.client, message.guild));
                }
                catch (error) {
                    if (error instanceof CommandParseError) {
                        message.reply((`**Syntax error: **${error.message}\n${syntax(command)}`));
                    }
                    else {
                        message.reply('There was an error while executing this command.');
                        console.error(error);
                    }
                }
            }
            else {
                // Legacy command, just takes split string
                try {
                    const args = message.content.split(/ +/).slice(1);
                    await command.execute(message, args);
                }
                catch (error) {
                    message.reply('There was an error while executing this command.');
                    console.error(error);
                }
            }

        }
        // If not a command and in a guild (not in DM), do some chat filter stuff
        else if (message.guild) {
            ScamFilter.filter(message);
            NsfwFilter.filter(message);
            ShowcaseFilter.filter(message);
            FaqFilter.filter(message);
        }
    },
};
