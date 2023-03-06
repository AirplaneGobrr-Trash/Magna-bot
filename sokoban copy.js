const fs = require("fs")
const wall = "🌫️" // 🌫️
const player = "🏃"
const box = "🛒"
const goal = "🟩"
const temp = "⬛"
const win = "✅"

class sokoban {
    constructor(width = 9, height = 6){
        this.width = width
        this.height = height
        this.currentPlayerPOS = null
        this.blockPlrIsOn = null
        this.game = []
    }
    loadGame(json){
        this.width = json.width
        this.height = json.height
        this.currentPlayerPOS = json.currentPlayerPOS
        this.blockPlrIsOn = json.blockPlrIsOn
        this.game = json.game
    }
    saveGame(){
        fs.writeFileSync("game.json", JSON.stringify(this))
    }
    gameToString() {
        let gameRender = ""
        for (var e of this.game) {
            for (var block of e) {
                gameRender += `${block}`
            }
            gameRender += "\n"
        }
        console.log(gameRender)
        // fs.writeFileSync("game.txt", gameRender)
        return gameRender
    
    }
    
    genWalls() {
        for (var row in this.game) {
            if (row == 0) {
                for (var block in this.game[row]) {
                    this.game[row][block] = wall
                }
            } else if (row == this.game.length - 1) {
                for (var block in this.game[row]) {
                    this.game[row][block] = wall
                }
            } else {
                for (var block in this.game[row]) {
                    this.game[row][0] = wall
                    this.game[row][this.game[row].length - 1] = wall
                }
            }
        }
        // console.log(game)
        return
    }
    
    async getRPOS(plrIn, __invaild) {
        if (__invaild) {
            let posIn = await this.getRPOS(plrIn)
            let pass = true
            for (var pos of __invaild) {
                if (pos.x == posIn.x && pos.y == posIn.y) {
                    pass = false
                }
            }
            if (pass) return posIn; else {
                return await this.getRPOS(plrIn, __invaild)
            }
        } else {
            let sub = null
            if (plrIn) sub = 2; else sub = 4
            let out = {
                x: Math.floor(Math.random() * (this.width - sub)) + sub / 2,
                y: Math.floor(Math.random() * (this.height - sub)) + sub / 2
            }
            // console.log(out, sub)
            return out
        }
    
    }
    
    async genBlocks(blockCount) {
        let invaild = []
        var blocks = blockCount + 1
        for (let i = 0; i < blocks; i++) {
            var pos1 = await this.getRPOS(false, invaild)
            // console.log(goal, pos1)
            this.game[pos1.y][pos1.x] = goal
            invaild.push(pos1)
        }
        for (var i = 0; i < blocks; i++) {
    
            var pos2 = await this.getRPOS(false, invaild)
            // console.log(box, pos2)
            this.game[pos2.y][pos2.x] = box
            invaild.push(pos2)
        }
        let playerPOS = await this.getRPOS(true, invaild)
        // console.log(player, playerPOS)
        this.blockPlrIsOn = this.game[playerPOS.y][playerPOS.x]
        this.game[playerPOS.y][playerPOS.x] = player
        this.currentPlayerPOS = playerPOS
        // console.log(game)
        return
    }
    
    async gen(level) {
        this.game = []
        for (let i = 0; i < this.height + level; i++) {
            let tmp = []
            for (let ii = 0; ii < this.width + level; ii++) {
                tmp.push(temp)
            }
            this.game.push(tmp)
        }
        this.genWalls()
        await this.genBlocks(level)
        this.gameToString()
    }
    movePlayer(dy, dx) {
        const y = this.currentPlayerPOS.y + dy;
        const x = this.currentPlayerPOS.x + dx;
        let doneMove = false
    
        switch (this.game[y][x]) {
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
                    if (this.game[y2][x2] == goal) {
                        //console.log(y,x,y2,x2)
                        this.game[y2][x2] = win
                        this.game[this.currentPlayerPOS.y][this.currentPlayerPOS.x] = this.blockPlrIsOn
                        this.game[y][x] = player;
                        this.currentPlayerPOS = { x, y };
                        this.blockPlrIsOn = temp
                        doneMove = true
                    } else if (this.game[y2][x2] != wall || this.game[y2][x2] != box){
                        //console.log(y,x,y2,x2)
                        this.game[y2][x2] = box
                        this.game[this.currentPlayerPOS.y][this.currentPlayerPOS.x] = this.blockPlrIsOn
                        this.game[y][x] = player;
                        this.currentPlayerPOS = { x, y };
                        this.blockPlrIsOn = temp
                        doneMove = true
                    }
                }
    
                break
            }
            default:{
                if (doneMove) break
                let e = this.game[y][x]
                this.game[y][x] = player;
                this.game[this.currentPlayerPOS.y][this.currentPlayerPOS.x] = this.blockPlrIsOn;
                this.blockPlrIsOn = e
                this.currentPlayerPOS = { x, y };
                break
            }
        }
    }
    
    movePlayerUp() {
        this.movePlayer(-1, 0);
    }
    
    movePlayerDown() {
        this.movePlayer(1, 0);
    }
    
    movePlayerLeft() {
        this.movePlayer(0, -1);
    }
    
    movePlayerRight() {
        this.movePlayer(0, 1);
    }
}

module.exports = sokoban