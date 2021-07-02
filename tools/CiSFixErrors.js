let axios = require('axios'),
    to = require('await-to-js').to,
    util = require('util'),
    exec = util.promisify(require('child_process').exec);
const fs = require('fs-extra');
const path = require('path');

let allTitles = []
let missing = []
const main = async () => {
    let filesList = (await exec(`du -a /var/www/html/csycms/ahdev/content/02.christ-in-song`)).stdout.split(/\n/).filter(item => item.match(/\.md$/))
    let titlesPaths = filesList.filter(item => item.match(/docs\.md$/)).map(item => item.replace(/[^\t]+\t/,''))
    let titles = titlesPaths.map(item => item.match(/\/([^\/]+)\/docs\.md/)[1].replace(/^[0-9]*\./,''))
    titles.map((title, index)=>{
        if(title.length === 0){
            missing.push(titlesPaths[index])
            return
        }
        let ind = 1;
        while(allTitles.includes(title)){
            title = `${title}_${ind++}`
            // console.log(title)
            // console.log(allTitles, title, titlesPaths);
            // process.exit()
        }
        allTitles.push(title)
    })
    // console.log(filesList.length)
    // console.log(titles.length)
    console.log(titles)
    console.log(missing)
    // console.log(titlesPaths)
}

main()
