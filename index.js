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

require('./src/DataStorage').load();
const DataStorage = require('./src/DataStorage');
const ReactionCollector = require('./src/ReactionCollector');
const RequestDeletion = require('./src/RequestDeletion');
const Requests = require('./src/Requests');
const Accept = require('./src/Accept');
const Actions = require('./src/Actions');
const ActionType = require('./src/ActionType');
const Wiki = require('./src/wiki');
const {isModerator} = require('./src/util');
const TierRolesManager = require('./src/TierRolesManager');
const ChatFilter = require('./src/ChatFilter');

client.once('ready', async () => {
	await ReactionCollector.init(client);
	const job = new CronJob('0 0 * * * *', function () {
		ChatFilter.fetchThirdPartyScamListRecent(3610);
		RequestDeletion(client);
	}, null, true, 'Europe/London');
	await ChatFilter.fetchThirdPartyScamListAll();
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
			const memberId = message.content.split(' ')[1];

			let fetchedMember = undefined;
			try {
				if (memberId) fetchedMember = await message.guild.members.fetch(memberId);
			}
			catch {}

			const member = message.mentions.members.first() || fetchedMember;
			if (member == undefined) return message.channel.send('Please specify a user.');

			if (DataStorage.storage.people[member.id] == undefined) {
				DataStorage.storage.people[member.id] = {};
			}
			const person = DataStorage.storage.people[member.id];
			if (person.ban) return message.channel.send('This user is already banned.');
			person.ban = true;
			DataStorage.save();
			message.channel.send('Request-Banned ' + member.user.tag);
		}
		else if ((message.content.startsWith('?requestsunban') || message.content.startsWith('?requestunban')) && await isModerator(message.author.id, message)) {
			const memberId = message.content.split(' ')[1];

			let fetchedMember = undefined;
			try {
				if (memberId) fetchedMember = await message.guild.members.fetch(memberId);
			}
			catch {}

			const member = message.mentions.members.first() || fetchedMember;
			if (member == undefined) return message.channel.send('Please specify a user.');

			if (DataStorage.storage.people[member.id] == undefined) {
				return;
			}
			const person = DataStorage.storage.people[member.id];
			if (person.ban) {
				delete person.ban;
				DataStorage.save();
				message.channel.send('Request-Unbanned ' + member.user.tag);
			}
			else {
				message.channel.send('This user is not banned.');
			}
		}
		else if (message.content.startsWith('?level')) {
			const memberId = message.content.split(' ')[1];
			let fetchedMember = undefined;
			try {
				if (memberId) fetchedMember = await message.guild.members.fetch(memberId);
			}
			catch {}

			const member = message.mentions.members.first() || fetchedMember || message.member;
			if (member == undefined) return message.channel.send('Please specify a user.');
			
			if (DataStorage.storage.people[member.id] == undefined) {
				return message.channel.send('This user hasn\'t done any requests yet.');
			}
			const person = DataStorage.storage.people[member.id];
			if (person == undefined || person.level == undefined) {
				message.channel.send(member.user.tag + ' has not completed any requests yet.');
			}
			else {
				message.channel.send(member.user.tag + ' has completed ' + person.level + ' requests.');
			}
		}
		else if (message.content.startsWith('?setlevel') && await isModerator(message.author.id, message)) {
			const memberId = message.content.split(' ')[1];
			let fetchedMember = undefined;
			try {
				if (memberId) fetchedMember = await message.guild.members.fetch(memberId);
			}
			catch {}

			const member = message.mentions.members.first() || fetchedMember;
			if (member == undefined) return message.channel.send('Please specify a user.');
			
			let newLevel = parseInt(message.content.split(' ')[2]);
			if (isNaN(newLevel)) return message.channel.send('Please specify the amount of requests.');
			
			const person = DataStorage.storage.people[member.id];
			
			if (person == undefined || person.level == undefined) {
				message.channel.send('Changed level of ' + member.user.tag + ' to ' + newLevel + '.');
			}
			else {
				message.channel.send('Changed level of ' + member.user.tag + ' from ' + person.level + ' to ' + newLevel + '.');
			}
			TierRolesManager.levelset(member, newLevel);
		}
		else if (message.content.startsWith('?help')) {
			let response = 'Available commands:\n?wiki <search> - Search for a wiki page.\n?level [@user|userid] - Show a users level.\n?rewrite [feature|avatars|blockbench] - Quick link to some QnA about the rewrite.';
			if (await isModerator(message.author.id, message)) {
					response += '\n?setlevel <@user|userid> <level> - Set the level of a user.\n?requestban <@user|userid> - Ban someone from interacting with requests.\n?requestunban <@user|userid> - Revert a ban.\n?requestbans - Show all the people who are currently banned from requests.\n?scamlist [domain] - List, add, or remove a domain from the scam list.\n?nsfwlist [domain] - List, add, or remove a domain from the nsfw list.';
			}
			message.channel.send({embeds:[{description:response}]});
		}
		else if (message.content.startsWith('?scamlist') && await isModerator(message.author.id, message)) {
			const domain = message.content.substring(10);
			if (DataStorage.storage.scamfilter == undefined) DataStorage.storage.scamfilter = [];
			if (!domain) {
				let scamdomains = '`'+(DataStorage.storage.scamfilter.toString()).replaceAll(',','`\n`')+'`';
				message.channel.send(scamdomains=='``'?'No domains are in the scam list yet.':scamdomains);
			}
			else if (DataStorage.storage.scamfilter.includes(domain)) {
				DataStorage.storage.scamfilter = DataStorage.storage.scamfilter.filter(x=>x!=domain);
				message.channel.send('Removed `' + domain + '` from the scam list.');
			}
			else {
				DataStorage.storage.scamfilter.push(domain);
				message.channel.send('Added `' + domain + '` to the scam list.');
			}
			DataStorage.save();
		}
		else if (message.content.startsWith('?nsfwlist') && await isModerator(message.author.id, message)) {
			const domain = message.content.substring(10);
			if (DataStorage.storage.nsfwfilter == undefined) DataStorage.storage.nsfwfilter = [];
			if (!domain) {
				let nsfwdomains = '`'+(DataStorage.storage.nsfwfilter.toString()).replaceAll(',','`\n`')+'`';
				message.channel.send(nsfwdomains=='``'?'No domains are in the nsfw list yet.':nsfwdomains);
			}
			else if (DataStorage.storage.nsfwfilter.includes(domain)) {
				DataStorage.storage.nsfwfilter = DataStorage.storage.nsfwfilter.filter(x=>x!=domain);
				message.channel.send('Removed `' + domain + '` from the nsfw list.');
			}
			else {
				DataStorage.storage.nsfwfilter.push(domain);
				message.channel.send('Added `' + domain + '` to the nsfw list.');
			}
			DataStorage.save();
		}
		else if (message.content.startsWith('?rewrite')) {
			const subcommand = message.content.substring(9);
			if (subcommand == 'feature') {
				message.channel.send('Q: Will X feature make it into the re-write?\nA: Eventually, probably. The first release of the re-write will focus on implementing the most basic scripting and avatar features, and a better UI, just to set the framework of the mod. Afterwards, we\'ll work towards parity with the pre-write. Once parity is reached, we will work on new features like the model browser and APIs for other mods.');
			}
			else if (subcommand == 'avatars') {
				message.channel.send('Q: Will my avatars break?\nA: Even the most basic scripts will need to be changed for the re-write to support the new API format. Blockbench models will probably not need significant changes (aside from the deprecation of keywords), same for textures.');
			}
			else if (subcommand == 'blockbench') {
				message.channel.send('Q: What about the Blockbench Plugin?\nA: I have some plans. The Blockbench Plugin will not be required, unlike what I\'ve said in the past. But without it, you will be unable to use some features of Figura. The "keyword" system was very clunky, so it will be deprecated either way, but there will be a replacement for it. The features you will/won\'t be able to use without the plugin are not absolute at this time.');
			}
			else {
				message.channel.send('https://discord.com/channels/805969743466332191/808389992191229983/898262828446793728');
			}
		}
		else {
			let urlsInMessage = message.content.match(/(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/gi);
			
			if (process.env.SHOWCASE_CHANNELS.split(',').find(x=>x==message.channel.id)) {
				// If sent in a showcase channel, check if it contains an attachment or link
				if (message.attachments.size == 0 && urlsInMessage == null) {
					message.delete().catch(console.error);
					message.author.send({ embeds: [
						new Discord.MessageEmbed({
							title: 'Hello there!',
							description:
								'To respond to a showcased post please talk in the dedicated discussion channel.\n' +
								'If you want to post something to showcase yourself, make sure to include an image, video, file, or URL.'
						})
					]}).catch(console.error);
				}
				else {
					// React to showcase post with the upvote button emoji
					const messages = await message.channel.messages.fetch();
					const aboveMessage = messages.first(2)[1];
					if (aboveMessage?.author.id == message.author.id) {
						aboveMessage.reactions.cache.get(process.env.UPVOTE_EMOJI).users.remove(client.user.id);
					}
					message.react(process.env.UPVOTE_EMOJI);
				}
			}

			if (
				ChatFilter.scam(message.content) || 
				ChatFilter.scam(message.embeds[0]?.url) || 
				ChatFilter.scam(message.embeds[0]?.thumbnail?.url) || 
				// ChatFilter.scam(await ChatFilter.expandUrl(message.embeds[0]?.url)) ||
				ChatFilter.scam((await ChatFilter.expandMultipleUrls(urlsInMessage)).join())
			) {
				message.delete().catch(console.error);
				message.member.roles.add(process.env.MUTED_ROLE).catch(console.error);
				message.channel.send(
					'.　。　　　　•　　　ﾟ　　。　　.　　　　•\n'+
					'　　　.　　　　　.　　　　　。　　。　.　　.\n'+
					'。　　ඞ　　.　•　　Scammer was ejected...\n'+
					'。　.　　　　。　　　　　　ﾟ　　　.　　　　.\n'+
					'　　　　.　.　　　.　　　•　　.　　　　ﾟ　.\n'
				);
				
				let channel = await message.guild.channels.fetch(process.env.MODERATION_LOG_CHANNEL);
				channel.send({
					embeds:[
						{
							title: 'Scam Filter',
							description: 'Muted <@' + message.author.id + '>',
							fields:[
								{
									name: 'Message',
									value: message.content==''?'[empty]':message.content
								}
							],
							color: 'ff5114'
						}
					]
				});
			}
			else if (ChatFilter.nsfw(message.content)) {
				message.delete().catch(console.error);
				message.channel.send('<@' + message.author.id + '> we don\'t do that here!');
				let channel = await message.guild.channels.fetch(process.env.MODERATION_LOG_CHANNEL);
				channel.send({
					embeds:[
						{
							title: 'NSFW Filter',
							description: 'Warned <@' + message.author.id + '>',
							fields:[
								{
									name: 'Message',
									value: message.content==''?'[empty]':message.content
								}
							],
							color: 'ff1469'
						}
					]
				});
			}
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
			}).catch(console.error)).catch(console.error);
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

	let executor = undefined;
	let target = undefined;
	
	if (deletionLog) {
		executor = deletionLog.executor;
		target = deletionLog.target;
		if (target.id == message.author.id) {
			personWhoDeleted = '<@'+executor.id+'>';
		} else {
			personWhoDeleted = 'themselves';
		}
	}
	else {
		personWhoDeleted = 'an unknown user';
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