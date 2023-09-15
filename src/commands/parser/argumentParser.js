/* 
 * Note convention for command arguments:
 * 
 * Overloads must differ in the amount of arguments they accept
 * Multiple overloads with same amount of arguments but different argument types are NOT SUPPORTED
 * 
 * If argument type is user, it must be first argument in the overload and it will use the author of replied message (if any) as an argument
 * 
 * If argument type is image, it must be the second (or more) argument in the overload and it will use the attachments (if any) as arguments
 * 
 * If argument type is textfile, it must be the last argument, or if multiple then all of them at the end (uses string urls or attachments as arguments)
 * 
 * Other argument types can be used in any order after the above
 * 
 * Maybe this limitation will be removed in the future
 */

const fs = require('fs');
const path = require('path');
const Argument = require('./argument');
const ArgumentContainer = require('./argumentContainer');
const CommandParseError = require('./commandParseError');

const argumentTypes = new Map();

// read argumenttypes folder and require all files in a loop
fs.readdirSync(path.join(__dirname, 'argumenttypes')).forEach(file => {
    if (file.endsWith('.js')) {
        const argumentType = require(path.join(__dirname, 'argumenttypes', file));
        argumentTypes.set(argumentType.type, argumentType);
    }
});

/**
 * Read string into groups of strings seperated by spaces
 * Quoted strings are not split apart until the closing quote
 * @param {string} string 
 * @param {import('discord.js').Message} repliedMessage The replied message if any, otherwise null
 * @param {import('discord.js').Collection<import('discord.js').Snowflake,import('discord.js').MessageAttachment>} attachments 
 * @returns {*} Object containing the "textArguments" as well as "reply" user id and "attachments" urls
 * @throws {CommandParseError} If quotes are not closed properly
 */
function read(string, repliedMessage, attachments) {
    // Split string into groups seperated by space or grouped by quotes
    const groups = [];
    let group = '';
    let inQuote = false;
    for (let i = 0; i < string.length; i++) {
        const char = string[i];
        if (char === '"') {
            inQuote = !inQuote;
        }
        else if (char === ' ' && !inQuote) {
            if (string[i + 1] !== ' ') {
                if (group !== '') groups.push(group);
                group = '';
            }
        }
        else {
            group += char;
        }
    }
    if (inQuote) {
        throw new CommandParseError('Unclosed quotation marks.');
    }
    if (group !== '') groups.push(group);

    const replyGroup = repliedMessage || null;
    const attachmentsGroups = attachments ? Array.from(attachments.values()).map(a => a.url) : [];

    return { textArguments: groups, reply: replyGroup, attachments: attachmentsGroups };
}

/**
 * Returns a command overload of a given command that has the correct amount of arguments
 * Every command can have multiple overloads, each with a different amount of arguments
 * @param {*} command 
 * @param {*} args 
 * @returns {*} A commmand overload with all used arguments as rawArgs string[] attached
 * @throws {CommandParseError} If no matching overload is found
 */
function select(command, args) {
    const rawArgs = [];

    if (command.overloads.find(o => o.arguments.find(a => a.type == 'user') != undefined)) {
        // if command has a user argument, use reply as argument in addition to text arguments
        if (args.reply) rawArgs.push(args.reply.author.id);
    }

    if (command.overloads.find(o => o.arguments.find(a => a.type == 'message') != undefined)) {
        // if command has a message argument, use reply as argument in addition to text arguments
        if (args.reply) rawArgs.push(args.reply);
    }

    if (command.overloads.find(o => o.arguments.find(a => a.type == 'image') != undefined)) {
        // if command has an image argument, use attachments and reply (for pfp) as arguments in addition to text arguments
        if (args.reply) rawArgs.push(args.reply.author.id);
        rawArgs.push(...args.attachments);
    }

    // always use text arguments
    rawArgs.push(...args.textArguments);

    if (command.overloads.find(o => o.arguments.find(a => a.type == 'textOrFile') != undefined)) {
        // if command has textfile argument, use attachments. are added at the end even after the other text arguments
        rawArgs.push(...args.attachments);
    }

    // select a command overload based on the number of arguments
    let overload;
    for (let i = 0; i < command.overloads.length; i++) {
        if (command.overloads[i].arguments.length == rawArgs.length) {
            overload = command.overloads[i];
        }
    }
    if (overload == undefined) throw new CommandParseError(`No overload found for command "${command.name}" with ${rawArgs.length} arguments.`);
    // attach all used arguments to the overload
    overload.rawArgs = rawArgs;
    return overload;
}

/**
 * Attempts to parse an array of strings into the correct types that are required by the overload
 * @param {*} overload A command overload with rawArgs attached
 * @param {import('discord.js').Message} commandMessage The message the user sent that triggered the command
 * @returns {import('./argumentContainer')} ArgumentContainer including the parsed and validated arguments
 * @throws {CommandParseError} If any arguments are not valid
 */
async function parse(overload, commandMessage) {
    // parse argument groups into Argument objects according to the overload
    const parsedArgs = [];
    for (let i = 0; i < overload.arguments.length; i++) {
        const arg = overload.arguments[i];
        const group = overload.rawArgs[i];
        const validated = await argumentTypes.get(arg.type).validate(group, arg.options, commandMessage); // validate() throws CommandParseError
        parsedArgs.push(new Argument(arg.name, arg.type, {}, validated));
    }
    return new ArgumentContainer(parsedArgs);
}

module.exports.read = read;
module.exports.parse = parse;
module.exports.select = select;
