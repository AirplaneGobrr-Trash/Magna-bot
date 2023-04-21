const fs = require("fs")
const path = require("path")
const dbBuilder = require("@airplanegobrr/database")

const dataPath = path.join(__dirname, "..", "..", "data", "discord")
const serverDataPath = path.join(dataPath, "servers")
const userDataPath = path.join(dataPath, "users")
fs.mkdirSync(serverDataPath, {recursive: true})
fs.mkdirSync(userDataPath, {recursive: true})

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

const user = {
    database: {
        async get(userID) {
            const filePath = path.join(userDataPath, `${userID}.json`)
            return new dbBuilder({ filename: filePath })
        }
    }

}

module.exports = {
    server,
    user,
    paths: {
        dataPath,
        serverDataPath,
        userDataPath
    }
}