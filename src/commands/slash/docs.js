const { SlashCommandBuilder } = require('@discordjs/builders');
const docs = require('../../../storage/docs.json');

module.exports = {
    name: 'docs',
    data: new SlashCommandBuilder()
        .setName('docs')
        .setDescription('Display Figura 0.1.0 documentation')
        .addStringOption(option => option.setName('query').setDescription('Class or Class#method or Class.property combination to search for').setAutocomplete(true))
        .addUserOption(option => option.setName('target').setDescription('User to mention').setRequired(false)),
    description: 'Display Figura documentation.',
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
    if (name.includes('#')) {
        const parts = name.split('#');
        const className = parts[0];
        const methodName = parts[1];
        // eslint-disable-next-line no-unused-vars
        for (const [_, group] of Object.entries(docs)) {
            const api = group.find(a => a.name == className);
            if (api) {
                for (const method of api.methods) {
                    if (method.name == methodName) {
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
                }
            }
        }
    }
    else if (name.includes('.')) {
        const parts = name.split('.');
        const className = parts[0];
        const fieldName = parts[1];
        // eslint-disable-next-line no-unused-vars
        for (const [_, group] of Object.entries(docs)) {
            const api = group.find(a => a.name == className);
            if (api) {
                for (const field of api.fields) {
                    if (field.name == fieldName) {
                        return `\`\`\`ansi\n\u001b[0;35mField\n\u001b[0;33m${field.type} \u001b[0;34m${(className != 'globals' ? className + '.' : '')}${field.name} ${(field.editable ? '\u001b[0;32m(Editable)' : '\u001b[0;31m(Not Editable)')}\n\n\u001b[0;35mDescription\n\u001b[0;37m${field.description}\`\`\``;
                    }
                }
            }
        }
    }
    else {
        // eslint-disable-next-line no-unused-vars
        for (const [_, group] of Object.entries(docs)) {
            const api = group.find(a => a.name == name);
            if (api) {
                return `\`\`\`ansi\n\u001b[0;35mClass\n\u001b[0;34m${api.name}\n\n\u001b[0;35mDescription\n\u001b[0;37m${api.description}\`\`\``;
            }
        }
    }
}
