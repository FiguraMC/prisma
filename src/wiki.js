const fs = require('fs');
const path = require('path');

var wiki = new Array();

function init() {
    let input = fs.readFileSync(path.join(__dirname, 'wiki.txt')).toString();
    var isURL = true;
    var url;
    var search = new Array();
    input.split(/\r?\n|\r/).forEach(element => {
        element.trim();
        if (element == '-') {
            let obj = new Object();
            obj.keys = search;
            obj.value = url;
            wiki.push(obj);
            url = null;
            search = new Array();
            isURL = true;
            return;
        }
        else if (isURL) {
            isURL = false;
            url = element;
        }
        else {
            search.push(element);
        }
    });
    // fs.writeFileSync('./wiki.json', JSON.stringify(wiki));
}

function search(s) {
    // exact matches
    for (const entry of wiki) {
        for (const key of entry.keys) {
            for (const word of key.split(".")) {
                if (word == s) {
                    return entry.value;
                }
            }
        }
    }
    // search word is a substring of key
    for (const entry of wiki) {
        for (const key of entry.keys) {
            if (key.includes(s)) {
                return entry.value;
            }
        }
    }
    // key is a substring of search word
    for (const entry of wiki) {
        for (const key of entry.keys) {
            if (s.includes(key)) {
                return entry.value;
            }
        }
    }
    return null;
}

module.exports = { init, search }