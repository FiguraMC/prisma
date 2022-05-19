const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const { SlashCommandBuilder } = require('@discordjs/builders');
const docs = require('../../../storage/docs.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('docs')
        .setDescription('Display Figura 0.1.0 documentation')
        .addStringOption(option => option.setName('query').setDescription('Class or Class#method or Class.property combination to search for').setAutocomplete(true))
        .addUserOption(option => option.setName('target').setDescription('User to mention').setRequired(false)),
    usage: '`/docs <query> [target]` - Display Figura documentation.',
    allowInOtherGuilds: true,
    /**
     * 
     * @param {Discord.CommandInteraction} interaction 
     */
    async execute(interaction) {
        const name = interaction.options.getString('query');
        const entry = search(name);
        if (entry) {
            const user = interaction.options.getUser('target');
            let answer = '';
            if (user) {
                answer += `*Documentation suggestion for ${user}:*\n`;
            }
            answer += entry;
            await interaction.reply(answer.substring(0, 2000)).catch(console.error);
        }
        else {
            await interaction.reply({ content: `Unable to get documentation for \`${name}\`.`, ephemeral: true }).catch(console.error);
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
                        let lines = '';
                        for (let i = 0; i < method.parameters.length; i++) {
                            let params = '';
                            for (let j = 0; j < method.parameters[i].length; j++) {
                                params += `${method.parameters[i][j].type} ${method.parameters[i][j].name}, `;
                            }
                            if (method.parameters[i].length > 0) params = params.substring(0, params.length - 2);
                            lines += `<:_:${emoji('method')}> ${(className != 'globals' ? className + '#' : '')}${method.name}(${params}): Returns ${method.returns[i]}\n`;
                        }
                        lines += '\n' + method.description;
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
                        return `<:_:${emoji('property')}> ${(className != 'globals' ? className + '.' : '')}${field.name}: ${field.type} ${(field.editable ? '(Editable)' : '(Not Editable)')}\n\n${field.description}`;
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
                return `<:_:${emoji('class')}> ${api.name}\n\n${api.description}`;
            }
        }
    }
}

const emojis = process.env.CLASS_METHOD_PROPERTY_EMOJI.split(',');

/**
 * Returns an emoji for the type of the documentation item
 * (Class, Method, Property)
 * @param {String} type 
 * @returns 
 */
function emoji(type) {
    if (type == 'class') {
        return emojis[0];
    }
    else if (type == 'method') {
        return emojis[1];
    }
    else if (type == 'property') {
        return emojis[2];
    }
}
