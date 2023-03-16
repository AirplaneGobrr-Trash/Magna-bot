const chessLib = require('chess.js');
const canvas = require('canvas');
const fs = require("fs")

const CELL_SIZE = 50; // size of each cell in pixels
const BOARD_SIZE = 8; // number of rows and columns on the board

// Chess.com colors SSHHH!!!!
const colors = ['#eeeed5', '#7d945d'];
const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const P_colors = ["w", "b"];
const pieces = ["pawn", "night", "bishop", "rook", "queen", "king"];

var images = {};

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

class Chess {
    constructor(dataFen) {
        if (dataFen) {
            this.game = new chessLib.Chess(dataFen)
            // this.game.move("A2")
        } else {
            this.game = new chessLib.Chess()
        }
    }
    async checkImage(){
        if (Object.keys(images) == 0) {
            for (const color of P_colors) {
                images[color] = {};
                for (const piece of pieces) {
                    // const key = `${color}_${piece}`;
                    const url = `./images/v2/${color.charAt(0)}_${piece}.png`;
                    images[color][piece.charAt(0)] = await canvas.loadImage(url);
                }
            }
            return images
        }
        return images
    }
    async render() {
        await this.checkImage()
        const array = [];
        var board = this.game.board()
        // console.log(board, images)
        for (let row in board) {
            for (let piece in board[row]) {
                let pData = board[row][piece]
                if (pData) array.push({ color: pData.color, type: pData.type, x: piece, y: row });
            }
            // array.push({ color, type: pieces[key].toLowerCase(), x: xCoord, y: yCoord });
        }

        // Create a canvas element
        const canvasElement = canvas.createCanvas(BOARD_SIZE * CELL_SIZE, BOARD_SIZE * CELL_SIZE);
        const ctx = canvasElement.getContext('2d');

        // I should prob have the whole board Pre-Rendered or something
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const colorIndex = (i + j) % 2;
                const color = colors[colorIndex];

                ctx.fillStyle = color;
                ctx.fillRect(i * CELL_SIZE, j * CELL_SIZE, CELL_SIZE, CELL_SIZE);

                // Set the text color to the opposite of the background color
                ctx.fillStyle = (color === colors[0]) ? colors[1] : colors[0];

                ctx.textAlign = 'left';
                ctx.textBaseline = 'bottom';
                ctx.font = '13px Comic Sans MS';

                
                if (j === 7) { // Letters
                    ctx.fillText(letters[i], i * CELL_SIZE, (j + 1) * CELL_SIZE);
                }
                if (i === 0) { // Numbers
                    ctx.fillText(8 - j, i * CELL_SIZE, (j + 1) * CELL_SIZE);
                }
            }
        }

        array.forEach((piece) => {
            // console.log(piece, images[piece.color][piece.type])
            const pieceSize = CELL_SIZE * 1; // Not needed, Leaving it just incase!
            const offset = (CELL_SIZE - pieceSize) / 2;
            ctx.drawImage(images[piece.color][piece.type], piece.x * CELL_SIZE + offset, piece.y * CELL_SIZE + offset, pieceSize, pieceSize);
        });

        const out = fs.createWriteStream(__dirname + '/test.png')
        const stream = canvasElement.createPNGStream()
        stream.pipe(out)
        out.on('finish', () => console.log('The PNG file was created.'))
        return canvasElement.toBuffer()
    }
}

module.exports = {
    Chess
}

async function test(){
    const game = new Chess()
    // console.log(await game.render())
}
// test()