const fs = require("fs")
const path = require("path")
const dbBuilder = require("@airplanegobrr/database")

const mainDataPath = path.join(__dirname, "..", "..", "data")

//#region Discord helpers
const discord_dataPath = path.join(mainDataPath, "discord")
const discord_serverDataPath = path.join(discord_dataPath, "servers")
const discord_userDataPath = path.join(discord_dataPath, "users")
fs.mkdirSync(discord_serverDataPath, {recursive: true})
fs.mkdirSync(discord_userDataPath, {recursive: true})

const discord_server = {
    database: {
        async get(serverID) {
            const filePath = path.join(discord_serverDataPath, serverID, "data.json")
            fs.mkdirSync(path.join(discord_serverDataPath, serverID), {recursive: true})
            return new dbBuilder({ filename: filePath})
        },
        async getSokoban(serverID) {
            const filePath = path.join(discord_serverDataPath, serverID, "games", "sokoban.json")
            fs.mkdirSync(path.join(discord_serverDataPath, serverID, "games"), {recursive: true})
            return new dbBuilder({ filename: filePath })
        },
        async getSong(serverID) {
            const filePath = path.join(discord_serverDataPath, serverID, "songs.json")
            fs.mkdirSync(path.join(discord_serverDataPath, serverID), {recursive: true})
            return new dbBuilder({ filename: filePath })
        }
    },
    song: {
        async add(serverID, channelID, songID) {
            const serverDB = await discord_server.database.getSong(serverID)
            await serverDB.set("channel", channelID)
            // if (!await serverDB.has("songs")) await serverDB.set("songs", [])
            await serverDB.push("songs", songID)
            return songID
        },
        async getNext(serverID) {
            const serverDB = await discord_server.database.getSong(serverID)
            const songs = await serverDB.get("songs")
            var song = songs.shift()
            if (!song) return null
            await serverDB.set("songs", songs)
            await serverDB.set("currentSong", song)
            return song
        },
        async getQueue(serverID) {
            const serverDB = await discord_server.database.getSong(serverID)
            const songs = await serverDB.get("songs")
            return songs ?? null
        },
        async check(serverID){
            const serverDB = await discord_server.database.getSong(serverID)
            const songs = await serverDB.get("songs") ?? {}
            if (Object.keys(songs).length > 0) return true; else  return false;
        }
    }
}

const discord_user = {
    database: {
        async get(userID) {
            const filePath = path.join(discord_userDataPath, `${userID}.json`)
            return new dbBuilder({ filename: filePath })
        }
    }

}
//#endregion

//#region Web
//#endregion

//#region Twitch
const twitch = {
    dataPath: path.join(mainDataPath, "twitch"),

    user: {
        get(userID) {

        }
    }
}
fs.mkdirSync(twitch.dataPath, {recursive: true})
//#endregion

module.exports = {
    discord: {
        server: discord_server,
        user: discord_user,
        paths: {
            dataPath: discord_dataPath,
            serverDataPath: discord_serverDataPath,
            userDataPath: discord_userDataPath
        }
    },
    mainDataPath
}