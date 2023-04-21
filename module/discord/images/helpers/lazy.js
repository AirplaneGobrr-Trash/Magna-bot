const fs = require("fs")

var dir = fs.readdirSync("./")
for (var file of dir) {
    if (file.includes("_png_128px")){
        fs.rename(file, file.replace("_png_128px", ""),()=>{})
    }
}

const { createCanvas, loadImage } = require('canvas')
var pieceS = 128

const canvas = createCanvas(pieceS*8,pieceS*8)
const ctx = canvas.getContext('2d')
for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
        ctx.beginPath();
        ctx.fillStyle = ["#eeeed2", "#630"][(i + j) % 2];
        ctx.fillRect(j * pieceS, i * pieceS, pieceS, pieceS);
        ctx.closePath();
    }
}
const out = fs.createWriteStream(__dirname + '/test.png')
const stream = canvas.createPNGStream()
stream.pipe(out)
out.on('finish', () =>  console.log('The PNG file was created.'))