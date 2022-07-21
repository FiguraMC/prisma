class ArgumentContainer {
    /**
     * @param {import('./argument')[]} args 
     */
    constructor(args) {
        this.args = args;
    }
    /**
     * @param {string} name 
     * @returns {import('./argument')}
     */
    get(name) {
        if (!this.args) return null;
        return this.args.find(arg => arg.name == name);
    }
    /**
     * @param {string} name 
     * @returns {import('./argument')}
     */
    getValue(name) {
        if (!this.args) return null;
        const argument = this.args.find(arg => arg.name == name);
        return argument.getValue();
    }
    /**
     * @returns {import('./argument')[]}
     */
    getAll() {
        return this.args;
    }
}
module.exports = ArgumentContainer;
