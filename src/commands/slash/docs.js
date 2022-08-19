const { SlashCommandBuilder } = require('@discordjs/builders');
const docs = require('../../../storage/docs.json');

module.exports = {
    name: 'docs',
    data: new SlashCommandBuilder()
        .setName('docs')
        .setDescription('Display Figura 0.1.0 documentation.')
        .addStringOption(option => option.setName('query').setDescription('Class or Class#method or Class.property combination to search for').setAutocomplete(true))
        .addUserOption(option => option.setName('target').setDescription('User to mention').setRequired(false)),
    description: 'Display Figura 0.1.0 documentation.',
    allowInOtherGuilds: true,
    /**
     * 
     * @param {import('discord.js').CommandInteraction} interaction 
     */
    async execute(interaction) {
        const name = interaction.options.getString('query');
        if (!name) return interaction.reply({ content: 'Please specify a class or class#method or class.property combination to search for.', ephemeral: true }).catch(console.ignore);
        const entry = search(name);
        if (entry) {
            const user = interaction.options.getUser('target');
            let answer = '';
            if (user) {
                answer += `*Documentation suggestion for ${user}:*\n`;
            }
            answer += entry;
            await interaction.reply(answer.substring(0, 2000)).catch(console.ignore);
        }
        else {
            await interaction.reply({ content: `Unable to get documentation for \`${name}\`.`, ephemeral: true }).catch(console.ignore);
        }
    },
};

/**
 * Searches for the docs entry that belongs to the specified name
 * Checks inheritance to find it
 * @param {String} name The name to search for
 * @param {String} original Used for recursion, just leave it undefined
 * @returns Documentation entry
 */
function search(name) {
    const isMethod = name.includes('#');
    const isField = name.includes('.');
    const isGlobal = !(isField || isMethod);
    const separator = isMethod ? '#' : '.';
    const className = name.split(separator)[0];
    const fieldOrMethod = name.split(separator)[1];
    if (isGlobal) {
        const m = docs.globals.methods.find(method => method.name == name);
        if (m) return constructMethodMessage('globals', m);
        const f = docs.globals.fields.find(method => method.name == name);
        return constructFieldMessage('globals', f);
    }
    for (const [ , category] of Object.entries(docs)) {
        if (!isGlobal && category.name == 'globals') {
            const globalField = category.fields.find(field => field.name == className);
            if (!globalField) continue;
            for (const child of globalField.children) {
                if (isMethod) {
                    const method = child.methods.find(m => m.name == fieldOrMethod);
                    if (method) return constructMethodMessage(className, method);
                }
                else {
                    const field = child.fields.find(m => m.name == fieldOrMethod);
                    if (field) return constructFieldMessage(className, field);
                }
            }
        }
        else if (!isGlobal && Array.isArray(category)) {
            const list = category.find(entry => entry.name == className);
            if (!list) continue;
            return '```json\n"' + list.entries.join('",\n"') + '"\n```';
        }
        else if (category.name == className) {
            if (isMethod) {
                const m = category.methods.find(method => method.name == fieldOrMethod);
                return constructMethodMessage(className, m);
            }
            else {
                const f = category.fields.find(field => field.name == fieldOrMethod);
                return constructFieldMessage(className, f);
            }
        }
    }
}

function constructFieldMessage(className, field) {
    return `\`\`\`ansi\n\u001b[0;35mField\n\u001b[0;33m${field.type} \u001b[0;34m${(className != 'globals' ? className + '.' : '')}${field.name} ${(field.editable ? '\u001b[0;32m(Editable)' : '\u001b[0;31m(Not Editable)')}\n\n\u001b[0;35mDescription\n\u001b[0;37m${field.description}\`\`\``;
}

function constructMethodMessage(className, method) {
    if (method.parameters.length != method.returns.length) return 'Unexpected error occured, please report this to a staff member.';
    let lines = '```ansi\n\u001b[0;35mMethod\n';
    for (let i = 0; i < method.parameters.length; i++) {
        let params = '';
        for (let j = 0; j < method.parameters[i].length; j++) {
            params += `\u001b[0;33m${method.parameters[i][j].type} \u001b[0;37m${method.parameters[i][j].name}, `;
        }
        if (method.parameters[i].length > 0) params = params.substring(0, params.length - 2);
        lines += `\u001b[0;34m${(className != 'globals' ? className + '.' : '')}${method.name}\u001b[0;35m(${params}\u001b[0;35m): \u001b[0;34mReturns \u001b[0;33m${method.returns[i]}\n`;
    }
    lines += '\n\u001b[0;35mDescription\n\u001b[0;37m' + method.description + '```';
    return lines;
}
