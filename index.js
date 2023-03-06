const newSodo = require("./sokoban")
const game = new newSodo()

async function main(){
    await game.gen(2)
}
main()