const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const fs = require('fs');
const path = require('path');
const ContentBlocker = require('../util/contentBlocker');
const checkBackendStatus = require('../cronjobs/checkBackendStatus');
const cronJobDeleteOldRequests = require('../cronjobs/deleteOldRequests');
const cronJobUpdateScamList = require('../cronjobs/updateScamList');
const cronJobStorageBackup = require('../cronjobs/storageBackup');
const requestReactions = require('../util/requestReactions');
const flag = path.join(__dirname, '../../storage/restart.json');

module.exports = {
    name: 'ready',
    once: true,
    /**
     * 
     * @param {Discord.Client} client 
     */
    async execute(client) {

        console.log(`Ready! Logged in as ${client.user.tag}`);

        client.user.setActivity('/ticket', { type: 'LISTENING' });

        checkBackendStatus.start(client);
        cronJobDeleteOldRequests.start(client);
        cronJobUpdateScamList.start();
        cronJobStorageBackup.start();

        requestReactions.init(client);

        // Only fetch all if not in dev mode, avoiding spamming the API when using nodemon
        if (process.argv[2] != 'dev') {
            console.log('Fetching all scam domains.');
            ContentBlocker.fetchThirdPartyScamListAll();
        }

        // On restart, send a message
        if (fs.existsSync(flag)) {
            const id = fs.readFileSync(flag).toString();
            fs.unlinkSync(flag);
            if (id) {
                client.channels.cache.get(id)?.send('Bot started!').catch(console.error);
            }
        }
    },
};
