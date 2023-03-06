const fs = require("fs")
const newSodo = require("./sokoban")
const game = new newSodo()

async function create(){
    await game.gen(4)
    
}
async function load(){
    game.loadGame((require("./game.json")))
}
async function main(){
    // await create()
    await load()
    game.movePlayerLeft()
    console.log(game.gameToString())
    await game.saveGame()
}
main()