const { handlers } = require('./registerDialogEvents');

module.exports.startDialog = function (client, user, dialogName, extras) {

    const dialogs = client.dialogs;

    if (module.exports.canStartDialog(client, user)) {
        dialogs.set(user, {
            name: dialogName,
            step: -1,
            data: [],
            extras: extras,
        });
        if (handlers.has(dialogName)) {
            handlers.get(dialogName).handle(null, user, dialogs.get(user));
        }
    }
};

module.exports.canStartDialog = function (client, user) {
    const dialogs = client.dialogs;
    return !dialogs.has(user);
};
