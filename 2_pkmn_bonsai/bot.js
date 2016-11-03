let fs = require('fs');
let Canvas = require('canvas');
let Image = Canvas.Image;
let canvas = new Canvas(512, 512);
let ctx = canvas.getContext('2d');
let Noise = require('noisejs').Noise;
let Twitter = require('twitter');
let client = new Twitter(JSON.parse(fs.readFileSync('creds.json')));

let tiles = new Image();
tiles.src = fs.readFileSync('./redbluetiles.png');

const outWidthTiles = 32;
const outHeightTiles = 32;
const widthTiles = 38;
const heightTiles = 41;
const tileWidth = 16;
const tileHeight = 16;

/*
  1
8   2
  4

1   2
  0
8   4

 76,  77,  78
114, 115, 116
152, 153, 154
190, 191, 192


*/

let no = 9;

// 0, 38, 76, 114, 152, 190, 228, 266, 304, 342, 380
//                    0    1    2    3    4    5    6    7    8    9   10   11   12   13   14   15
let cliffTiles =    [no,  no,  no, 152,  no, 115,  76, 114,  no, 154, 115, 153,  78, 116,  77, 115,
                     77,  77,  77, 192,  no, 116,  76, 190, 114, 154, 115, 153,  78, 116,  77, 115];
let cliffTilesAlt = [no, 154, 152, 153,  76, 115, 114, 190,  78, 116, 115, 192,  77, 115, 115, 115];
let cliffTilesAlt2 =[115, 153, 114, 190,  77,  no,  no,  no, 116, 192,  no,  no,  no,  no,  no,  no];
let ledgeTiles = [];
let waterTiles = [];
let grassTiles = [0, 1, 2, 3, 38, 39, 40, 41];

let houseTiles = [];

let caveDoor = 191;
let treeTile = 44;

/*
generate noise
draw hills
draw trees
draw water
place doors
generate paths
clear out path areas
research rock gardens
*/

let pickRandom = (arr) => {
    return arr[Math.floor(Math.random()*arr.length)];
}

let sumNeighborsAlt = (x, y, gen) => {
    return gen(x-1, y-1) + gen(x+1, y-1)*2 + gen(x+1, y+1)*4 + gen(x-1, y+1)*8;
}
let sumNeighbors = (x, y, gen) => {
    let neighbors = gen(x, y-1) + gen(x+1, y)*2 + gen(x, y+1)*4 + gen(x-1, y)*8;
    if(neighbors === 15) {
        // disambiguate using open corners
        let corners = sumNeighborsAlt(x, y, gen);
        neighbors += 15-corners;
    }

    return neighbors
}

let itop = (i) => {
    return {x: (i%widthTiles)*tileWidth, y: Math.floor(i/widthTiles)*tileHeight};
}

let seed = Math.floor(Math.random()*32000);
console.log(seed);
let scale = widthTiles/4;
let src = null;
let gen = (percent, noise = new Noise(seed++)) => (x, y, off) => (noise.perlin2(x/scale, y/scale)+1)/2 < percent ? 1 : 0;
let add = (p, c) => p + c;
let blur = (gen, kernel = [-1, 0, 1]) => (x, y, off) => {
    return Math.floor(kernel.map(dx => kernel.map(dy => gen(x+dx, y+dy, off)).reduce(add)).reduce(add) / 9);
}
let reverse = (gen) => (x, y, off) => 1-gen(x, y, off);


let grid = [];
let treeGen = gen(0.45);
let dirtGen = gen(0.54);
let grassGen = gen(0.5);
let cliffsGen = reverse(blur(gen(0.6)));
let to = (x, y) => x+y*outWidthTiles;

for(let y=0; y<outHeightTiles; y++) {
    for(let x=0; x<outWidthTiles; x++) {
        let tile;

        let tree = treeGen(x, y);
        tile = tree*treeTile;

        let dirt = dirtGen(x, y);
        tile = dirt*grassTiles[4] || tile;

        let grass = dirtGen(x, y) * grassGen(x, y);
        tile = grass*grassTiles[5] || tile;

        let cliffs = Math.floor(sumNeighbors(x, y, cliffsGen));
        tile = cliffsGen(x, y) ? cliffTiles[cliffs] : tile;

        grid[to(x,y)] = {tile: tile, x: x, y: y};
    }
}

let transformers = [
    (grid) => { // cave door
        if(Math.random() > 0.5) {
            let tile = pickRandom(grid.filter(x => x.tile === 153));
            if(tile) {
                grid[to(tile.x, tile.y)] = {tile: caveDoor, x: tile.x, y: tile.y};
            }
        }
        return grid;
    }
];

transformers.forEach(transform => {
    grid = transform(grid);
});

grid.forEach(tile => {
    src = itop(tile.tile);
    ctx.drawImage(tiles, src.x, src.y, tileWidth, tileHeight, tile.x*tileWidth, tile.y*tileHeight, tileWidth, tileHeight);
});

canvas.pngStream().pipe(fs.createWriteStream('./out.png'));

client.post('media/upload', {media: canvas.toBuffer()}, (error, media, res) => {
    if(!error) {
        let status = {
            status: 'hello from pokemon',
            media_ids: media.media_id_string
        };

        client.post('statuses/update', status, (error, tweet, res) => {
            if(!error) {
                console.log('tweet success');
            }
        });
    }
});
