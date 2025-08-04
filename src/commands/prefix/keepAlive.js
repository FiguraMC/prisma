const DataStorage = require('../../util/dataStorage');
const utility = require('../../util/utility');

module.exports = {
	name: 'keepalive',
	description: 'Adds, removes, or shows channels in the keepAlive cronJob.',
	moderator: true,
	allowInOtherGuilds: false,
	/**
	 * 
	 * @param {import('discord.js').Message} message 
	 * @param {String[]} args 
	 */
	async execute(message, args) {
		if (!DataStorage.storage.keepAliveChannels) { DataStorage.storage.keepAliveChannels = []; }

		/** @type {String|null} */
		const param = args[0];

		if (param == "show") {
			if (DataStorage.storage.keepAliveChannels.length > 0) {
				let reply = "";
				DataStorage.storage.keepAliveChannels.forEach(st => { reply = reply + `<#${st}>\n` });

				message.reply(utility.buildEmbed("Here are all the keepAlive channels.", reply))
			} else {
				message.reply(utility.buildEmbed("There are no keepAlive channels."))
			}
		} else {
			let channelID = message.channelId;
			if (param) { channelID = param; }

			if (DataStorage.storage.keepAliveChannels.includes(channelID)) {
				DataStorage.storage.keepAliveChannels = DataStorage.storage.keepAliveChannels.filter(x => x != channelID)
				message.reply(utility.buildEmbed(`Removed <#${channelID}> from the keepAlive list.`))
			} else {
				DataStorage.storage.keepAliveChannels.push(channelID);
				message.reply(utility.buildEmbed(`Added <#${channelID}> to the keepAlive list.`))
			}
		}
		DataStorage.save('storage');
	},
};