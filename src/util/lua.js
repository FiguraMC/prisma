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
 * Find lua code in a string and check if it contains a syntax error
 * @param {string} text 
 * @returns string if error found, else null
 */
function checkMessageForLuaError(text) {

    // Detect code blocks, or if not present try detecting potential lua code
    const luaCodeBlocks = extractLuaCodeBlocks(text);

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
