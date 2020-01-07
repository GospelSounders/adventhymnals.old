let axios = require('axios'),
  to = require('await-to-js').to,
  util = require('util'),
  exec = util.promisify(require('child_process').exec);
const fs = require('fs-extra');
const path = require('path');
// const matchAll = require("match-all");

let foundNumbers = [];
let missingNumbers = [];

const lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('WN_step_1.txt')
});


// /files/lyrics/assets

lineReader.on('line', (input) => {
  let line = input.match(/"(.*?)"/)[1]
  line = `${line}.txt`
  fs.copySync(path.join(__dirname, "files", "lyrics", "assets", "assets", line), path.join(__dirname, "files", "lyrics", "WN_own", line))
  console.log(line)
//   let {
//     hymnNumber
//   } = line
//   foundNumbers.push(hymnNumber)
  // console.log(hymnNumber)
  // console.log(`Received: ${input}`);
});

// setTimeout(function () {
//   for (let i = 1; i <= 703; i++){
//     //   console.log(foundNumbers.includes(i))
//     if (!foundNumbers.includes(i)) {
//       console.log(i)
//       missingNumbers.push(i)
//     }
// }
// }, 5000)
