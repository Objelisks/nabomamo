let noodle = require('noodlejs');
let cheerio = require('cheerio');
let fs = require('fs');
let files = fs.readdirSync('./html/');
//let files = ['dance-fire'];

files.forEach((file) => {
    let bookName = file;
    let str = fs.readFileSync('./html/' + bookName, 'utf8');//.replace(/\<br\>/g, '\n');
    noodle.html.select(str, {selector: '#content .node-content p', extract: 'html'})
        .then(result => {
            let htmlcontent = result.results.join('\n');
            let content = cheerio.load(htmlcontent).text();
            fs.writeFile('./books/' + bookName, content, () => {
                console.log(bookName);
            });
        });
});