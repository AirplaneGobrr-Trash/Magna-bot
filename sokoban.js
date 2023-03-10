const fs = require("fs")
const wall = "🧱" // 🌫️
const player = "🏃"
const box = "🛒"
const goal = "🟩"
const temp = "⬛"
const win = "✅"

class sokoban {
    constructor(width = 9, height = 6, debug = false){
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
        // console.log(this.game)
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
        // console.log(gameRender)
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
    
    async getRPOS(plrIn, invaild) {
        let sub = null
        if (plrIn) sub = 2; else sub = 4
        let out = {
            x: Math.floor(Math.random() * (this.width - sub)) + sub / 2,
            y: Math.floor(Math.random() * (this.height - sub)) + sub / 2
        }
    
        // Check if the generated position is in the invaild array
        if (invaild) {
            var pass = true
            for (var pos of invaild) {
                if (pos.x == out.x && pos.y == out.y) {
                    // The generated position is invalid, generate a new one
                    pass = false
                }
            }
            if (!pass) return await this.getRPOS(plrIn, invaild)
        }
    
        return out
    }
    
    async genBlocks(blockCount) {
        let invaild = []
        var blocks = blockCount + 1
    
        // Generate positions for the goals
        for (let i = 0; i < blocks; i++) {
            var pos1 = await this.getRPOS(false, invaild)
            // console.log(goal, pos1)
    
            // Check if the position is already occupied
            if (this.game.blocks[`${pos1.x},${pos1.y}`]) {
                console.log("WARN", this.game.blocks[`${pos1.x},${pos1.y}`])
            }
    
            // Place the block at the position
            this.game.blocks[`${pos1.x},${pos1.y}`] = goal
            invaild.push(pos1)
        }
    
        // Generate positions for the boxes
        for (var i = 0; i < blocks; i++) {
            var pos2 = await this.getRPOS(false, invaild)
            // console.log(box, pos2)
    
            // Check if the position is already occupied
            if (this.game.blocks[`${pos2.x},${pos2.y}`]) {
                console.log("WARN", this.game.blocks[`${pos2.x},${pos2.y}`])
            }
    
            // Place the block at the position
            this.game.blocks[`${pos2.x},${pos2.y}`] = box
            invaild.push(pos2)
        }
        let playerPOS = await this.getRPOS(true, invaild)
        //console.log(player, playerPOS)
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
        this.genWalls()
        await this.genBlocks(level)
        this.gameToString()
    }
    movePlayer(dy, dx) {
        console.log(`Move: ${dy} ${dx}`)
        const y = this.currentPlayerPOS.y + dy;
        const x = this.currentPlayerPOS.x + dx;
        console.log(`New pos: ${y} ${x}`)
        let doneMove = false

        let gotoWallcheck = this.game.wall[`${x},${y}`]
        let gotoBlockCheck = this.game.blocks[`${x},${y}`]
    
        if (gotoWallcheck) {
            doneMove = true
        }
        if (gotoBlockCheck) {
            switch (gotoBlockCheck) {
                case win:{
                    doneMove = true
                    break
                }
                case box: {
                    if (!doneMove) {
                        const y2 = y+dy
                        const x2 = x+dx
                        console.log(`2 blocks infront: ${y2} ${x2}`)
                        if (this.game.blocks[`${x},${y}`] == box) {
                            console.log(`Win`)
                            delete this.game.player[`${this.currentPlayerPOS.x},${this.currentPlayerPOS.y}`]
                            delete this.game.blocks[`${x},${y}`]
                            delete this.game.blocks[`${this.currentPlayerPOS.x},${this.currentPlayerPOS.y}`]
                            //console.log(y,x,y2,x2)
                            this.game.blocks[`${x2},${y2}`] = win
                            this.game.player[`${x},${y}`] = player;
                            this.currentPlayerPOS = { x, y };
                            doneMove = true
                        } else if (this.game.blocks[`${x},${y}`] != wall || this.game.blocks[`${x},${y}`] != box){
                            console.log(`Move block`)
                            delete this.game.player[`${this.currentPlayerPOS.x},${this.currentPlayerPOS.y}`]
                            delete this.game.blocks[`${x},${y}`]
                            //console.log(y,x,y2,x2)
                            this.game.blocks[`${x2},${y2}`] = box
                            this.game.player[`${x},${y}`] = player;
                            this.currentPlayerPOS = { x, y };
                            doneMove = true
                        }
                    }
        
                    break
                }

                case goal: {
                    doneMove = true
                    break
                }
            }
        }
        
        // [`${x},${y}`]

        if (!doneMove) {
            delete this.game.player[`${this.currentPlayerPOS.x},${this.currentPlayerPOS.y}`] 
            this.game.player[`${x},${y}`] = player;
            this.currentPlayerPOS = { x, y };
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