let nutritionFacts = {
    'Serving Size': true,
    // thick break
    'Calories': true,
    // small break
    'Total Fat': true,
        'Saturated Fat': true,
        'Trans Fat': true,
    'Cholesterol': true,
    'Sodium': true,
    'Total Carbohydrate': true,
        'Dietary Fiber': true,
        'Sugars': true,
    'Protein': true,
    // thick break
    'Vitamin C': true,
    'Calcium': true,
    'Iron': true
};

// all units in g
let foodData = {
    '🍏': {
        name: 'Red Apple',
        facts: {
            'Calories': 52,
            'Total Fat': 0.17,
                'Saturated Fat': 0.028,
                'Trans Fat': 0,
            'Cholesterol': 0,
            'Sodium': 0.001,
            'Total Carbohydrate': 13.81,
                'Dietary Fiber': 2.4,
                'Sugars': 10.39,
            'Protein': 0.26,
            'Vitamin C': 0.0046,
            'Calcium': 0.006,
            'Iron': 0.00012
        }
    },
    '🍎': {
        name: 'Green Apple',
        facts: {
            'Calories': 52,
            'Total Fat': 0.17,
                'Saturated Fat': 0.028,
                'Trans Fat': 0,
            'Cholesterol': 0,
            'Sodium': 0.001,
            'Total Carbohydrate': 13.81,
                'Dietary Fiber': 2.4,
                'Sugars': 10.39,
            'Protein': 0.26,
            'Vitamin C': 0.0046,
            'Calcium': 0.006,
            'Iron': 0.00012
        }
    },
    '🍐': {
        name: 'Pear',
        facts: {
            'Calories': 57,
            'Total Fat': 0.14,
                'Saturated Fat': 0.022,
                'Trans Fat': 0,
            'Cholesterol': 0,
            'Sodium': 0.001,
            'Total Carbohydrate': 15.23,
                'Dietary Fiber': 3.1,
                'Sugars': 9.75,
            'Protein': 0.36,
            'Vitamin C': 0.0043,
            'Calcium': 0.009,
            'Iron': 0.00018
        }
    },
    '🍊': {
        name: 'Orange',
        facts: {
            'Calories': 46,
            'Total Fat': 0.21,
                'Saturated Fat': 0.025,
                'Trans Fat': 0,
            'Cholesterol': 0,
            'Sodium': 0,
            'Total Carbohydrate': 11.54,
                'Dietary Fiber': 2.4,
                'Sugars': 9.14,
            'Protein': 0.70,
            'Vitamin C': 0.045,
            'Calcium': 0.043,
            'Iron': 0.00009
        }
    },
    '🍋': {
        name: 'Lemon',
        facts: {
            'Calories': 29,
            'Total Fat': 0.30,
                'Saturated Fat': 0.039,
                'Trans Fat': 0,
            'Cholesterol': 0,
            'Sodium': 0.002,
            'Total Carbohydrate': 9.32,
                'Dietary Fiber': 2.8,
                'Sugars': 2.5,
            'Protein': 1.10,
            'Vitamin C': 0.053,
            'Calcium': 0.026,
            'Iron': 0.0006
        }
    },
    '🍌':{},
    '🍉':{},
    '🍇':{},
    '🍓':{},
    '🍈':{},
    '🍒':{},
    '🍑':{},
    '🍍':{},
    '🍅':{},
    '🍆':{},
    '🌶':{},
    '🌽':{},
    '🍠':{},
    '🍯':{},
    '🍞':{},
    '🧀':{},
    '🍗':{},
    '🍖':{},
    '🍤':{},
    '🍳':{},
    '🍔':{},
    '🍟':{},
    '🌭':{},
    '🍕':{},
    '🍝':{},
    '🌮':{},
    '🌯':{},
    '🍜':{},
    '🍲':{},
    '🍥':{},
    '🍣':{},
    '🍱':{},
    '🍛':{},
    '🍙':{},
    '🍚':{},
    '🍘':{},
    '🍢':{},
    '🍡':{},
    '🍧':{},
    '🍨':{},
    '🍦':{},
    '🍰':{},
    '🎂':{},
    '🍮':{},
    '🍬':{},
    '🍭':{},
    '🍫':{},
    '🍿':{},
    '🍩':{},
    '🍪':{},
    '🍺':{},
    '🍻':{},
    '🍷':{},
    '🍸':{},
    '🍹':{},
    '🍾':{},
    '🍶':{},
    '🍵':{},
    '☕️':{},
    '🍼':{},
    '🍴':{},
    '🍽':{}
};

let fs = require('fs');
let Twitter = require('twitter');
let client = new Twitter(JSON.parse(fs.readFileSync('creds.json')));


let pickSome = (arr, n) => {
    let out = [];
    let copy = arr.slice();
    for(let i=0; i<n; i++) {
        let grab = copy.splice(Math.floor(Math.random()*copy.length), 1);
        out = out.concat(grab);
    }
    return out;
};

let generateNutritionFacts = (emojis, totals) => {
    return `
𝖲𝖾𝗋𝗏𝗂𝗇𝗀 𝖲𝗂𝗓𝖾 ${emojis}
𝗖𝗮𝗹𝗼𝗿𝗶𝗲𝘀 ${totals['Calories']}
𝗧𝗼𝘁𝗮𝗹 𝗙𝗮𝘁 ${totals['Total Fat']}
    𝖲𝖺𝗍𝗎𝗋𝖺𝗍𝖾𝖽 𝖥𝖺𝗍 ${totals['Saturated Fat']}
    𝘛𝘳𝘢𝘯𝘴 𝖥𝖺𝗍 ${totals['Trans Fat']}
𝗖𝗵𝗼𝗹𝗲𝘀𝘁𝗲𝗿𝗼𝗹 ${totals['Cholesterol']}
𝗦𝗼𝗱𝗶𝘂𝗺 ${totals['Sodium']}
    `
}
let generateNutritionFacts2 = (emojis, totals) => {
    let lines = [
`𝖲𝖾𝗋𝗏𝗂𝗇𝗀 𝖲𝗂𝗓𝖾 ${emojis}`,
`𝗖𝗮𝗹𝗼𝗿𝗶𝗲𝘀 ${totals['Calories']}`
`𝗧𝗼𝘁𝗮𝗹 𝗙𝗮𝘁 ${totals['Total Fat']}`,
`    𝖲𝖺𝗍𝗎𝗋𝖺𝗍𝖾𝖽 𝖥𝖺𝗍 ${totals['Saturated Fat']}`,
`    𝘛𝘳𝘢𝘯𝘴 𝖥𝖺𝗍 ${totals['Trans Fat']}`,
`𝗖𝗵𝗼𝗹𝗲𝘀𝘁𝗲𝗿𝗼𝗹 ${totals['Cholesterol']}`,
`𝗦𝗼𝗱𝗶𝘂𝗺 ${totals['Sodium']}`,
`𝗧𝗼𝘁𝗮𝗹 𝗖𝗮𝗿𝗯𝗼𝗵𝘆𝗱𝗿𝗮𝘁𝗲 ${totals['Total Carbohydrate']}`,
`    𝖣𝗂𝖾𝗍𝖺𝗋𝗒 𝖥𝗂𝖻𝖾𝗋 ${totals['Dietary Fiber']}`,
`    𝖲𝗎𝗀𝖺𝗋𝗌 ${totals['Sugars']}`,
`𝗣𝗿𝗼𝘁𝗲𝗶𝗻 ${totals['Protein']}`
];
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
    'Vitamin C': 0,
    'Calcium': 0,
    'Iron': 0
};

let getTotals = (foodFacts) => {
    return foodFacts.reduce((p, c) => {
        for(let prop in p) {
            p[prop] += c[prop];
        }
        return p;
    }, emptyTotal);
};

let tweet = () => {
    //let emojis = pickSome(Object.keys(foodData), Math.floor(Math.random()*5+2));
    let emojis = ['🍏', '🍐'];
    let totals = getTotals(emojis.map(emoji => foodData[emoji].facts));
    let templated = generateNutritionFacts(emojis, totals);
    console.log(templated.length);
    fs.writeFileSync('./out', templated);
    return;
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
