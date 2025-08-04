const DataStorage = require('../../util/dataStorage');
const utility = require('../../util/utility');

module.exports = {
	name: 'honeypot',
	// https://en.wikipedia.org/wiki/Honeypot_(computing)
	description: 'Adds, removes, or shows channels in the honeypot list.',
	moderator: true,
	allowInOtherGuilds: false,
	/**
	 * 
	 * @param {import('discord.js').Message} message 
	 * @param {String[]} args
	 */
	async execute(message, args) {
		if (!DataStorage.storage.honeypotChannels) { DataStorage.storage.honeypotChannels = {}; }

		/** @type {String|null} */
		const param = args[0];


		if (param == "show") {
			if (Object.keys(DataStorage.storage.honeypotChannels).length > 0) {
				let reply = "";
				for (const [channelID, value] of Object.entries(DataStorage.storage.honeypotChannels)) {
					reply = reply + `<#${channelID}>\n`;
				}

				message.reply(utility.buildEmbed("Here are all the honeypot channels.", reply))
			} else {
				message.reply(utility.buildEmbed("There are no honeypot channels."))
			}
		} else {
			let channelID = message.channelId;
			if (param) {
				await message.client.channels.fetch(param.replaceAll(/<|>|#/g,"")).then(chnl => {
					channelID = chnl.id;
				}).catch(res => {
					message.reply(utility.buildEmbed(`Could not find channel <#${param}> to honeypot.`));
					DataStorage.save('storage');
					channelID = null;
				})

				if (!channelID) { return; } // Man this is so cursed LOL
			}

			if (DataStorage.storage.honeypotChannels[channelID]) {
				delete DataStorage.storage.honeypotChannels[channelID];
				message.reply(utility.buildEmbed(`Removed <#${channelID}> from the honeypot list.`))
			} else {
				DataStorage.storage.honeypotChannels[channelID] = true;
				message.reply(utility.buildEmbed(`Added <#${channelID}> to the honeypot list.`))
			}
		}
		DataStorage.save('storage');
	},
};