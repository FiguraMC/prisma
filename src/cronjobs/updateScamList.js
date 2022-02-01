const CronJob = require('cron').CronJob;
const ContentBlocker = require('../util/contentBlocker');

/**
 * Set up cron job to fetch phishing domain every hour
 */
module.exports.start = function () {
    const job = new CronJob('0 0 * * * *', function () {
        ContentBlocker.fetchThirdPartyScamListRecent(4000);
    }, null, true, 'Europe/London');
    job.start();
};
