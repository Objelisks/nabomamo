let Xray = require('x-ray');
let x = Xray('phantom');

/*
x('http://mhgen.kiranico.com/insectglaive/seditious-breaker', {
    weaponName: 'li.active span.hidden-sm-down',
    weaponType: 'div.lead a',
    weaponElement: 'table.table tr td div small',
    imageUrl: 'model-viewer@image-url'
})((err, result) => {
    console.log(err, result);
});
*/

x('http://mhgen.kiranico.com/greatsword', 'table.table', ['tbody tr td a'])((err, result) => {
    console.log(err, result);
});


/*
(function(console){

console.save = function(data, filename){

    if(!data) {
        console.error('Console.save: No data')
        return;
    }

    if(!filename) filename = 'console.json'

    if(typeof data === "object"){
        data = JSON.stringify(data, undefined, 4)
    }

    var blob = new Blob([data], {type: 'text/json'}),
        e    = document.createEvent('MouseEvents'),
        a    = document.createElement('a')

    a.download = filename
    a.href = window.URL.createObjectURL(blob)
    a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    a.dispatchEvent(e)
 }
})(console)
let extractData = (weapon) => {return {id: weapon.id, name: weapon.strings[0].name, url: weapon.url, image: weapon.image, element: weapon.levels[0].elements[0]}};
console.save(window.mhgen.weapons.map(extractData));
*/
