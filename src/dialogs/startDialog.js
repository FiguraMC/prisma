const { handlers } = require('./registerDialogEvents');

// Starts a dialog by name
// Calls the message handle function with null as the message for the first step
// extras can be anything that is needed for the dialog
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

// Check if dialog can be started for a specified user
module.exports.canStartDialog = function (client, user) {
    const dialogs = client.dialogs;
    return !dialogs.has(user);
};
