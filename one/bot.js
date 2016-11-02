// state graph for each emoji?
// function that handles each emoji separately

// emoji regex (\ud83c[\udf00-\udfff])|(\ud83d[\udc00-\ude4f])|(\ud83d[\ude80-\udeff])

/* operations
map
reduce
filter
every

rando emoji => filter => eat, play

*/
let fs = require('fs');
let Twitter = require('twitter');
let client = new Twitter(JSON.parse(fs.readFileSync('creds.json')));

let numoji = '\u20E3';
let randoSet = ['🏍','🎱','🍩','💦','🍆','🎓','👽','✨','🍸','🎲','🚀','💾','🗿','⚔','🃏'];

let parseEmoji = (e) => {
    return parseInt(e);
}

let reducers = {
    'eat': (pre, arr) => {
        return '💩';
    },
    'play': (pre, cur) => {
        return '🎶';
    },
    'sum': (pre, cur) => {
        let p = parseEmoji(pre) || 1;
        let i = parseEmoji(cur) || 1;
        return (''+(p + i)).split('').join(numoji) + numoji;
    } // sum clocks, hamburger, beers,
};

let opNames = {
    'map': {
        'cook': {
            '🐓': '🍗', '🌽': '🍿', '🐮': '🍔','💀':'💀',
            '🎷':'🔥','🎸':'🔥','🎹':'🔥','🎺':'🔥','🎻':'🔥','🎙':'🔥',
            '🌕':'🌞','🌗':'🌞','🌑':'🌞','🌓':'🌞',
            '👴':'💀','👵':'💀','🌿':'🔥','🌴':'🔥'
        },
        'wait': {
            '🐓':'💀','🌽':'🌽','🐮':'💀','💀':'💀',
            '👦':'👴','👧':'👵','🐣':'🐓','🌱':'🌿','🌿':'🌴',
            '🎷':'🎷','🎸':'🎸','🎹':'🎹','🎺':'🎺','🎻':'🎻','🎙':'🎙',
            '🌕':'🌗','🌗':'🌑','🌑':'🌓','🌓':'🌕'
        },
        'flip': {
            '✊':'🖕','👍':'👎', '👆':'👇', '🙂':'🙃', '⏳':'⌛️',
            '🕐':'🕠','🕑':'🕟','🕒':'🕞','🕓':'🕝','🕔':'🕜','🕕':'🕧','🕖':'🕦','🕗':'🕥','🕘':'🕤','🕙':'🕣','🕚':'🕢','🕛':'🕡'
        },
        'increase': {
            '🔇':'🔉','🔉':'🔊',
            '👌':'☝️','☝️':'✌️','✌️':'🖐',
            '🍺':'🍻',
            '0⃣':'1⃣','1⃣':'2⃣','2⃣':'3⃣','3⃣':'4⃣','4⃣':'5⃣','5⃣':'6⃣','6⃣':'7⃣','7⃣':'8⃣','8⃣':'9⃣'
        }
    },
    'filter': {
        'isVegetarian': ['💩','🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🍈','🍒','🍑','🍍','🍅','🍆','🌶','🌽','🍠','🍯','🍞','🍟','🍝','🍜','🍥','🍛','🍙','🍚','🍘','🍰','🎂','🍮','🍬','🍭','🍫','🍿','🍩','🍪','🍺','🍻','🍷','🍸','🍹','🍾','🍶','🍵'],
        'isMusical': ['🎷','🎸','🎹','🎺','🎻','🎙']
    },
    'reduce': {
        'eat': ['🍗','🍿','🍔','🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🍈','🍒','🍑','🍍','🍅','🍆','🌶','🌽','🍠','🍯','🍞','🍟','🍝','🍜','🍥','🍛','🍙','🍚','🍘','🍰','🎂','🍮','🍬','🍭','🍫','🍿','🍩','🍪','🍺','🍻','🍷','🍸','🍹','🍾','🍶','🍵'],
        'play': ['🎷','🎸','🎹','🎺','🎻','🎙'],
        'sum': ['0⃣','1⃣','2⃣','3⃣','4⃣','5⃣','6⃣','7⃣','8⃣','9⃣','🕐','🕠','🕑','🕟','🕒','🕞','🕓','🕝','🕔','🕜','🕕','🕧','🕖','🕦','🕗','🕥','🕘','🕤','🕙','🕣','🕚','🕢','🕛','🕡']
    }
};

opNames.filter = Object.keys(opNames.filter).reduce((pre, cur) => {
    pre[cur] = opNames.filter[cur].reduce((pre, cur) => {pre[cur] = true; return pre;}, {});
    return pre;
}, {});

opNames.reduce = Object.keys(opNames.reduce).reduce((pre, cur) => {
    pre[cur] = opNames.reduce[cur].reduce((pre, cur) => {pre[cur] = true; return pre;}, {});
    return pre;
}, {});


let opTypes = {
    'map': (mapFunc) => {
        return (arr) => {
            return arr.map((each) => {
                return opNames.map[mapFunc][each];
            });
        };
    },

    'filter': (filterFunc) => {
        return (arr) => {
            return arr.filter((each) => {
                return opNames.filter[filterFunc][each];
            });
        }
    },

    'reduce': (reducerFunc) => {
        return (arr) => {
            return [arr.reduce(reducers[reducerFunc])];
        };
    }
};

let pickRandom = (arr) => {
    return arr[Math.floor(Math.random()*arr.length)];
};

let pickSome = (arr, n) => {
    let out = [];
    let copy = arr.slice();
    for(let i=0; i<n; i++) {
        let grab = copy.splice(Math.floor(Math.random()*copy.length), 1);
        out = out.concat(grab);
    }
    return out;
};

let pickOperation = (data) => {
    if(data) {
        let opFunc = pickRandom(Object.keys(opTypes));
        let opName = pickRandom(Object.keys(opNames[opFunc]));
        return {func: opFunc, name: opName};
    } else {
        let opFunc = pickRandom(Object.keys(opTypes));
        let opName = pickRandom(Object.keys(opNames[opFunc]));
        return {func: opFunc, name: opName};
    }
};

let pickStartingEmoji = (operation) => {
    let goodSet = pickSome(Object.keys(opNames[operation.func][operation.name]), 3);
    if(operation.func === 'filter') {
        let badSet = pickSome(randoSet, 2);
        return goodSet.concat(badSet);
    }
    return goodSet;
};

let render = (input, output, type, name) => {
    return `[${input}].${type}(${name}) => [${output}]`;
};

let generateTweet = () => {
    let iterations = 1+Math.floor(Math.random()*3);
    let operation = pickOperation(); // [map(cook), filter(isVegetarian), reduce(eat)]

    let tweetText = '';
    let data = pickStartingEmoji(operation); // pick emoji compatible with op
    for(let i=0; i<iterations; i++) {
        if(data.length === 0) {
            break;
        }
        let output = (opTypes[operation.func])(operation.name)(data);
        let renderText = render(data, output, operation.func, operation.name) + '\n';
        tweetText += renderText;
        data = output;
        operation = pickOperation(data); // pick operation compatible with output
    }
    return tweetText;
}

let tweet = generateTweet();
console.log(tweet);
client.post('statuses/update', {status: tweet}, (error, tweet) => {
    if(error) throw error;
    console.log('tweet success');
});
