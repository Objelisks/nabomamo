// https://twitter.com/Khoklavixche/status/783650271939350529

let fs = require('fs');
let fetch = require('node-fetch');
let Canvas = require('canvas');
let GIFEncoder = require('gifencoder');
let Twitter = require('twitter');
let client = new Twitter(JSON.parse(fs.readFileSync('creds.json')));


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

let generateGifBuffer = (buffer) => {
    let image = new Canvas.Image;
    image.src = buffer;
    let canvas = new Canvas(512, 512);
    let ctx = canvas.getContext('2d');
    let encoder = new GIFEncoder(512, 512);
    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(10);
    encoder.setQuality(100);
    for(let i=0; i<image.height; i+=200) {
        ctx.drawImage(image, 0, i, 200, 200, 0, 0, 512, 512);
        encoder.addFrame(ctx);
    }
    encoder.finish();
    return encoder.out.getData();
}

let pickRandom = (arr) => {
    if(!arr) {
        return null;
    }
    if(Array.isArray(arr)) {
        return arr[Math.floor(Math.random()*arr.length)]
    } else {
        // assume an object
        return arr[pickRandom(Object.keys(arr))];
    }
}

let weaponTypes = [
    'greatsword',
    'longsword',
    'swordshield',
    'dualblades',
    'hammer',
    'huntinghorn',
    'lance',
    'gunlance',
    'switchaxe',
    'insectglaive',
    'chargeblade',
    'lightbowgun',
    'heavybowgun',
    'bow'
];

let getImageUrl = (modelId) => {
    return `http://mhgen.kiranico.com/storage/assets/game/image/${modelId}_rotate.png`;
}

let getAppearanceText = (monster, weapon, element) => {
    let monsters = [
        `In case of ${monster}, try: ${weapon}.`,
        `Experienced hunters use a ${weapon} to take down the ${monster}.`,
        `Try using a ${weapon} if you're having trouble with the ${monster}.`,
        `I crafted a ${weapon} and took down the ${monster} in no time.`,
        `The ${monster} fears anyone wielding a ${weapon}.`,
        `Did you see that hunter take down the ${monster} with a ${weapon}?`
    ];
    if(element) {
        monsters = monsters.concat([
            `${monster} is known to be weak to ${element}, so use a ${weapon}.`,
            `Wield ${element}! Use the ${weapon}!`,
            `${element} is strong against ${monster}.`,
            `Don't give up against the ${monster}! Go craft a ${weapon}, it has ${element} properties.`,
            `The ${monster} can be defeated easily using a ${element}-powered ${weapon}.`
        ]);
    }
    return pickRandom(monsters);
}

let dataToWeakness = {
    1: 'Fire',
    2: 'Water',
    3: 'Thunder',
    4: 'Dragon',
    5: 'Ice',
    6: 'Poison',
    //7: 'Paralyze',
    //8: 'Sleep',
    9: 'Blast'
}

let weaknesses = {
    'Fire': ['Chameleos', 'Congalala', 'Gore Magala', 'Great Jaggi', 'Gypceros', 'Kecha Wacha', 'Khezu', 'Lagombi', 'Nerscylla', 'Seltas Queen', 'Ukanlos'],
    'Water': ['Basarios', 'Brachydios', 'Gravios', 'Iodrome', 'Kirin', 'Teostra', 'Tetsucabra', 'Yian Garuga'],
    'Thunder': ["Dah'ren Mohran", 'Daimyo Hermitaur', 'Deviljho', 'Monoblos', 'Seltas', 'Seregios', 'Tigrex', 'Zamtrios'],
    'Dragon': ['Akantor', 'Dalamadur', 'Fatalis', 'Gogmazios', 'Kushala Daora', 'Rathalos', 'Rathian', 'Shagaru Magala'],
    'Ice': ['Cephadrome', 'Diablos', 'Gendrome', 'Najarala', 'Rajang', 'Velocidrome', 'Yian Kut-Ku', 'Zinogre'],
    'Poison': ['Kushala Daora', 'Daimyo Hermitaur', 'Teostra', 'Velocidrome', 'Tetsucabra', 'Seltas', 'Rajang', 'Monoblos', 'Lagombi', 'Khezu', 'Kecha Wacha', 'Great Jaggi', 'Gravios', 'Gendrome'],
    'Blast': ['Dahren Mohran', 'Deviljho', 'Kushala Daora', 'Diablos', 'Nerscylla', 'Seltas Queen', 'Monoblos', 'Akantor', 'Ukanlos', 'Dalamadur']
}

let getMonsterWeakTo = (element) => {
    let monster = undefined;
    if(element) {
        monster = pickRandom(weaknesses[element]);
    }
    if(monster === undefined) {
        monster = pickRandom(pickRandom(weaknesses));
    }
    return monster;
}

let tweet = () => {
    let weaponType = pickRandom(weaponTypes);
    let weaponData = pickRandom(JSON.parse(fs.readFileSync(`./weapons/${weaponType}.json`)));
    if(weaponData.element) {
        weaponData.element = dataToWeakness[weaponData.element.id];
    }
    let monster = getMonsterWeakTo(weaponData.element);
    let text = getAppearanceText(monster, weaponData.name, weaponData.element);

    fetch(getImageUrl(weaponData.image)).then((img) => {
        return img.buffer();
    }).then((buffer) => {
        return generateGifBuffer(buffer);
    }).then((gif) => {
        console.log('gif buffer');
        fs.writeFileSync('out.gif', gif);
        uploadData(gif).then(mediaId => {
            console.log('image uploaded');
            client.post('statuses/update', {
                status: text,
                media_ids: mediaId
            }, (err, tweet) => {
                if(!err) {
                    console.log('tweet success', text);
                } else {
                    console.log('error', err);
                }
            });
        });
    });
}

tweet();
