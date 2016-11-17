let fs = require('fs');

let progress = JSON.parse(fs.readFileSync('./progress.json', 'utf8'));

let connections = require('./connections.js');
let movements = [0,
    [ 0,-1],
    [ 1, 0],
    [ 0, 1],
    [-1, 0]
];
let xAxis = 'ABCDEFGHIJKLMNOP'.split('');

let pickRandom = (arr) => {
    return arr[Math.floor(Math.random()*arr.length)];
}

let oldPos = xAxis[progress.x] + progress.y;
let move = movements[pickRandom(connections[oldPos])];
let newPosition = {x: progress.x+move[0], y: progress.y+move[1]};

let newPic = './overworld/' + newPosition.y + xAxis[newPosition.x] + '.gif';

console.log(newPic);

let image = fs.readFileSync(newPic);

const Twitter = require('twitter');
const client = new Twitter(JSON.parse(fs.readFileSync('./creds.json')));
client.post('media/upload', {media: image}, (err, media, res) => {
    if(err) throw err;
    let status = {
        status: '',
        media_ids: media.media_id_string
    };

    client.post('statuses/update', status, (err, tweet) => {
        if(err) throw err;
        console.log('tweet success');
        fs.writeFileSync('./progress.json', JSON.stringify(newPosition));
    });
});