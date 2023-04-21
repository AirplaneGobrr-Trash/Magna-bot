var baseURL = "https://images.chesscomfiles.com/chess-themes/pieces/neo/128/"
// bp.png
// black pawn
var letters = {
    "p": "pawn",
    "b": "bishop",
    "k": "king",
    "n": "knight",
    "r": "rook",
    "q": "queen"
}

const https = require('https');
const fs = require('fs');

function downloadImage(url, fileName) {
  https.get(url, (response) => {
    response.pipe(fs.createWriteStream(fileName));
  });
}

for (var a in letters){
    console.log(a)
    downloadImage(baseURL+`b${a}.png`, `b_${letters[a]}.png`)
    downloadImage(baseURL+`w${a}.png`, `w_${letters[a]}.png`)
}