let fs = require('fs');
let readline = require('readline');
let fetch = require('node-fetch');
let usdaApiKey = 'AWaMiTyrUNNTWE3PZtmZnRDxwf0GO55mBrujTwSq';
/*
{
    name: 'Red Apple',
    servingSize: 182,
    facts: {
        'Calories': 95,
        'Total Fat': 0.31,
            'Saturated Fat': 0.051,
            'Trans Fat': 0,
        'Cholesterol': 0,
        'Sodium': 0.002,
        'Total Carbohydrate': 25.13,
            'Dietary Fiber': 4.4,
            'Sugars': 18.91,
        'Protein': 0.47,
        'Vitamin A': 5e-6,
        'Vitamin C': 0.0084,
        'Calcium': 0.006,
        'Iron': 0.00012
    }
}
*/
let foodData = {
    '🍏':'09003',
    '🍎':'09003',
    '🍐':'09252',
    '🍊':'09203',
    '🍋':'09150',
    '🍌':'09040',
    '🍉':'09326',
    '🍇':'09132',
    '🍓':'09316',
    '🍈':'09184',
    '🍒':'09070',
    '🍑':'09236',
    '🍍':'09266',
    '🍅':'11529',
    '🍆':'11210',
    '🌶':'11821',
    '🌽':'11168',
    '🍠':'11508',
    '🍯':'19296',
    '🍞':'18069',
    '🧀':'01009', // cheese
    '🍗':'05194',
    '🍖':'13236',
    '🍤':'15150',
    '🍳':'01128',
    '🍔':'21233',
    '🍟':'36014',
    '🌭':'07945',
    '🍕':'22903',
    '🍝':'36038',
    '🌮':'21082',
    '🌯':'21064',
    '🍜':'06583',
    '🍲':'22905',
    '🍥':'45096746',
    '🍣':'15078',
    '🍱':'45047203',
    '🍛':'45066589',
    '🍙':'20051',
    '🍚':'20051',
    '🍘':'19051',
    '🍢':'21005',
    '🍡':'45084428',
    '🍧':'19281',
    '🍨':'19095',
    '🍦':'19088',
    '🍰':'18126',
    '🎂':'18096',
    '🍮':'19094',
    '🍬':'19107',
    '🍭':'19107',
    '🍫':'45130137',
    '🍿':'19807',
    '🍩':'18249',
    '🍪':'18160',
    '🍺':'14006',
    '🍻':'14006',
    '🍷':'14096',
    '🍸':'14049',
    '🍹':'14050',
    '🍾':'14536',
    '🍶':'43479',
    '🍵':'14278',
    '☕️':'14180',
    '🍼':'01152'
};

let outputFoods = {};

let dataToFactMap = {
    '208': 'Calories',
    '204': 'Total Fat',
        '606': 'Saturated Fat',
        '605': 'Trans Fat',
    '601': 'Cholesterol',
    '307': 'Sodium',
    '205': 'Total Carbohydrate',
        '291': 'Dietary Fiber',
        '269': 'Sugars',
    '203': 'Protein',
    '320': 'Vitamin A',
    '401': 'Vitamin C',
    '301': 'Calcium',
    '303': 'Iron'
};

let unitMultiplier = {
    'g': 1,
    'mg': 0.001,
    '\u00b5g': 0.00001,
    'kcal': 1
};

let getApiCall = (foodId) => {
    return `http://api.nal.usda.gov/ndb/reports/?ndbno=${foodId}&type=b&format=json&api_key=${usdaApiKey}`
}

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let userChoice = (name, arr) => {
    console.log('');
    console.log(name);
    arr.forEach((x, i) => {
        console.log(i, x.name, x.value);
    });
    return new Promise((resolve, reject) => rl.question('choice: ', resolve));
}

let getImportantData = (data, measure) => {
    return data.reduce((p, c) => {
        let factProp = dataToFactMap[c.nutrient_id];
        if(factProp) {
            let unit = c.unit;
            let multiplier = unitMultiplier[unit];
            p[factProp] = parseFloat(c.measures[measure].value) * multiplier;
        }
        return p;
    }, {});
}

let getFoodData = (emoji) => {
    let foodId = foodData[emoji];
    return fetch(getApiCall(foodId)).then((res) => {
            return res.json();
        }).then((json) => {
            let name = json.report.food.name;
            let measures = json.report.food.nutrients[0].measures;
            return userChoice(name, measures.map(x => {return {name: x.label, value: x.eqv}}))
                .then((measureIndex) => {
                    let data = getImportantData(json.report.food.nutrients, parseInt(measureIndex));
                    outputFoods[emoji] = {
                        name: name,
                        facts: data
                    };
                });
        }).catch(err => {
            console.log('ERROR', err);
        });
}

let getAllFoodData = () => {
    Object.keys(foodData).reduce((p, emoji) => {
        return p.then(() => getFoodData(emoji));
    }, Promise.resolve()).then(() => {
        // done
        fs.writeFileSync('./data', JSON.stringify(outputFoods, undefined, 4));
        rl.close();
    }).catch(err => {
        console.log('werordsd', err);
    });
}

getAllFoodData();
