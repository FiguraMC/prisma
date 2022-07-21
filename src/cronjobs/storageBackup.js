const CronJob = require('cron').CronJob;
const DataStorage = require('../util/dataStorage');

/**
 * DataStorage backup every day
 */
module.exports.start = function () {
    const job = new CronJob('0 0 0 * * *', function () {
        DataStorage.backup();
    }, null, true, 'Europe/London');
    job.start();
};
