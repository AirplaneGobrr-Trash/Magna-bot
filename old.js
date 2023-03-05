let currentPlayerPOS = null
let blocPlrIsOn = null
const wall = "🧱" // 🌫️
const player = "🏃"
const box = "🛒"
const goal = "🟩"
const temp = "⬛"
const win = "✅"
const height = 6
const width = 9


function gameToString() {
    let gameRender = ""
    for (var e of game) {
        for (var block of e) {
            gameRender += `${block}`
        }
        gameRender += "\n"
    }
    console.log(gameRender)
    fs.writeFileSync("game.txt", gameRender)
    return gameRender

}

function genWalls() {
    for (var row in game) {
        if (row == 0) {
            for (var block in game[row]) {
                game[row][block] = wall
            }
        } else if (row == game.length - 1) {
            for (var block in game[row]) {
                game[row][block] = wall
            }
        } else {
            for (var block in game[row]) {
                game[row][0] = wall
                game[row][game[row].length - 1] = wall
            }
        }
    }
    // console.log(game)
    return
}

async function getRPOS(plrIn, __invaild) {
    let isPlr = plrIn
    if (__invaild) {
        let posIn = await getRPOS(plrIn)
        let pass = true
        for (var pos of __invaild) {
            if (pos.x == posIn.x && pos.y == posIn.y) {
                pass = false
            }
        }
        if (pass) return posIn; else {
            return await getRPOS(plrIn, __invaild)
        }
    } else {
        let sub = null
        if (plrIn) sub = 2; else sub = 4
        return {
            x: Math.floor(Math.random() * (width - sub)) + sub / 2,
            y: Math.floor(Math.random() * (hight - sub)) + sub / 2
        }
    }

}

async function genBlocks(blockCount) {
    let invaild = []
    var blocks = blockCount + 1
    for (let i = 0; i < blocks; i++) {
        var pos1 = await getRPOS(false, invaild)
        game[pos1.y][pos1.x] = goal
        // console.log(goal, pos1)
        invaild.push(pos1)
    }
    for (var i = 0; i < blocks; i++) {

        var pos2 = await getRPOS(false, invaild)
        //console.log(game[pos2.y])
        game[pos2.y][pos2.x] = box
        //console.log(game[pos2.y])
        //console.log(width-2,hight-2, pos2)
        invaild.push(pos2)
        // console.log(box, pos2)
    }
    let playerPOS = await getRPOS(true, invaild)
    // console.log(player, playerPOS)
    blocPlrIsOn = game[playerPOS.y][playerPOS.x]
    game[playerPOS.y][playerPOS.x] = player
    currentPlayerPOS = playerPOS
    // console.log(game)
    return
}

async function gen(level) {
    game = []
    for (let i = 0; i < hight + level; i++) {
        let tmp = []
        for (let ii = 0; ii < width + level; ii++) {
            tmp.push(temp)
        }
        game.push(tmp)
    }
    await genWalls()
    await genBlocks(level)
    await gameToString()
}
function updatePlayerPosition(position) {
    currentPlayerPOS = position;
}

function movePlayer(dy, dx) {
    const y = currentPlayerPOS.y + dy;
    const x = currentPlayerPOS.x + dx;
    let doneMove = false

    switch (game[y][x]) {
        case wall:{
            doneMove = true
            break
        }
        case win:{
            doneMove = true
            break
        }
        case box: {
            if (!doneMove) {
                const y2 = y+dy
                const x2 = x+dx
                if (game[y2][x2] == goal) {
                    //console.log(y,x,y2,x2)
                    game[y2][x2] = win
                    game[currentPlayerPOS.y][currentPlayerPOS.x] = blocPlrIsOn
                    game[y][x] = player;
                    currentPlayerPOS = { x, y };
                    blocPlrIsOn = temp
                    doneMove = true
                } else if (game[y2][x2] != wall || game[y2][x2] != box){
                    //console.log(y,x,y2,x2)
                    game[y2][x2] = box
                    game[currentPlayerPOS.y][currentPlayerPOS.x] = blocPlrIsOn
                    game[y][x] = player;
                    currentPlayerPOS = { x, y };
                    blocPlrIsOn = temp
                    doneMove = true
                }
            }

            break
        }
        default:{
            if (doneMove) break
            let e = game[y][x]
            game[y][x] = player;
            game[currentPlayerPOS.y][currentPlayerPOS.x] = blocPlrIsOn;
            blocPlrIsOn = e
            currentPlayerPOS = { x, y };
            break
        }
    }
}

function movePlayerUp() {
    movePlayer(-1, 0);
}

function movePlayerDown() {
    movePlayer(1, 0);
}

function movePlayerLeft() {
    movePlayer(0, -1);
}

function movePlayerRight() {
    movePlayer(0, 1);
}