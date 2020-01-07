let axios = require('axios'),
  to = require('await-to-js').to,
  util = require('util'),
  exec = util.promisify(require('child_process').exec);
const fs = require('fs-extra');
// const matchAll = require("match-all");

let foundNumbers = [];
let missingNumbers = [];

const lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('CiSHeader.txt')
});


lineReader.on('line', (input) => {
  let line = JSON.parse(input)
  let {
    hymnNumber
  } = line
  foundNumbers.push(hymnNumber)
  // console.log(hymnNumber)
  // console.log(`Received: ${input}`);
});

setTimeout(function () {
  for (let i = 1; i <= 951; i++){
    //   console.log(foundNumbers.includes(i))
    if (!foundNumbers.includes(i)) {
      console.log(i)
      missingNumbers.push(i)
    }
}
}, 5000)
