const { Chess } = require('chess.js')
const chess = new Chess()

async function move(from, to){
    let moves = chess.moves()
    let posMoves = []
    for (var move of moves){
        if (move.includes(to)) {
            posMoves.push(move)
        }
    }
    console.log(posMoves)
}

async function test1(){
    chess.clear()
    chess.put({ type: chess.PAWN, color: chess.WHITE }, 'a7')
    chess.put({ type: chess.PAWN, color: chess.BLACK }, 'a8')
    console.log(chess.move({from: "a7", to: "a8", promotion: "q"}))
    //"B2-B3"
    // console.log(chess.board())
     console.log(chess.ascii())
    console.log(chess.moves())
    // move("b1", "c3")
}
test1()