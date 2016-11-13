/*
    fill grid with rando characters, define that as okay
    try to fit words into the grid by force
    have words read left to right, word wrap, ignore word columns
        haikus
        regexcrossword.com
        genius api
*/
const seedrandom = require('seedrandom');
let _;
const fs = require('fs');
const Canvas = require('canvas');

/*
 (FD|BG|ER?)+[D-F]*[^WEV]{3,}\1\2
 (A)(B)(C)(D)(E)(F)(G)(H)
 (AB)(C)(D)(E)(F)(G)(H)
 [AB]+[CDE]+(FGH)?
 [ABGF]*[CDEF]+(FE?GH)?
 
 (A)(B) => (A)(B), (AB), [AB]+*, [^(.not AB)]+*
 [A][B] => (A)(B), (AB), [AB]+*
 
 red herrings
 ... => ...X?...
 (A) => (A|X|Y)
 [A] => [AXY]
 () => ()+*
 [] => []+*
 
*/

const buildGrid = (day) => {
    // seed generation so that we can regenerate old puzzles for solution
    const daySeed = '' + day.getFullYear() + day.getMonth() + day.getDate();
    const rng = seedrandom(daySeed);
    // recapture the Math.random
    // (oh god this actually works)
    Math.random = rng;
    delete require.cache['loadash'];
    _ = require('lodash');

    const dayIndex = day.getDay(); // 0 is sunday
    //const dayIndex = 0;
    const gridSize = [9,3,4,5,6,7,8][dayIndex];
    const alphabet = _.slice('ABCDEFGHI'.split(''), 0, gridSize);

    const getColumn = (grid, n) => grid.map(row => _.nth(row, n));
    const getRow = (grid, n) => _.nth(grid, n);
    
    const paren = (s) => `(${s})`;
    const rch = (n) => _.sampleSize(alphabet, n).join('');
    const reducers = [
        [/\((..?)\)\((..?)\)/, (m, p1, p2) => `(${p1 + p2})`],
        [/\((..?)\)\((..?)\)/, (m, p1, p2) => `[${_.sortedUniq([p1,p2].join('').split('').sort()).join('')}]${Math.random() > 0.5 ? '*' : '+'}`],
    ];
    const herrings = [
        [/\(([^|]+?)\)/, (m, p1) => {
            const a = `|${rch(p1.length)}`;
            const b = Math.random() > 0.8 ? `${a}|${rch(p1.length)}` : `${a}`;
            return `(${p1}${b})`;
        }],
        [/\[([^-\]]{3,}?)\]/, (m, p1) => {
            const inside = _.sortedUniq(p1.split('').sort()).join('');
            return `[${_.first(inside)}-${_.last(inside)}]`;
        }]
    ];
    const cleanup = [
        [/\((.+)(:?\|\1)+\)/, (m, p1) => `${p1}`],
        [/\((.)\)/g, (m, p1) => `${p1}`],
        [/\[(.)\]/g, (m, p1) => `${p1}`],
    ];
    const smallify = (str) => {
        for(let i=0; i<3; i++) {
            const order = _.shuffle(reducers);
            _.each(order, (things) => {
                str = str.replace(things[0], things[1]);
            });
        }
        for(let i=0; i<3; i++) {
            const order = _.shuffle(herrings);
            _.each(order, (things) => {
                str = str.replace(things[0], things[1]);
            });
        }
        _.each(cleanup, (things) => {
            str = str.replace(things[0], things[1]);
        });
        return str;
    }

    const grid = _.range(gridSize)
        .map(y => _.range(gridSize)
            .map(x => _.sample(alphabet)));

    const columnClues = _.range(gridSize)
        .map(x => getColumn(grid, x))
        .map(col => smallify(col.map(paren).join('')));
    const rowClues = _.range(gridSize)
        .map(x => getRow(grid, x))
        .map(row => smallify(row.map(paren).join('')));
        
    return {
        grid: grid,
        column: columnClues,
        row: rowClues,
        width: gridSize,
        height: gridSize
    }
}

// draw image, return canvas
const drawGrid = (gridData, isSolution) => {
    const gridSquareSize = 32;
    const fontOffsetX = 16;
    const fontOffsetY = 24;
    const margin = 256.5;//200.5;
    const canvas = new Canvas(768, 768);
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.fillRect(0, 0, 768, 768);
    
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 1;
    ctx.lineJoin = 'round';
    
    ctx.strokeStyle = 'rgb(100, 100, 100)';
    ctx.fillStyle = 'rgb(0, 0, 0)';
    for(let x=0; x<gridData.width; x++) {
        for(let y=0; y<gridData.height; y++) {
            ctx.strokeRect(margin+x*gridSquareSize, margin+y*gridSquareSize, gridSquareSize, gridSquareSize);
            if(isSolution) {
                ctx.fillText(gridData.grid[y][x], margin+x*gridSquareSize + fontOffsetX, margin+y*gridSquareSize + fontOffsetY);
            }
        }
    }
    
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'right';
    
    const textAngle = 45 * Math.PI/180;
    
    _.each(gridData.row, (rowClue, i) => {
        ctx.save();
        ctx.translate(margin-fontOffsetX, margin+i*gridSquareSize+fontOffsetY);
        ctx.rotate(textAngle);
        ctx.fillText(rowClue, 0, 0);
        ctx.restore();
    });
    
    _.each(gridData.column, (colClue, i) => {
        ctx.save();
        ctx.translate(margin+i*gridSquareSize+fontOffsetX, margin-fontOffsetX);
        ctx.rotate(textAngle);
        ctx.fillText(colClue, 0, 0);
        ctx.restore();
    });
    
    return canvas;
}

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const yesterdaysPuzzle = buildGrid(yesterday);
const todaysPuzzle = buildGrid(today);

const solutionCanvas = drawGrid(yesterdaysPuzzle, true);
const newCanvas = drawGrid(todaysPuzzle);

//const out = fs.createWriteStream('./out.png');
//newCanvas.pngStream().pipe(out);

// post tweet
const Twitter = require('twitter');
const client = new Twitter(JSON.parse(fs.readFileSync('./creds.json')));

const days = [
    "Sunday's",
    "Monday's",
    "Tuesday's",
    "Wednesday's",
    "Thursday's",
    "Friday's",
    "Saturday's"
];

// post solution to old puzzle
client.post('media/upload', {media: solutionCanvas.toBuffer()}, (error, media, res) => {
    if(error) throw error;
    
    let status = {
        status: "The solution to " + days[yesterday.getDay()] + " puzzle!",
        media_ids: media.media_id_string
    };

    client.post('statuses/update', status, (err, tweet) => {
        if(err) throw err;
        console.log('yesterday tweet success');
    });
});

setTimeout(() => {
    // post new puzzle
    client.post('media/upload', {media: newCanvas.toBuffer()}, (error, media, res) => {
        if(error) throw error;
        let status = {
            status: "Here's " + days[today.getDay()] + " puzzle!",
            media_ids: media.media_id_string
        };
    
        client.post('statuses/update', status, (err, tweet) => {
            if(err) throw err;
            console.log('today tweet success');
        });
    });
}, 5000);