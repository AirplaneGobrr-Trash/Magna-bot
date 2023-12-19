const dysnomia = require("@projectdysnomia/dysnomia");
const music = require("./music")

class e extends dysnomia.Client {
    constructor(token, options = {}) {
        super(token, options)
        this.music = new music(this)
    }
}

module.exports = e