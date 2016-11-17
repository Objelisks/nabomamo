let noodle = require('noodlejs');
let fs = require('fs');
let request = require('request');

let url = 'http://tartarus.rpgclassics.com/zelda1/1stquest/images/overworld/highbandwidth/originals/';

noodle.query({
    url: url,
    type: 'html',
    extract: 'href',
    selector: 'td.n a'
}).then(results => {
    results.results[0].results.map(gifUrl => {
        if(gifUrl === '../') return;
        console.log(url, gifUrl);
        request(url + gifUrl).pipe(fs.createWriteStream('./images/' + gifUrl));
    });
});