const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const { SlashCommandBuilder } = require('@discordjs/builders');
const docs = require('../../../storage/docs.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('docs')
        .setDescription('Display Figura documentation')
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
            answer += `**<:_:${emoji(entry.type)}>** [${entry.name + (entry.type == 'method' ? '()' : '')}](<${entry.url}>)\n`;
            answer += entry.description;
            await interaction.reply(answer).catch(console.error);
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
function search(name, original) {
    original = original ?? name;
    const entry = docs.find(element => element.name == name);
    if (!entry) {
        const split1 = name.split('#');
        const split2 = name.split('.');
        const x = split1.length > split2.length;
        const classname = x ? split1[0] : split2[0];
        const methodname = x ? split1[1] : split2[1];
        const clas = docs.find(element => element.name == classname);
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
