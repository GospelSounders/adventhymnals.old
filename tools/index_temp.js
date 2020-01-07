let axios = require('axios'),
to = require('await-to-js').to,
util = require('util'),
exec = util.promisify(require('child_process').exec);
const fs = require('fs-extra');
const matchAll = require("match-all");

getFromOnline = async (pageData) => {
  // console.log(pageData)
  let title_number = /<h2 class='hymntitle'>([^;]+)<\/h2>/.exec(pageData)[1];
  // let author = /Author:<[^>]+>/.exec(pageData)[0];
  console.log(title_number)
  let hymnNumber = parseInt(title_number)

  //<b>Author:</b></td><td><a href="/person/Bonar_Horatius">Horatius Bonar</a>
  let author = /<.*?>(.*?)<\/.*?>/g.exec(pageData)[4];
  // let extracted = pageData.matchAll(/<.*?>(.*?)<\/.*?>/g)
  let reg = new RegExp(/<.*?>(.*?)<\/.*?>/g)
// console.log(pageData)
console.log(typeof pageData)
let extracted;
//  let extracted = pageData.matchAll(/<.*?>(.*?)<\/.*?>/)
extracted = matchAll(pageData, /<.*?>(.*?)<\/.*?>/g).toArray();
  let result = {}
  let searchFor = [
   'hymntitle', 'Author:', 'Composer:', 'Arranger:', 'Tune:', 'Name:', 'Key:', 'First Line:', 'Title:', 'Refrain First Line:', 'Publication Date:', 'Scripture:', 'Topic:'
  ]
  let requiredData = {};
  let previousLine = 'jshkjhdskjfhksd';
  let tmpDetails = {}
  while ((result = reg.exec(pageData)) !== null) {
   
    // if(previousLine === 'Arranger:') {
    //   // if(previousLine === 'Author:') {
    //     console.log('IS FIRST LINE....')
    //     // console.log(searchFor.indexOf(previousLine))
    //     // console.log(result[1])
    //     // console.log(previousLine.replace(":", ''))
    //     // console.log(innerResult)
    //     process.exit();
    //   }
    // console.log(searchFor.indexOf(previousLine))
    if (searchFor.indexOf(previousLine) !== -1) {
      let innerReg = />([^<](.*))/g;
      try {
        let innerResult = innerReg.exec(result[1])[1]
        // console.log(`${previousLine}=>${innerResult}`)
        // if(previousLine === 'Title:')
       

        if(previousLine === 'Name:') {
          previousLine='Tune:'
        }
        innerResult = innerResult.split('[').join('')
        innerResult = innerResult.split(']').join('')
        tmpDetails[previousLine.replace(":", '')] = innerResult
        let tmpLine = result[1];
       
        // if(previousLine === 'Name:') {
        //   previousLine='Tune:'
        //   // if(previousLine === 'Author:') {
        //     console.log('IS FIRST LINE....')
        //     console.log(searchFor.indexOf(previousLine))
        //     console.log(result[1])
        //     console.log(previousLine.replace(":", ''))
        //     console.log(innerResult)
        //     process.exit();
        //   }

          previousLine = result[1];
        // if(!)result[]
        // console.log(tmpLine)
      } catch (err) {

      }
    } else
      previousLine = result[1];

  }

  tmpDetails['hymnNumber'] = hymnNumber;
  console.log(tmpDetails)
  fs.appendFileSync('CiSHeader.txt', JSON.stringify(tmpDetails)+'\n');

}


let rootPath = "https://hymnary.org/hymn/CSR1908/"
let songNumber = 1;

let numbers = [];
let i = 1;
while(i<951) {
    numbers.push(i++)
}

async function fetchHymnTitle(number){
    let path = `${rootPath}${number}`
    // console.log(path)
    let [err, hymnPage] = await to(axios.get(path))

    let title, title_number;

    try{
    hymnPage = hymnPage.data
    
    
    //     title_number = /<h2 class='hymntitle'>([^;]+)<\/h2>/.exec(hymnPage)[1];
    //     title = /[0-9]+\. ([^;]+)/.exec(title_number)[1];
    // // console.log(title)
    //     number = number.toString();
    //     if(number.length < 3)number = `0${number}`
    //     if(number.length < 3)number = `0${number}`
    //     // console.log(number)
    //     exec(`echo "${title};${number}" >> cisIndex.csv`)

    getFromOnline(hymnPage)
    }catch (error){
        // console.log(number)
    }
}

// Will stop updating at the end of the list...
exec(`echo "Christ in Song;Number" > cisIndex.csv`)
let currentNumber = 1;
setInterval(function(){
    fetchHymnTitle(currentNumber++)
},100);



