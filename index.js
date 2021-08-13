/////////////////
//             //
//    Setup    //
//             //
/////////////////

require('dotenv').config();
const Discord = require('discord.js');
const CronJob = require('cron').CronJob;

const client = new Discord.Client({
	intents: [
		Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Discord.Intents.FLAGS.GUILDS,
		Discord.Intents.FLAGS.GUILD_MESSAGES,
		Discord.Intents.FLAGS.DIRECT_MESSAGES
	],
	partials: [
		'CHANNEL'
	]
});

require('./DataStorage').load();
const ReactionCollector = require('./ReactionCollector');
const RequestDeletion = require('./RequestDeletion');
const Requests = require('./Requests');
const Accept = require('./Accept');
const Actions = require('./Actions');
const ActionType = require('./ActionType');

client.once('ready', async () => {
	await ReactionCollector.init(client);
	const job = new CronJob('0 * * * * *', function() {
		RequestDeletion(client);
	}, null, true, 'Europe/London');
	job.start();
	console.log('Ready!');
});

///////////////////////
//                   //
// React to messages //
//                   //
///////////////////////

client.on('messageCreate', async message => {
	if (message.author.bot) return;
	try {
		if (message.channel.type == 'DM') {
			if (Actions.has(message.author.id)) {
				if (Actions.get(message.author.id).type == ActionType.ACCEPT_REQUEST) {
					Accept.handle(client, message);
				}
				else if (Actions.get(message.author.id).type == ActionType.BUILD_REQUEST) {
					Requests.handle(client, message);
				}
				else if (Actions.get(message.author.id).type == ActionType.EDIT_REQUEST) {
					Requests.handleEdit(client, message);
				}
			}
			else {
				Requests.handle(client, message);
			}
		}
		else if (message.channel.id == process.env.REQUESTS_CHANNEL) {
			message.delete().catch(console.error);
			let embed = new Discord.MessageEmbed({
				title: 'Hello there!',
				description: 'If you want to create an avatar request, send "request" in my DMs here.'+
							 '\n\n'+
							 'If you want to respond to an existing request, please do so in the corresponding thread.'
			});
			message.author.send({embeds: [embed]}).catch(console.error);
		}
	}
	catch (error) {
		console.error(error.stack);
		
		client.channels.fetch(process.env.LOG_CHANNEL)
			.then(channel => channel.send({
				content: error.toString(),
				files: [{
					attachment: Buffer.from(error.stack, 'utf-8'),
					name: 'error.txt'
				}]
			}).catch(console.error))
			.catch(console.error);
	}
});

client.on('interactionCreate', interaction => {
	Requests.onInteract(interaction);
});

/////////////////
//             //
//    Login    //
//             //
/////////////////

client.login(process.env.TOKEN);