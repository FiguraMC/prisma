const fs = require('fs');
const path = require('path');
const ContentBlocker = require('../util/contentBlocker');
const cronJobCheckBackendStatus = require('../cronjobs/checkBackendStatus');
const cronJobDeleteOldRequests = require('../cronjobs/deleteOldRequests');
const cronJobSetStatus = require('../cronjobs/setStatus');
const cronJobUpdateScamList = require('../cronjobs/updateScamList');
const cronJobStorageBackup = require('../cronjobs/storageBackup');
const requestReactions = require('../util/requestReactions');
const flag = path.join(__dirname, '../../storage/restart.json');

module.exports = {
    name: 'ready',
    once: true,
    /**
     * 
     * @param {import('discord.js').Client} client 
     */
    async execute(client) {

        console.log(`Ready! Logged in as ${client.user.tag}`);

        cronJobCheckBackendStatus.start(client);
        cronJobDeleteOldRequests.start(client);
        cronJobSetStatus.start(client);
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
                client.channels.cache.get(id)?.send('Bot started!').catch(console.ignore);
            }
        }
    },
};
