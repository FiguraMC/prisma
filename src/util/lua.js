const luafmt = require('lua-fmt');
const luaparse = require('luaparse');

/**
 * Returns an array of found lua or no-language code blocks in a text message
 * @param {string} text 
 * @returns string[]
 */
function extractLuaCodeBlocks(text) {
    const codeBlockRegex = /```(?:lua)?\s+([\s\S]+?)\s*```{1,3}/ig;
    const luaCodeBlocks = [];
    let match;
    while ((match = codeBlockRegex.exec(text)) !== null) {
        luaCodeBlocks.push(match[1].trim()); // Extracted Lua code without language specifier and extra whitespace
    }
    return luaCodeBlocks;
}

/**
 * Returns an array of found code blocks which include inline as well
 * @param {string} text 
 * @returns string[]
 */
function extractAnySizeCodeBlocks(text) {
    const codeBlockRegex = /`{1,3}(?:lua)?\s*([\s\S]+?)\s*`{1,3}/ig;
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

function trimChar(str, char) {
    return trimCharBack(trimCharFront(str, char), char);
}

function trimCharFront(str, char) {
    const escapedChar = char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters for regex
    const regex = new RegExp(`^${escapedChar}+`);
    return str.replace(regex, '');
}

function trimCharBack(str, char) {
    const escapedChar = char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters for regex
    const regex = new RegExp(`${escapedChar}+$`);
    return str.replace(regex, '');
}

/**
 * @param {string} text 
 * @returns 
 */
function extractAndFormatLuaCode(text) {
    // Remove potential incorrect discord formatting
    text = trimCharFront(text, '`');
    text = trimChar(text, '´');
    text = trimChar(text, '\'');
    if (text.toLowerCase().startsWith('lua') || text.toLowerCase().startsWith('lau')) {
        text = text.substring(3);
    }
    const codeBlocks = extractAnySizeCodeBlocks(text); // If, after trimming ` from the front, there are still code blocks left, means there was non-code text before it, format the code block instead
    text = trimCharBack(text, '`');
    text = text.trim();
    if (codeBlocks.length != 0) {
        text = codeBlocks[0];
    }

    // Try format code
    try {
        return '```lua\n' + luafmt.formatText(text) + '\n```';
    }
    catch {
        // Couldn't format, find syntax error instead
        let errorMessage = '';
        try {
            luaparse.parse(text, { luaVersion: '5.2' });
        }
        catch (error) {
            errorMessage = error.message; // Syntax error in Lua code
        }
        return errorMessage + '\n```lua\n' + text + '\n```';
    }
}

module.exports = { checkMessageForLuaError, extractAndFormatLuaCode };
