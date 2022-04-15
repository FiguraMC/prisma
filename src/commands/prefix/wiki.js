const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const wiki = require('../../../storage/wiki.json');

// Old wiki command, this will be removed once the wiki gets an overhaul
module.exports = {
    name: 'wiki',
    usage: '`?wiki <search>` - Figura wiki command.',
    /**
     * 
     * @param {Discord.Message} message 
     * @param {String[]} args 
     */
	 async execute(message, args) {
        const result = search(args);
        if (!result.length) {
            message.channel.send(`Could not find anything about "${args.join(' ')}".`);
        }
        else if(result.length>10){
			//This should never happen but if wiki.json isn't set up properly it may occur.
			message.channel.send(`Too many possible matches. Try adding another keyword.`);
		}
		else{
			var string=""
			for(const entry in result){
				string+=`\n${entry.name??"No Name Provided"}\n\t<${entry.url??"No Url Provided"}>`
			}
            message.channel.send(`Possible matches found:${string}`);
        }
    },
};

/**
 *
 * @param {String} argKeywords
 */
function search(argKeywords) {
	var mostKeywords=[]
	var currentMaximum=0
	for(const entry of wiki){
		var keywords=0
		for(const keyword of entry.keywords){
			for (const word of argKeywords){
				if(keyword==word){
					keywords++
				}
			}
		}
		if(keywords==currentMaximum){
			mostKeywords.push(entry)
		}
		else if(keywords>currentMaximum){
			currentMaximum=keywords
			mostKeywords=[entry]
		}
	}
	var matches=[]
	var currentPriority=0
	for(const entry of mostKeywords){
		if ((entry.priority??0)==currentPriority){
			matches.push(entry)
		}
		else if((entry.priority??0)>currentPriority){
			currentPriority=entry.priority
			matches=[entry]
		}
	}
	return matches
}
