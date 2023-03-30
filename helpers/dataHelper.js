const fs = require("fs")
const path = require("path")
const dbBuilder = require("@airplanegobrr/database")

const dataPath = path.join(__dirname, "..", "data")
const serverDataPath = path.join(dataPath, "servers")

const server = {
    database: {
        async get(serverID) {
            const filePath = path.join(serverDataPath, serverID, "data.json")
            fs.mkdirSync(path.join(serverDataPath, serverID), {recursive: true})
            return new dbBuilder({ filename: filePath})
        },
        async getSokoban(serverID) {
            const filePath = path.join(serverDataPath, serverID, "games", "sokoban.json")
            fs.mkdirSync(path.join(serverDataPath, serverID, "games"), {recursive: true})
            return new dbBuilder({ filename: filePath })
        }
    }
}

module.exports = {
    server
}