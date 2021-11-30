class RequestItem {
    constructor(name, heading, instructions, components, type) {
        this.name = name;
        this.heading = heading;
        this.instructions = instructions;
        this.type = type;
        this.value = undefined;
        this.components = components;
    }
}

module.exports = RequestItem