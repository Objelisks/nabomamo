// generate large shape
// generate small shape
// animate between the two using specific animation curve
// insert into gif encoder
// generate some call to action text
// upload to twit

// http://i.imgur.com/Huou7Gh.gif

let frameCount = 300;
let width = 256, height = 256;

let fs = require('fs');

let Canvas = require('canvas');
let canvas = new Canvas(width, height);
let ctx = canvas.getContext('2d');

let GIFEncoder = require('gifencoder');
let encoder = new GIFEncoder(width, height);

//encoder.createReadStream().pipe(fs.createWriteStream('out.gif'));

encoder.start();
encoder.setRepeat(0);
encoder.setDelay(1000/30);
encoder.setQuality(10);

let types = [
    'circle',
    'circles',
    'rotatysquare',
    'fancysquares'
];

let fgColors = [
    '#34529D'
];
let bgColors = [
    '#24266B'
];

let pickRandom = (arr) => {
    return arr[Math.floor(Math.random()*arr.length)];
}

let easeInOutSine = (t, low, high, time) => {
	return -high/2 * (Math.cos(Math.PI*t/time) - 1) + low;
}


let fg = `hsl(${Math.random()*360}, 50%, 55%)`;
let bg = `hsl(${Math.random()*360}, 50%, 33%)`;
let type = pickRandom(types);
/*
let generateShape = () => {
    let shapes = [];
    for(let i=0; i<16; i++) {
        shapes.push([Math.random()*width, Math.random()*height,
                     Math.random()*width, Math.random()*height]);
    }
    return shapes;
}

let scale = (x, y, t) => {
    let d = Math.sqrt(Math.pow(x-width/2, 2) + Math.pow(y-height/2, 2)) / (width/2);
    return [(x-width/2)*(t-d)+width/2, (y-height/2)*(t-d)+height/2];
}

let shape = generateShape();

} else if(type === 'shape') {
        ctx.moveTo(...scale(shape[0][0], shape[0][1], curve));
        
        for(let j=1; j<shape.length; j++) {
            let preSection = shape[j-1];
            let section = shape[j];
            
            let ctrl = [preSection[2] - 2*(preSection[2]-preSection[0]), preSection[3] - 2*(preSection[3]-preSection[1])]
            ctx.bezierCurveTo(...scale(...ctrl, curve),
                              ...scale(section[0], section[1], curve),
                              ...scale(section[2], section[3], curve));
        }
        
        ctx.closePath();
    }*/

for(let i=0; i<frameCount; i++) {
    let curve = 
        easeInOutSine(Math.min(i, 2*frameCount/5), 0, 1.0, 2*frameCount/5)
        - easeInOutSine(Math.max(0, i-2*frameCount/5), 0, 1.0, 3*frameCount/5);
    let contcurve = 
        easeInOutSine(Math.min(i, 2*frameCount/5), 0, 1.0, 2*frameCount/5)
        + easeInOutSine(Math.max(0, i-2*frameCount/5), 0, 1.0, 3*frameCount/5);
    
    
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
    
    ctx.fillStyle = fg;
    
    ctx.beginPath();
    
    if(type === 'circle') {
        ctx.arc(width/2, height/2, curve*height/2, 0, 360);
    } else if(type === 'circles') {
        ctx.arc(width/2, height/2, curve*height/4, 0, 360);
        ctx.moveTo(width/4, height/4);
        ctx.arc(width/4, height/4, curve*height/4, 0, 360);
        ctx.moveTo(width*3/4, height/4);
        ctx.arc(width*3/4, height/4, curve*height/4, 0, 360);
        ctx.moveTo(width/4, height*3/4);
        ctx.arc(width/4, height*3/4, curve*height/4, 0, 360);
        ctx.moveTo(width*3/4, height*3/4);
        ctx.arc(width*3/4, height*3/4, curve*height/4, 0, 360);
    } else if(type === 'rotatysquare') {
        ctx.save();
        ctx.translate(width/2, height/2);
        ctx.rotate(contcurve * Math.PI/2);
        ctx.fillRect(-width/2*curve, -height/2*curve, width*curve, height*curve);
        ctx.restore();
    } else if(type === 'fancysquares') {
        for(let i=0; i<16; i++) {
            ctx.save();
            ctx.translate(width/2+Math.cos((i+contcurve*16)*Math.PI/8)*width/4, height/2+Math.sin((i+contcurve*16)*Math.PI/8)*height/4);
            ctx.rotate(contcurve * Math.PI);
            ctx.fillRect(-(width/2*curve)*0.25, -(height/2*curve)*0.25, 0.25*width*curve, 0.25*height*curve);
            ctx.restore();
        }
    }
    
    ctx.fill();
    encoder.addFrame(ctx);
}

encoder.finish();

let texts = [
    'breathe',
    'breathe',
    'breathe',
    'take a breath',
    'take a breath',
    'breathe deeply',
    'breathe deeply',
    'sync your breathing with everyone else here in this moment',
    'take a moment to reflect',
    'allow yourself to become calm',
    'become aware of your surroundings',
    'take a moment to think of just flexibility, love, and trust',
    'take a moment to find yourself',
    'its okay',
    `i'm here`
];

let statusText = pickRandom(texts);

let Twitter = require('twitter');
let client = new Twitter(JSON.parse(fs.readFileSync('./creds.json')));


const mediaType   = 'image/gif';

let initUpload = (buf) => {
    console.log(buf.length);
    return makePost('media/upload', {
        command    : 'INIT',
        total_bytes: buf.length,
        media_type : mediaType,
    }).then(data => data.media_id_string);
}

let appendUpload = (buf) => (mediaId) => {
    console.log('append', mediaId, buf);
    return makePost('media/upload', {
        command      : 'APPEND',
        media_id     : mediaId,
        media        : buf,
        segment_index: 0
    }).then(data => mediaId);
}

let finalizeUpload = (mediaId) => {
    console.log('finalize', mediaId);
    return makePost('media/upload', {
        command : 'FINALIZE',
        media_id: mediaId
    }).then(data => mediaId);
}

let makePost = (endpoint, params) => {
    return new Promise((resolve, reject) => {
        client.post(endpoint, params, (error, data, response) => {
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        });
    });
}

let uploadData = (buf) => {
    return initUpload(buf) // Declare that you wish to upload some media
      .then(appendUpload(buf)) // Send the data for the media
      .then(finalizeUpload); // Declare that you are done uploading chunks
}

uploadData(encoder.out.getData())
.then((media_id) => {
    client.post('statuses/update', {
        status: statusText,
        media_ids: media_id
    }, (err, tweet) => {
        console.log(err, tweet);
    });
})