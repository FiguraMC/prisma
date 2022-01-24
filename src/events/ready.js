const ContentBlocker = require('../util/contentBlocker');
const cronJobDeleteOldRequests = require('../cronjobs/deleteOldRequests');
const cronJobUpdateScamList = require('../cronjobs/updateScamList');
const requestReactions = require('../util/requestReactions');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {

        console.log(`Ready! Logged in as ${client.user.tag}`);

        cronJobDeleteOldRequests.start(client);
        cronJobUpdateScamList.start();

        requestReactions.init(client);

        // Only fetch all if not in dev mode, avoiding spamming the API when using nodemon
        if (process.argv[2] != 'dev') {
            console.log('Fetching all scam domains.');
            ContentBlocker.fetchThirdPartyScamListAll();
        }
    },
};
