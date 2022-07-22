const { SlashCommandBuilder } = require('@discordjs/builders');
const docs_old = require('../../../storage/docs_old.json');

module.exports = {
    name: 'docs_old',
    data: new SlashCommandBuilder()
        .setName('docs_old')
        .setDescription('Display Figura 0.0.8 documentation')
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
            answer += `<:_:${emoji(entry.type)}> [${entry.name + (entry.type == 'method' ? '()' : '')}](<${entry.url}>)\n`;
            answer += entry.description;
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
function search(name, original) {
    original = original ?? name;
    const entry = docs_old.find(element => element.name == name);
    if (!entry) {
        const split1 = name.split('#');
        const split2 = name.split('.');
        const x = split1.length > split2.length;
        const classname = x ? split1[0] : split2[0];
        const methodname = x ? split1[1] : split2[1];
        const clas = docs_old.find(element => element.name == classname);
        if (clas?.extends) {
            return search(clas.extends + (x ? '#' : '.') + methodname, original);
        }
        else {
            return null;
        }
    }
    else {
        entry.name = original;
        return entry;
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
