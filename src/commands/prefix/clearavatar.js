const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const DataStorage = require('../../util/dataStorage');
const { NodeSSH } = require('node-ssh');

module.exports = {
    name: 'clearavatar',
    usage: '`?clearavatar` - Clears your Figura avatar from the backend.',
    cooldown: 10 * 60 * 1000, // 10 minutes
    /**
     * 
     * @param {Discord.Message} message 
     */
    async execute(message) { // eslint-disable-line no-unused-vars

        if (!DataStorage.storage.people) DataStorage.storage.people = {};
        if (DataStorage.storage.people[message.member.id] == undefined) DataStorage.storage.people[message.member.id] = {};
        const uuid = DataStorage.storage.people[message.member.id].mcuuid;
        const ign = DataStorage.storage.people[message.member.id].mcign;

        if (uuid) {
            if (!uuid.match(/[^0-9a-f]/gi)) {

                const ssh = new NodeSSH();

                ssh.connect({
                    host: process.env.FIGURA_SERVER,
                    username: process.env.FIGURA_SERVER_CREDENTIALS.split(',')[0],
                    password: process.env.FIGURA_SERVER_CREDENTIALS.split(',')[1],
                    port: 22,
                })
                    .then(async () => {
                        // console.log('mysql -e "use figura;DELETE FROM user_data WHERE uuid=\\"' + uuid + '\\";"');
                        // eslint-disable-next-line no-unused-vars
                        const r = await ssh.execCommand('mysql -e "use figura;DELETE FROM user_data WHERE uuid=\\"' + uuid + '\\";"');
                        // console.log('stdout: ' + r.stdout);
                        // console.error('stderr: ' + r.stderr);
                        ssh.dispose();
                        message.reply('Cleared your avatar from the backend.');
                    });
            }
            else {
                message.reply('Something went wrong! Please contact a moderator.');
                console.log(`Corrupted Minecraft UUID detected!\nUser: ${message.author.tag}\nUUID: ${uuid}\nIGN: ${ign}`);
            }
        }
        else {
            message.reply('No Minecraft in game name connected. Please ask a moderator to add it for you.');
        }
    },
};
