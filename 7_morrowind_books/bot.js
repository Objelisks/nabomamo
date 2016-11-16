let fs = require('fs');
let Twitter = require('twitter');
let client = new Twitter(JSON.parse(fs.readFileSync('./creds.json')));
let progress = JSON.parse(fs.readFileSync('./progress.json'));

// try to get as close to 140 characters or close to a full sentence
let books = fs.readdirSync('./books/');

let book = '';
if(progress.book) {
    book = progress.book;
} else {
    book = books[Math.floor(Math.random()*books.length)];
}
let bookContent = fs.readFileSync('./books/' + book, 'utf8');
let chars = progress.chars || 0;
let snippet = bookContent.slice(chars, chars+140);
let sentenceEnd = snippet.lastIndexOf('.');
if(sentenceEnd > 100) {
    snippet = snippet.slice(0, sentenceEnd+1);
}
let increment = snippet.length;

let outProgress = {};
if(chars+increment < bookContent.length) {
    outProgress = {
        book: book,
        chars: chars+increment
    };
}
fs.writeFileSync('./progress.json', JSON.stringify(outProgress));

client.post('statuses/update', {
    status: snippet
}, (err, tweet) => {
    if(err) throw err;
    console.log(snippet);
});