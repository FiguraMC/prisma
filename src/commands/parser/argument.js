class Argument {
    constructor(name, type, options, value) {
        this.name = name;
        this.type = type;
        this.options = options ?? {};
        this.value = value;
    }
    getValue() {
        return this.value;
    }
}
module.exports = Argument;
