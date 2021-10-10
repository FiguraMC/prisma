/////////////////
//             //
//    Setup    //
//             //
/////////////////

require('dotenv').config();
const Discord = require('discord.js');
const CronJob = require('cron').CronJob;
const PKAPI = require('pkapi.js');
const pkapi = new PKAPI();

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
const DataStorage = require('./DataStorage');
const ReactionCollector = require('./ReactionCollector');
const RequestDeletion = require('./RequestDeletion');
const Requests = require('./Requests');
const Accept = require('./Accept');
const Actions = require('./Actions');
const ActionType = require('./ActionType');
const Wiki = require('./wiki');
const {isModerator} = require('./util');
const TierRolesManager = require('./TierRolesManager');

client.once('ready', async () => {
	await ReactionCollector.init(client);
	const job = new CronJob('0 0 * * * *', function () {
		RequestDeletion(client);
	}, null, true, 'Europe/London');
	job.start();
	Wiki.init();
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
				else if (Actions.get(message.author.id).type == ActionType.DELETE_REQUEST) {
					Requests.handleDelete(client, message);
				}
			}
			else {
				Requests.handle(client, message);
			}
		}
		// deleting messages sent in the requests channel - removed
		// else if (message.channel.id == process.env.REQUESTS_CHANNEL) {
		// 	message.delete().catch(console.error);
		// 	let embed = new Discord.MessageEmbed({
		// 		title: 'Hello there!',
		// 		description: 'If you want to create an avatar request, send "request" in my DMs here.' +
		// 			'\n\n' +
		// 			'If you want to respond to an existing request, please do so in the corresponding thread.'
		// 	});
		// 	message.author.send({ embeds: [embed] }).catch(console.error);
		// }
		else if (message.content.startsWith('?wiki ')) {
			const s = message.content.substring(6).toLowerCase();
			const result = Wiki.search(s);
			if (result) {
				message.channel.send('<'+result+'>');
			}
			else {
				message.channel.send('Could not find anything about ``' + s + '``');
			}
		}
		else if ((message.content.startsWith('?requestsbans') || message.content.startsWith('?requestbans')) && await isModerator(message.author.id, message)) {
			let response = 'These people are currently banned from making requests:\n';
			let x = false;
			for (const key in DataStorage.storage.people) {
				if (Object.hasOwnProperty.call(DataStorage.storage.people, key)) {
					const person = DataStorage.storage.people[key];
					if (person.ban) {
						x = true;
						response += '<@' + key + '>\n';
					}
				}
			}
			message.channel.send(x ? response : 'Noone is currently request-banned.');
		}
		else if ((message.content.startsWith('?requestsban') || message.content.startsWith('?requestban')) && await isModerator(message.author.id, message)) {
			const member = message.mentions.members.first();
			if (member == undefined) return message.channel.send('Please specify a user.');
			if (DataStorage.storage.people[member.id] == undefined) {
				DataStorage.storage.people[member.id] = {};
			}
			const person = DataStorage.storage.people[member.id];
			if (person.ban) return message.channel.send('This user is already banned.');
			person.ban = true;
			DataStorage.save();
			message.channel.send('Request-Banned <@' + message.mentions.members.first() + '>');
		}
		else if ((message.content.startsWith('?requestsunban') || message.content.startsWith('?requestunban')) && await isModerator(message.author.id, message)) {
			const member = message.mentions.members.first();
			if (member == undefined) return message.channel.send('Please specify a user.');
			if (DataStorage.storage.people[member.id] == undefined) {
				return;
			}
			const person = DataStorage.storage.people[member.id];
			if (person.ban) {
				delete person.ban;
				DataStorage.save();
				message.channel.send('Request-Unbanned <@' + message.mentions.members.first() + '>');
			}
			else {
				message.channel.send('This user is not banned.');
			}
		}
		else if (message.content.startsWith('?level')) {
			const member = message.mentions.members.first();
			if (member == undefined) return message.channel.send('Please specify a user.');
			if (DataStorage.storage.people[member.id] == undefined) {
				return message.channel.send('This user hasn\'t done any requests yet.');
			}
			const person = DataStorage.storage.people[member.id];
			if (person == undefined || person.level == undefined) {
				message.channel.send('<@' + message.mentions.members.first() + '> has not completed any requests yet.');
			}
			else {
				message.channel.send('<@' + message.mentions.members.first() + '> has completed ' + person.level + ' requests.');
			}
		}
		else if (message.content.startsWith('?setlevel') && await isModerator(message.author.id, message)) {
			const member = message.mentions.members.first();
			if (member == undefined) return message.channel.send('Please specify a user.');
			
			let newLevel = parseInt(message.content.split(' ')[2]);
			if (isNaN(newLevel)) return message.channel.send('Please specify the amount of requests.');
			
			const person = DataStorage.storage.people[member.id];
			
			if (person == undefined || person.level == undefined) {
				message.channel.send('Changed level of <@' + message.mentions.members.first() + '> to ' + newLevel + '.');
			}
			else {
				message.channel.send('Changed level of <@' + message.mentions.members.first() + '> from ' + person.level + ' to ' + newLevel + '.');
			}
			TierRolesManager.levelset(member, newLevel);
		}
		else if (message.content.startsWith('?help')) {
			let response = 'Available commands:\n?wiki <search> - Search for a wiki page.\n?level <@user> - Show a users level.';
			if (await isModerator(message.author.id, message)) {
					response += '\n?setlevel <@user> <level> - Set the level of a user.\n?requestban <@user> - Ban someone from interacting with requests.\n?requestunban <@user> - Revert a ban.\n?requestbans - Show all the people who are currently banned from requests.';
			}
			message.channel.send({embeds:[{description:response}]});
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
	Accept.onInteract(interaction);
});

client.on('messageUpdate', async (oldMessage, newMessage) => {
	if (oldMessage.content == newMessage.content) return; // in order to stop link embeds from triggering this event
	if (oldMessage.guild != newMessage.guild) return;
	let channel = await oldMessage.guild.channels.fetch(process.env.LOG_CHANNEL);
	channel.send({
		embeds:[
			{
				author: {name: oldMessage.author.username, iconURL: oldMessage.author.avatarURL()},
				description: '[Message]('+oldMessage.url+') from <@' + oldMessage.author + '> edited in <#' + oldMessage.channel + '>',
				fields:[
					{
						name: 'Old',
						value: oldMessage.content==''?'[empty]':oldMessage.content,
						inline: true,
					},
					{
						name: 'New',
						value: newMessage.content==''?'[empty]':newMessage.content,
						inline: true,
					},
				],
				image: {url: oldMessage.attachments.values()?.next()?.value?.attachment},
				color: '0875db'
			}
		]
	});
});

client.on('messageDelete', async message => {
	if (!message.guild) return; // Ignore DM
	if (message.author.id == client.user.id) return; // Ignore self

	const fetchedLogs = await message.guild.fetchAuditLogs({
		limit: 1,
		type: 'MESSAGE_DELETE',
	});
	const deletionLog = fetchedLogs.entries.first();

	let personWhoDeleted;

	if (!deletionLog) personWhoDeleted = 'an unknown user';
	const { executor, target } = deletionLog;
	if (target.id == message.author.id) {
		personWhoDeleted = '<@'+executor.id+'>';
	} else {
		personWhoDeleted = 'themselves';
	}

	pk_message = await pkapi.getMessage({id:message.id});
	if (pk_message?.original == message.id) return; // Ignore Pluralkit

	let channel = await message.guild.channels.fetch(process.env.LOG_CHANNEL);
	channel.send({
		embeds:[
			{
				author: {name: message.author.username, iconURL: message.author.avatarURL()},
				description: 'Message from <@' + message.author + '> deleted by '+personWhoDeleted+' in <#' + message.channel + '>',
				fields:[
					{
						name: 'Message',
						value: message.content==''?'[empty]':message.content
					}
				],
				image: {url: message.attachments.values()?.next()?.value?.attachment},
				color: 'ff0000'
			}
		]
	});
});

/////////////////
//             //
//    Login    //
//             //
/////////////////

client.login(process.env.TOKEN);