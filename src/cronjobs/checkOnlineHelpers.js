const CronJob = require('cron').CronJob;

/**
 * Update online helpers count every 10 minutes
 */
module.exports.start = function (client) {
    const job = new CronJob('*/10 * * * *', async function () {
        const guild = await client.guilds.fetch(process.env.MAIN_GUILD);
        await guild.members.fetch(); // update cache
        const channel = await guild.channels.fetch(process.env.HELP_CHANNELS.split(',')[0]); // only use the first help channel to show online hellpers
        const helperRole = await guild.roles.fetch(process.env.HELPER_ROLE);

        // count online helpers
        const amount = helperRole.members.filter((member) => member.presence?.status == 'online' || member.presence?.status == 'idle').size;

        // convert each digit of the amount into emojis
        let onlineHelpersString = '';
        amount.toString().split('').forEach(digit => {
            onlineHelpersString += convertToEmoji(digit);
        });
        // add the custom helper emoji
        onlineHelpersString += `<:_:${process.env.HELPER_EMOJI}>`;

        // check if we either have to replace or newly add the online helpers string to the channel topic
        if (channel.topic.includes(' - ')) {
            const oldTopic = channel.topic.split(' - ');
            channel.setTopic(onlineHelpersString + ' - ' + oldTopic[1]);
        }
        else {
            channel.setTopic(onlineHelpersString + ' - ' + channel.topic);
        }

    }, null, true, 'Europe/London');
    job.start();
};

/**
 * 
 * @param {string} n A single character digit from range 0-9
 * @returns 
 */
function convertToEmoji(digit) {
    switch (digit) {
        case '1':
            return ':one:';
        case '2':
            return ':two:';
        case '3':
            return ':three:';
        case '4':
            return ':four:';
        case '5':
            return ':five:';
        case '6':
            return ':six:';
        case '7':
            return ':seven:';
        case '8':
            return ':eight:';
        case '9':
            return ':nine:';
        default:
            return ':zero:';
    }
}
