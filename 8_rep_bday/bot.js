let fs = require('fs');
let csv = require('csv');
let fetch = require('node-fetch');
let Twitter = require('twitter');
let client = new Twitter(JSON.parse(fs.readFileSync('./creds.json')));

let today = new Date();
let dataFile = './legislators-current.csv';

let p = Promise.resolve();
// january 5th of each odd year
if(!fs.existsSync(dataFile) || (today.getDate() === 4 && today.getFullYear() % 2 === 1 && today.getMonth() === 0)) {
    // update the legislators csv file
    let url = 'https://www.govtrack.us/data/congress-legislators/legislators-current.csv';
    p = fetch(url)
        .then(data => data.text())
        .then(data => {
            fs.writeFileSync(dataFile, ''+data);
        });
}

p.then(() => {
    let input = fs.createReadStream(dataFile);
    
    let birthdays = {};
    let mon = (''+today.getMonth()).length === 1 ? '0' + today.getMonth() : ''+today.getMonth();
    let dag = (''+today.getDate()).length === 1 ? '0' + today.getDate() : ''+today.getDate();
    let dateStr = mon + dag;
    
    let process = input.pipe(csv.parse())
        .pipe(csv.transform((data) => {
            let day = data[2].split('-');
            day = day[1] + day[2];
            birthdays[day] = (birthdays[day] || []);
            birthdays[day].push(data);
        }));
    process.on('finish', () => {
        let todaysBdays = birthdays[dateStr];
        if(todaysBdays) {
            let handles = birthdays[dateStr].map(x => '' + x[13]).filter(x => x.length > 1);
            if(handles.length === 0) {
                return;
            }
            
            let tweet = '';
            if(handles.length === 1) {
                tweet = 'Happy birthday to ' + handles[0];
            } else if(handles.length == 2) {
                tweet = 'Happy birthday to ' + handles[0] + ' and ' + handles[1];
            } else {
                tweet = 'Happy birthday to '
                    + handles.slice(0, handles.length-1).join(', ')
                    + ', and ' + handles[handles.length-1]; // oxford comma fight me
            }
            console.log(tweet);
            client.post('statuses/update', {
                status: tweet
            }, (err, res) => {
                console.log(err, tweet);
            });
        }
    });

});