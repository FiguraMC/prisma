const got = require('got');

module.exports.getMessage = (id) => {
    return new Promise((resolve, reject) => {
        got(`https://api.pluralkit.me/v2/messages/${id}`)
            .then(res => {
                resolve(JSON.parse(res.body));
            })
            .catch(err => {
                resolve(null);
            });
    });
};
