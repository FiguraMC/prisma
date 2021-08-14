const RequestItemType = require('./RequestItemType');

class RequestBuilder {
    constructor(items) {
        this.items = items;
        this.index = 0;
        this.status = 'progress'
    }
    input(input) {
        if (this.items[this.index]?.type == RequestItemType.IMAGE) {
            let attachment = input.attachments.values().next().value; // first attachment
            if (attachment != undefined) {
                // if there is an attachment, use it
                this.items[this.index].value = attachment.url;
            }
            else {
                // otherwise use message content, could be a link to an image for example
                this.items[this.index].value = input.content;
            }
        }
        else if (this.items[this.index]?.type == RequestItemType.TEXT) {
            this.items[this.index].value = input.content;
        }
        else if (this.items[this.index]?.type == RequestItemType.TAGS) {
            let tags = input;
            this.items[this.index].value = tags;
        }
        this.index++;
        if (this.index >= this.items.length) {
            this.status = 'done'
        }
    }
    getState() {
        return {
            items: this.items,
            next: this.items[this.index],
            status: this.status
        };
    }
}

module.exports = RequestBuilder;