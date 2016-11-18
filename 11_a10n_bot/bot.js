let request = require('request');
let fs = require('fs');
let Twitter = require('twitter');
let creds = JSON.parse(fs.readFileSync('./creds.json'));
let client = new Twitter(creds.twitter);
let f = '4090dd7081a2c9acb742c92a2dc08f53ef4a5804b12bc6cbb';

let url = 'http://api.wordnik.com:80/v4/words.json/randomWord?includePartOfSpeech=noun&hasDictionaryDef=false&minCorpusCount=0&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=10&maxLength=-1&api_key=' + creds.wordnik;
request(url, (err, res) => {
    if(err) throw err;
    let word = JSON.parse(res.body).word;
    let abbr = word[0] + (word.length-2) + word[word.length-1];
    let tweet = abbr + ': ' + word;
    client.post('statuses/update', {
        status: tweet
    }, (err, res) => {
        console.log(err, tweet);
    });
});