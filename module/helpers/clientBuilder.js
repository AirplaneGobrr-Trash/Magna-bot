const eris = require("eris")
const music = require("./music")

class e extends eris.Client {
    constructor(token, options = {}) {
        super(token, options)
        this.music = new music(this)
    }
}

module.exports = e