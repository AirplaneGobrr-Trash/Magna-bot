const fs = require("fs")
const wall = "🧱" // 🌫️
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
        this.game = {
            // Walls
            wall:{},
            // Only should be one
            player:{},
            // Goals/Box
            blocks:{}
        }
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
    getCords(cordString){
        let spl = cordString.split(",")
        return {
            x:spl[0],
            y:spl[1]
        }
    }
    gameToString() {
        console.log(this.game)
        let game = []
        for (var y = 0; y < this.height; y++) {
            game[y] = []
            for (var x = 0; x < this.width; x++) {
                game[y][x] = temp
            }
        }
        
        let gameRender = ""
        // TODO: We should be doing it in this order:
        // Goals, Player, Walls
        // Walls will always be on top, we should also run a check to check if that space is already taken
        // If so we check whats going on, there is no fixing it at this stage but its nice to know
        for (var type in this.game){
            for (var data in this.game[type]){
                var cords = this.getCords(data)
                game[cords.y][cords.x] = this.game[type][data]
            }
        }

        for (var row of game){
            gameRender+=`${row.join("")}\n`
        }
        console.log(gameRender)
        fs.writeFileSync("game.txt", gameRender)
        return gameRender
    
    }
    
    genWalls() {
        // I spent forever trying to debug this,
        // This NEEDS to do -1 as it ropos the pos soo.. yea.
        // Arrays start at 0 in the loop, so we -1 from the X || Y to fix it,
        for (let x = 0; x < this.width; x++) {
            // Adds top
            this.game.wall[`${x},0`] = wall
            // Add bottem
            this.game.wall[`${x},${this.height-1}`] = wall
        }
        for (let y = 0; y < this.height; y++) {
            // Add Left wall
            this.game.wall[`0,${y}`] = wall
            // Add Right wall
            this.game.wall[`${this.width-1},${y}`] = wall
        }
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
                x: Math.floor(Math.random() * (this.width - sub - 1)) + sub / 2,
                y: Math.floor(Math.random() * (this.height - sub)) + sub / 2
            }
            // console.log(this.height - sub, sub / 2, out)
            return out
        }
    
    }
    
    async genBlocks(blockCount) {
        let invaild = []
        var blocks = blockCount + 1
        for (let i = 0; i < blocks; i++) {
            var pos1 = await this.getRPOS(false, invaild)
            console.log(goal, pos1)
            if (this.game.blocks[`${pos1.x},${pos1.y}`]) console.log("WARN", this.game.blocks[`${pos1.x},${pos1.y}`])
            this.game.blocks[`${pos1.x},${pos1.y}`] = goal
            invaild.push(pos1)
        }
        for (var i = 0; i < blocks; i++) {
    
            var pos2 = await this.getRPOS(false, invaild)
            console.log(box, pos2)
            if (this.game.blocks[`${pos1.x},${pos1.y}`]) console.log("WARN", this.game.blocks[`${pos1.x},${pos1.y}`])
            this.game.blocks[`${pos1.x},${pos1.y}`] = box
            invaild.push(pos2)
        }
        let playerPOS = await this.getRPOS(true, invaild)
        console.log(player, playerPOS)
        // this.blockPlrIsOn = this.game[playerPOS.y][playerPOS.x]
        this.game.player[`${playerPOS.x},${playerPOS.y}`] = player
        this.currentPlayerPOS = playerPOS
        // console.log(game)
        return
    }
    
    async gen(level) {
        this.game = {
            wall:{
            },
            player:{

            },
            blocks:{

            }
        }
        await this.genWalls()
        await this.genBlocks(level)
        await this.gameToString()
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