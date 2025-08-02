const CronJob = require('cron').CronJob;
const DataStorage = require('../util/dataStorage');

/**
 * Automatically sends a message to the keepAlive channels so that they don't get locked / archived / etc.
 * @param {import('discord.js').Client} client 
 */
module.exports.start = function (client) {
	const job = new CronJob('0 0 0 * * *', function () { module.exports.run(client) }, null, true, 'Europe/London');
	job.start();
	/* 
	Put a manual one time run on boot here.
	Reason: If the bot crashes over and over right before it reaches a week / sunday it can not make the channels get refreshed.
	- Vicky
	*/
	module.exports.run(client);
};

/**
 * @param {import('discord.js').Client} client 
 */
module.exports.run = function (client) {
	if (!DataStorage.storage?.keepAliveChannels?.length > 0) return;
	const keepAliveMessage = process.env.KEEP_ALIVE_MESSAGE || "fard https://tenor.com/view/hat-wind-summer-breeze-nice-weather-gif-12128469"

	for (const channelID of DataStorage.storage.keepAliveChannels) {
		client.channels.fetch(channelID).then(async (/** @type {import('discord.js').TextChannel|null} */ channel) => {
			if (!channel) { return; }

			channel.send({
				content: keepAliveMessage,
				flags: [4096]
			})
				.then(msg => { setTimeout(() => msg.delete(), 5000) })
				.catch(res => {
					console.error("Could not send keepAlive message to channel: ", channel.name, " - ", channel.id);
					console.error("\nReason: ", res)
				});
		})
	}
}

