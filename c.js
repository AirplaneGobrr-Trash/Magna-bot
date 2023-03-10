const fs = require("fs")
const sokoban = require("./sokoban")
const game = new sokoban(9, 6, true)
async function main(){
    if (fs.existsSync("game.json")) {
        game.loadGame(JSON.parse(fs.readFileSync("game.json")))
        console.log(game.gameToString())
        game.saveGame()
    } else {
        await game.gen(1)
        console.log(game.gameToString())
        game.saveGame()
    }
}
main()