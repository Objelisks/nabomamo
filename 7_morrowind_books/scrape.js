let noodle = require('noodlejs');
let request = require('request');
let fs = require('fs');

let library = 'https://www.imperial-library.info';
let index = '/books/morrowind/by-title';

noodle.query({
    url: library + index,
    type: 'html',
    extract: 'href',
    selector: 'span.field-content a'
}).then(results => {
    results.results[0].results.map(book => {
        let bookName = book.slice(book.lastIndexOf('/'));
        request(library + book).pipe(fs.createWriteStream('./html/' + bookName));
    });
});