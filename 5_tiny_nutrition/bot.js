let pc = require('punycode');
let fs = require('fs');
let Twitter = require('twitter');
let client = new Twitter(JSON.parse(fs.readFileSync('creds.json')));

// all units in g
let foodData = JSON.parse(fs.readFileSync('./data.json'));

let pickSome = (arr, n) => {
    let out = [];
    let copy = arr.slice();
    for(let i=0; i<n; i++) {
        let grab = copy.splice(Math.floor(Math.random()*copy.length), 1);
        out = out.concat(grab);
    }
    return out;
};

let twitterLen = (str) => {
    return pc.ucs2.decode(str.normalize('NFC')).length;
};

let combLen = function combLen(arr) {
    if(!Array.isArray(arr)) {
        return twitterLen(arr);
    }
    return arr.reduce((p, c) => {
        return p + (Array.isArray(c) ? combLen(c) : twitterLen(c));
    }, 0);
};

let flatten = (arr) => arr.reduce((p, c) => {
    return p.concat(Array.isArray(c) ? flatten(c) : c)
}, []);

let generateNutritionFacts = (emojis, totals) => {
    let required = [
        `𝖲𝖾𝗋𝗏𝗂𝗇𝗀 𝖲𝗂𝗓𝖾 ${emojis}`,
        `𝗖𝗮𝗹𝗼𝗿𝗶𝗲𝘀 ${totals['Calories']}`
    ];
    // things in arrays are optional (nested means more optional)
    let lines = [
        [`𝗧𝗼𝘁𝗮𝗹 𝗙𝗮𝘁 ${totals['Total Fat']}`,
        `    𝖲𝖺𝗍𝗎𝗋𝖺𝗍𝖾𝖽 𝖥𝖺𝗍 ${totals['Saturated Fat']}`,
        `    𝘛𝘳𝘢𝘯𝘴 𝖥𝖺𝗍 ${totals['Trans Fat']}`],
        `𝗖𝗵𝗼𝗹𝗲𝘀𝘁𝗲𝗿𝗼𝗹 ${totals['Cholesterol']}`,
        `𝗦𝗼𝗱𝗶𝘂𝗺 ${totals['Sodium']}`,
        [`𝗧𝗼𝘁𝗮𝗹 𝗖𝗮𝗿𝗯𝗼𝗵𝘆𝗱𝗿𝗮𝘁𝗲 ${totals['Total Carbohydrate']}`,
        `    𝖣𝗂𝖾𝗍𝖺𝗋𝗒 𝖥𝗂𝖻𝖾𝗋 ${totals['Dietary Fiber']}`,
        `    𝖲𝗎𝗀𝖺𝗋𝗌 ${totals['Sugars']}`],
        `𝗣𝗿𝗼𝘁𝗲𝗶𝗻 ${totals['Protein']}`,
        `𝗩𝗶𝘁𝗮𝗺𝗶𝗻 𝗔 ${totals['Vitamin A']}`,
        `𝗩𝗶𝘁𝗮𝗺𝗶𝗻 𝗖 ${totals['Vitamin C']}`,
        `𝗖𝗮𝗹𝗰𝗶𝘂𝗺 ${totals['Calcium']}`,
        `𝗜𝗿𝗼𝗻 ${totals['Iron']}`
    ];

    let remaining = 140 - combLen(required);
    let current = combLen(lines);
    // remove lines until we reach the char limit
    while(current > (remaining-flatten(lines).length)) {
        let index = Math.floor(Math.random()*lines.length);
        let incoming = lines[index];
        if(Array.isArray(incoming) && Math.random() > 0.666) {
            index = Math.floor(Math.random()*(incoming.length-1)+1);
            if(index < incoming.length) {
                let incLen = combLen(incoming[index]);
                current -= incLen;
                incoming.splice(index, 1);
            }
        } else {
            let incLen = combLen(incoming);
            current -= incLen;
            lines.splice(index, 1);
        }
    }
    return required.concat(flatten(lines)).join('\n');
}

let emptyTotal = {
    'Calories': 0,
    'Total Fat': 0,
        'Saturated Fat': 0,
        'Trans Fat': 0,
    'Cholesterol': 0,
    'Sodium': 0,
    'Total Carbohydrate': 0,
        'Dietary Fiber':0,
        'Sugars': 0,
    'Protein': 0,
    'Vitamin A': 0,
    'Vitamin C': 0,
    'Calcium': 0,
    'Iron': 0
};

function UnitValue(val, unit) {
    this.value = val || 0;
    this.unit = unit || 'g';
}
UnitValue.prototype.toString = function() {
    // ~~~ floating point ~~~~~
    return `${Math.round(this.value*100)/100} ${this.unit}`
}

let units = ['g', 'mg', '\u00b5g'];

let getTotals = (foodFacts) => {
    let totaled = foodFacts.reduce((p, c) => {
        for(let prop in p) {
            p[prop] += c[prop] ? c[prop] : 0;
        }
        return p;
    }, emptyTotal);
    for(let prop in totaled) {
        let val = totaled[prop];
        let unitIdx = 0;
        let unit = prop === 'Calories' ? ' ' : units[unitIdx];
        while(val < 0.01 && val > 0.00000001) {
            val *= 1000;
            unitIdx += 1;
            unit = units[unitIdx];
        }
        totaled[prop] = new UnitValue(val, unit);
    }
    return totaled;
};

let tweet = () => {
    let emojis = pickSome(Object.keys(foodData), Math.floor(Math.random()*5+1));
    let totals = getTotals(emojis.map(emoji => foodData[emoji].facts));
    let templated = generateNutritionFacts(emojis, totals);
    fs.writeFileSync('./out', templated);
    client.post('statuses/update', {
        status: templated
    }, (err) => {
        if(err) {
            console.log(err);
            throw err;
        }
        console.log('tweet success');
    });
};

tweet();
