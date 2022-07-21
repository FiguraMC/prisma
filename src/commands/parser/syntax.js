/**
 * Generate a syntax help string out of all overloads combined
 * @param {*} command 
 */
module.exports = (command) => {
    const syntax = [];
    command.overloads.forEach(overload => {
        const syntaxString = overload.arguments.map(arg => `<${arg.name}>`).join(' ');
        syntax.push(`\`${process.env.PREFIX}${command.name} ${syntaxString}\``);
    });
    return syntax.join('\n');
};
