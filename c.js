const fs = require("fs")
const sokoban = require("./sokoban")
const game = new sokoban(9, 6)
async function main(){
    game.loadGame(JSON.parse(fs.readFileSync("game.json")))

    game.gameToString()
    game.saveGame()
}
main()