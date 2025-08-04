const utils = require("./utility")

/** @type {import('discord.js').Client} */
let client;

/**
 * 
 * @param {import('discord.js').Client} bot
 */
module.exports.init = function (bot) {
	client = bot;
}

module.exports.banReasons = {
	SPAM: ("User has been automatically banned/muted due to spreading scam messages.\nThis is likely due to a compromised account."),
	DEFAULT: ("User has been automatically banned/muted due to breaking one of the rules."),
}
module.exports.banReasons.SCAM = module.exports.banReasons.SPAM;

module.exports.banMessages = {
	SPAM: ("You have been automatically banned/muted due to spreading scam/spam messages.\nThis is likely due to a compromised account.\nIf you recover your account or this was a false trigger, please make a ban appeal at https://figuramc.org/forms/user/unban"),
	DEFAULT: ("You have been automatically banned/muted due to breaking one of the rules.\nYou can read our [full guidelines here](https://docs.google.com/document/d/1KhosfkmgZY7QbrnRkWFBCdmfmNzaWgfhOjFI3WpGYCo/edit?tab=t.0#heading=h.q77hw6cnnlx0).\nIf you believe you were falsely banned/muted, please make a ban appeal at https://figuramc.org/forms/user/unban"),
}
module.exports.banMessages.SCAM = module.exports.banMessages.SPAM;


/**
 * 
 * @param {import('discord.js').GuildMember} guildMember
 * @param {String|null} reason
 * @param {import('discord.js').Message|String|null} dmMessage 
 * @param {Number|null} deleteMessageSeconds 
 */
module.exports.ban = async function (guildMember, reason, dmMessage, deleteMessageSeconds) {
	const banMessages = module.exports.banMessages;
	const banReasons = module.exports.banReasons;

	// The next three if() checks, just check for validity

	if (!guildMember) {
		console.error(`Could not find the user: ${guildMember}.`)
		return;
	}

	const inGuildBot = (await guildMember.guild.members.fetch(client.user));

	// Holy fucking oneliner
	if (utils.isHigherRole(guildMember, inGuildBot) || utils.isHelper(guildMember) || utils.isModerator(guildMember)) {
		console.error(`Please put in an user that I can ban, I can't ban ${guildMember}.`)
		return;
	}

	if (!inGuildBot.permissions.has("BAN_MEMBERS", true)) {
		console.error(`I don't have ban permissions, I can't ban user: ${guildMember}`)
		return;
	}

	// Gets a the reason, or the default one
	reason = banReasons[reason] || reason || banReasons.DEFAULT;
	dmMessage = banMessages[dmMessage || reason] || dmMessage || banMessages.DEFAULT;

	// I send a msg first and then ban them, because of obvious reasons, it's impossible to to it the other way around
	// It's weird though because admins or people with a higher role than the bot still have user.bannable property being true, but I digress
	await guildMember.send(dmMessage);

	guildMember.ban({
		deleteMessageSeconds: (deleteMessageSeconds || 0),
		reason: reason
	}).then(_ => {
		module.exports.log(utils.buildEmbed("Successfully banned user.", `User: ${guildMember}\nReason was:\n${reason}`))
	}).catch(_ => {
		module.exports.log(utils.buildEmbed("Could not ban user.", `User: ${guildMember}.\nReason was:\n${reason}`))
	})
}

/**
 * 
 * @param {import('discord.js').GuildMember} guildMember
 * @param {String|null} reason
 * @param {import('discord.js').Message|String|null} dmMessage 
 * @param {import("discord.js").DateResolvable|null} timeoutSeconds 
 */
module.exports.mute = async function (guildMember, reason, dmMessage, timeoutSeconds) {
	const banMessages = module.exports.banMessages;
	const banReasons = module.exports.banReasons;

	// The next three if() checks, just check for validity

	if (!guildMember) {
		console.error(`Could not find the user: ${guildMember}.`)
		return;
	}

	const inGuildBot = (await guildMember.guild.members.fetch(client.user));

	if (utils.isHigherRole(guildMember, inGuildBot) || utils.isHelper(guildMember) || utils.isModerator(guildMember)) {
		console.error(`Please put in an user that I can mute, I can't mute ${guildMember}.`)
		return;
	}

	if (!inGuildBot.permissions.has("MUTE_MEMBERS")) {
		console.error(`I don't have mute permissions, I cannot mute user: ${guildMember}`)
		return;
	}

	// Gets a the reason, or the default one
	reason = banReasons[reason] || reason || banReasons.DEFAULT;
	dmMessage = banMessages[dmMessage || reason] || dmMessage || banMessages.DEFAULT;

	// Sends the DM msg and then mutes them, order doesn't matter at all
	guildMember.send(dmMessage);

	guildMember.disableCommunicationUntil(timeoutSeconds || 60 * 60)
		.then(_ => {
			module.exports.log(utils.buildEmbed("Successfully muted user.", `User: ${guildMember}.\nReason was:\n${reason}`))
		}).catch(_ => {
			module.exports.log(utils.buildEmbed("Could not muted user.", `User: ${guildMember}.\nReason was:\n${reason}`))
		})
}

/**
 * 
 * @param {import('discord.js').Message|String} logMessage 
 */
module.exports.log = async function (logMessage) {
	if (!process.env.LOGGING_CHANNEL) { return; }

	client.channels.fetch(process.env.LOGGING_CHANNEL).then(chnl => {
		chnl.send(logMessage);
	})
}