const luaparse = require('luaparse');

/**
 * Returns an array of found lua or no-language code blocks in a text message
 * @param {string} text 
 * @returns string[]
 */
function extractLuaCodeBlocks(text) {
    const codeBlockRegex = /```(?:lua)?\s+([\s\S]+?)\s*```/ig;
    const luaCodeBlocks = [];
    let match;
    while ((match = codeBlockRegex.exec(text)) !== null) {
        luaCodeBlocks.push(match[1].trim()); // Extracted Lua code without language specifier and extra whitespace
    }
    return luaCodeBlocks;
}

function preprocessLuaCode(luaCode) {
    // Remove < and > characters when a word is surrounded by them
    // This is because people often use them to show where to replace things, like:
    // models.<modelname>.<partname>:setPos(1,2,3)
    // will be treated as models.modelname.partname:setPos(1,2,3)
    // for the sake of syntax error check
    const replaceRegex = /<([A-Za-z]+)>/g;
    return luaCode.replace(replaceRegex, '$1');
}

/**
 * Try to find lua code when no backticks formatting is used
 * Only detects starting from two lines of code, inline code is not detected
 * @param {string} text 
 * @returns string array of length 1 of potential lua code, if backticks are found return empty array
 */
function detectPotentialLuaCode(text) {
    if (text.includes('`')) return [];

    const lines = text.split('\n');
    let startIndex = null;
    let endIndex = null;

    for (let i = 0; i < lines.length; i++) {
        // Simple heuristics to identify potential Lua code lines
        if (lines[i].match(/(local|return|else|end)/) || lines[i].match(/function.*\(/) || lines[i].match(/if\b.+\bthen/) || lines[i].match(/(while|for)\b.+\bdo/) || lines[i].match(/[.:]\w+\(/)) {
            if (startIndex === null) {
                startIndex = i;
            }
            else {
                endIndex = i;
            }
        }
    }

    if (startIndex !== null && endIndex !== null) return [lines.slice(startIndex, endIndex + 1).join('\n')];

    return [];
}

/**
 * Find lua code in a string and check if it contains a syntax error
 * @param {string} text 
 * @returns string if error found, else null
 */
function checkMessageForLuaError(text) {

    // Detect code blocks, or if not present try detecting potential lua code
    const luaCodeBlocks = extractLuaCodeBlocks(text).concat(detectPotentialLuaCode(text));

    // Check each individual code block for syntax errors
    let errors = '';
    for (let i = 0; i < luaCodeBlocks.length; i++) {
        try {
            luaparse.parse(preprocessLuaCode(luaCodeBlocks[i]), { luaVersion: '5.2' });
        }
        catch (error) {
            errors += `script${i + 1}.lua${error.message}\n\n`; // Syntax error in Lua code
        }
    }

    if (errors == '') return null; // Valid Lua code, or no code found in message
    return errors.trim(); // Trim trailing \n\n
}

module.exports = { checkMessageForLuaError };
