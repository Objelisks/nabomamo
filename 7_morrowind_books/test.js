let noodle = require('noodlejs');
let fs = require('fs');

noodle.query({
    url: 'https://www.imperial-library.info/content/morrowind-brief-history-empire',
    type: 'html',
    selector: 'div.field-content',
    extract: 'text'
}).then(res => {
    fs.writeFileSync('./test', res.results[0].results[0]);
});