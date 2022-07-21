class CommandParseError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CommandParseError';
    }
}
module.exports = CommandParseError;
