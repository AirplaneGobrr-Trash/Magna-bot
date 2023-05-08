// document.body.style.border = "5px solid red";
console.clear()
console.log("Hello, World!")

window.streamAddon = {
    debug: false,
    loadedURL: false,
    socket: null
}

async function loadScriptURL(url) {
    var script = document.createElement("script");
    script.setAttribute("type", "text/javascript");
    script.setAttribute("src", url);
    document.getElementsByTagName("head")[0].appendChild(script);
}

// window.streamAddon.debug

async function print(__args) {
    if (window.streamAddon.debug) console.log(__args)
}

async function checkAndGetGame() {
    const board = document.querySelector("chess-board")
    const gameF = (board && board?.game) || window?.game;
    if (gameF) {
        print("Game found!")
        return gameF
    } else {
        print("Game not found!")
        return null
    }
}

async function checkAndGetTournament(){
    const headerInfo = document.querySelector(".tournament-header-info")
    const players = document.querySelector(".tournament-standings-tab-component")
    print("plrs",players)
    print("heder", headerInfo)
    if (headerInfo && players) {
        var info = {
            players: {}
        }
        for (var child of headerInfo.children) {
            var cText = child.innerHTML
            // console.log(cText)
            if (cText.includes("Starts in ")) {
                info.start = cText.split("Starts in ")[1]
            } else if (cText.includes("rounds") && cText.includes("players")) {
                // 7 rounds | 19 players
                var splt = cText.split(" | ")
                // 7 rounds,19 players
                info.rounds = splt[0].replace(/\D/g, "")
                info.playerCount = splt[1].replace(/\D/g, "")
            } else if (cText.includes("|")) {
                info.name = cText
            }
        }
        for (var weridDivHolder of players.children) {
            for (var playerDiv of weridDivHolder.children) {
                // console.log(playerDivChild)
                // rank: tournament-standings-row-place
                // avatar: avatar-component tournament-standings-row-avatar
                // rating: user-tagline-rating
                // country: country-flags-component
                // score: tournament-standings-row-score
                // tie: tournament-standings-row-tiebreak
                var nameElm = playerDiv.querySelector(".user-username-component")
                var rankElm = playerDiv.querySelector(".tournament-standings-row-place")
                var avatarElm = playerDiv.querySelector(".avatar-component")
                var ratingElm = playerDiv.querySelector(".user-tagline-rating")
                var countryElm = playerDiv.querySelector(".country-flags-component")
                var scoreElm = playerDiv.querySelector(".tournament-standings-row-score")
                var tieElm = playerDiv.querySelector(".tournament-standings-row-tiebreak")
                var isPlaying = playerDiv.querySelector(".tournament-standings-row-visible") ? true : false

                if (nameElm) {
                    info.players[nameElm.innerHTML] = {
                        rank: rankElm.innerHTML.replace(/\D/g, ""),
                        avatar: avatarElm.src,
                        rating: ratingElm.innerHTML.replace(/\D/g, ""),
                        country: countryElm?.classList[1]?.replace("country-", "") ?? "",
                        score: scoreElm.innerHTML,
                        tie: tieElm?.innerHTML,
                        playing: isPlaying
                    }
                }
            }
        }
        print("tInfo", info)
        return info
    } else return null
    //children
}

async function getPlayers(){
    // board-layout-player-top
    // board-layout-player-bottom

    // time: clock-time-text
    // username: user-username-component
    // rating: user-tagline-rating
    // country: country-flags-component

    const players = {
        topPlayer: document.querySelector(".player-top"),
        bottomPlayer: document.querySelector(".player-bottom")
    }
    print(players)
    if (players.topPlayer && players.bottomPlayer) {
        for (var player in players) {
            var playerElm = players[player]
            print(playerElm, player)
            var nameElm = playerElm.querySelector(".user-username-component")
            var ratingElm = playerElm.querySelector(".user-tagline-rating")
            var countryElm = playerElm.querySelector(".country-flags-component")
            var isPlaying = playerElm.querySelector(".tournament-standings-row-visible")? true : false
            players[player] = {
                avatar: playerElm.querySelector(".player-avatar-component")?.childNodes[0]?.src ?? "",
                rating: ratingElm?.innerHTML.replace(/\D/g, ""),
                country: countryElm?.classList[1]?.replace("country-", "") ?? "",
                name: nameElm.innerHTML
            }
        }
        return players
    }
    return null
}

async function getType(gameInput, tournamentInput){
    if (gameInput && tournamentInput) {
        return 1 // A game AND tournament are found, AKA we are playing in the tournament!
    } else if (gameInput) {
        return 2 // Not a tournament, but we are playing a game
    } else if (tournamentInput) {
        return 3 // Not playing, but a tournament is seen
    } else {
        return null // Nothing was found
    }
}

async function getOwnUser(){
    const user = document.querySelector(".home-user-info")
    // avtor: home-user-avatar
    // name: home-username-link
    if (user) {
        const nameElm = user.querySelector(".home-username-link")
        const avatarElm = user.querySelector(".home-user-avatar")
        console.log(avatarElm)
        return {
            avatar: avatarElm.children[0]?.src ?? "",
            name: nameElm.innerHTML
        }
    } else {
        return null
    }
}

async function getTabs(){
    const tabsElms = document.querySelectorAll(".tabs-tab")
    if (tabsElms) {
        const tabs = []
        for (var elm of tabsElms){
            const title = elm.querySelector(".tabs-label")
            tabs.push(title.innerHTML)
        }
        return tabs
    }
    return null
}

async function socketControl(socket) {
    socket.on("connect", () => {
        console.log("Connected")
    })
    socket.on("disconnect", () => {
        console.log("Disconnected")
    })
}

async function check() {
    if (!window.streamAddon.loadedURL) {
        await loadScriptURL("https://chess.airplanegobrr.xyz/socket.io/socket.io.js")
        window.streamAddon.loadedURL = true
    } else if (window.streamAddon.loadedURL && !window.streamAddon.socket) {
        // check if socketio is loaded
        if (io) {
            window.streamAddon.socket = io("https://chess.airplanegobrr.xyz")
            socketControl(window.streamAddon.socket)
        }
    }
    const tournament = await checkAndGetTournament()
    const gameCheck = await checkAndGetGame()
    const playerPlayingInfo = await getPlayers()
    const gameType = await getType(gameCheck, tournament)
    const ownUser = await getOwnUser()
    const titles = await getTabs()
    if (ownUser) {
        localStorage.setItem("streamerUser", ownUser.name)
    }
    switch (gameType) {
        case 1: {
            console.log("A game AND tournament are found, AKA we are playing in the tournament!")
            break
        }
        case 2: {
            console.log("Playing a game")
            break
        }
        case 3: {
            console.log("Not playing, but a tournament is seen")
            break
        }
        default: {
            console.log("Nothing was found")
            break
        }
    }
}



async function addLoop() {
    window.streamAddon.inter = setInterval(check, 500)
}
addLoop()