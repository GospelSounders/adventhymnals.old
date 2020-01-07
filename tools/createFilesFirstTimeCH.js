let axios = require('axios'),
  to = require('await-to-js').to,
  util = require('util'),
  exec = util.promisify(require('child_process').exec);
const fs = require('fs-extra');
const path = require('path');
// const matchAll = require("match-all");

let foundNumbers = [];
let missingNumbers = [];

var decode = require('unescape');

const lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('CHHeader.txt')
});




let startNumber = 1;
let endNumber = 703;
////////////////////////////////////// first create folder structure...

let folderPaths = []
let boundaries = []
let boundaries__ = []
let createBigFolders = () => {
  for (i = startNumber; i <= endNumber; i += 100) {
    let boundary = [i, i + 100 - 1 > endNumber ? endNumber : i + 100 - 1]
    boundaries.push(boundary);
    // let outerNumber = 
  }

  let boundaries_ = []
  for (let i in boundaries) {

    let boundaryStart = boundaries[i][0];
    let boundaryEnd = boundaries[i][1];
    boundaryStart = boundaryStart.toString()
    boundaryEnd = boundaryEnd.toString()

    if (boundaryStart.length < 2) boundaryStart = '0' + boundaryStart
    if (boundaryStart.length < 3) boundaryStart = '0' + boundaryStart

    if (boundaryEnd.length < 2) boundaryEnd = '0' + boundaryEnd
    if (boundaryEnd.length < 3) boundaryEnd = '0' + boundaryEnd

    tmpe = `${boundaryStart}-${boundaryEnd}`
    boundaries_.push(tmpe);


    boundaryStart = parseInt(boundaryStart)
    boundaryEnd = parseInt(boundaryEnd)
    let boundariesInner = []
    for (j = boundaryStart; j <= boundaryEnd; j += 10) {
      let j_ = j.toString();
      if (j_.length < 2) j_ = '0' + j_
      if (j_.length < 3) j_ = '0' + j_
      
      let j__ = j + 10 - 1
      j__ = j__.toString();
      if (j__.length < 2) j__ = '0' + j__
      if (j__.length < 3) j__ = '0' + j__

      let endNumber_j = endNumber.toString();
      if (endNumber_j.length < 2) endNumber_j = '0' + endNumber_j
      if (endNumber_j.length < 3) endNumber_j = '0' + endNumber_j

      // let boundary = [j_, j + 10 - 1 > endNumber ? endNumber : j + 10 - 1]
      let boundary = [j_, j + 10 - 1 > endNumber ? endNumber_j : j__]
      boundariesInner.push(boundary);
      // console.log(boundariesInner)
      // let outerNumber = 
    }
    boundaries_.push(boundariesInner);
    // console.log(boundaries_)
    boundaries__.push([tmpe, boundariesInner])
  }

}

createBigFolders();
// console.log(JSON.stringify(boundaries__));
// console.log(boundaries__);

//create the directories and etc...
for (let i in boundaries__) {
  let outerPath = (parseInt(i) + 2).toString();
  if (outerPath.length < 2) outerPath = '0' + outerPath
  outerPath = `${outerPath}.${boundaries__[i][0]}`


  //create folders
  try {
    fs.mkdirSync(path.join(__dirname, "files", "lyrics", "created", "CH", outerPath))
  } catch (error) {}


  // create .md files
  let chapterTxt =
    `---
title: Church Hymnal - ${boundaries__[i][0].split(":").join(";")}
metadata:
    description: Church Hymnal - ${boundaries__[i][0].split(":").join(";")}
    keywords: Church Hymnal, ${boundaries__[i][0].split(":").join(";")}
    author: Brian Onang'o
---


## Church Hymnal - ${boundaries__[i][0]}
  `
  fs.writeFileSync(path.join(__dirname, "files", "lyrics", "created", "CH", outerPath, `chapter.md`), chapterTxt)
  // if (outerPath.length < 3) outerPath = '0' + outerPath
  // console.log(`=========>${outerPath}`)
  // console.log(boundaries__[i])

  // inner chapter folders
  for (let j in boundaries__[i][1]) {
    let tmpe_ = boundaries__[i][1][j]
    // console.log(tmpe_)

    let innerPath = (parseInt(j) + 1).toString();
    if (innerPath.length < 2) innerPath = '0' + innerPath
    innerPath = `${innerPath}.${tmpe_[0]}-${tmpe_[1]}`
    console.log(innerPath)
    try {
      fs.mkdirSync(path.join(__dirname, "files", "lyrics", "created", "CH", outerPath, innerPath))
    } catch (error) {}

    let innerchapterTxt =
      `---
title: Church Hymnal - ${tmpe_[0]}-${tmpe_[1]}
metadata:
    description: Church Hymnal - ${tmpe_[0]}-${tmpe_[1]}
    keywords: Church Hymnal, ${tmpe_[0]}-${tmpe_[1]}
    author: Brian Onang'o
---


## Church Hymnal - ${tmpe_[0]}-${tmpe_[1]}
  `
    fs.writeFileSync(path.join(__dirname, "files", "lyrics", "created", "CH", outerPath, innerPath, `chapter.md`), innerchapterTxt)
  }
}




let createFile = (line) => {
  let {
    hymnNumber,
    Title,
    Author,
    Scripture,
    Topic,
    Composer,
    Arranger,
    Key,
    Tune
  } = line;
  if(!Composer){
    Composer = Arranger
    // console.log('No compoer');
    // console.log(line)
    // process.exit();
  }
  let First_Line = decode(line["First Line"])
  let Refrain_First_Line = decode(line["Refrain First Line"])
  let Publication_Date = decode(line["Publication Date"])
  hymnNumber = decodeURIComponent(hymnNumber)
  Title = decode(Title)
  Author = decode(Author)
  Scripture = decode(Scripture)
  Topic = decode(Topic)
  Composer = decode(Composer)
  Arranger = decode(Arranger)
  Composer = Composer || Arranger;
  Key = decode(Key)
  Tune = decode(Tune)

  // console.log(line["First Line"])
  // console.log(First_Line)
  // process.exit();

  let fileTxt =
    `---
title: ${hymnNumber}. ${Title.split(":").join(";")}
metadata:
    description: 
    keywords: Church Hymnal, ${Title.split(":").join(";")}, ${First_Line.split(":").join(";")}, ${Refrain_First_Line.split(":").join(";")}
    author: Brian Onang'o
---


## ${hymnNumber}. ${Title.toUpperCase()}

\`\`\`txt

\`\`\`

- |   -  |
-------------|------------|
Title | ${Title} |
Key | ${Key} |
Titles | ${Refrain_First_Line} |
First Line | ${First_Line} |
Author | ${Author}
Year | ${Publication_Date}
Composer| ${Composer} |
Hymnal|  - |
Tune| ${Tune} |
Metrical pattern | |
# Stanzas |  |
Chorus |  |
Chorus Type |  |
Subjects | ${Topic} |
Texts | ${Scripture} |
Print Texts | 
Scripture Song |  |
  
`

  // fs.writeFileSync(path.join(__dirname, "filese.txt"), fileTxt)
  let fileName = parseInt(hymnNumber) + 1;
  fileName = fileName.toString();
  if (fileName.length < 2) fileName = '0' + fileName
  if (fileName.length < 3) fileName = '0' + fileName
  fileName = `${fileName}.${Title}`

  let whichFolder = (hymnNo) => {
    // let outerFolder = parseInt(hymnNo / 100) + 1
    // let outerFolder = parseInt(hymnNo / 100) + 1
    let outerFolder = (hymnNo / 100) > parseInt(hymnNo / 100)? + parseInt(hymnNo / 100) + 1 : parseInt(hymnNo / 100);
    let outerFolder_ = (outerFolder + 1).toString();
    if (outerFolder_.length < 2) outerFolder_ = '0' + outerFolder_;
    let outerFolder_Start = (outerFolder - 1) * 100 + 1;
    let outerFolder_End = (outerFolder - 1) * 100 + 100;
    outerFolder_End = outerFolder_End > endNumber ? endNumber : outerFolder_End
    outerFolder_Start = outerFolder_Start.toString()
    if (outerFolder_Start.length < 2) outerFolder_Start = '0' + outerFolder_Start
    if (outerFolder_Start.length < 3) outerFolder_Start = '0' + outerFolder_Start
    outerFolder_ = `${outerFolder_}.${outerFolder_Start}-${outerFolder_End}`;

    let innerFolderParams = parseInt((hymnNo - parseInt(outerFolder_Start)) / 10) + 1;
    // if()
    
   
    // let innerFolder = hymnNo - parseInt(outerFolder_Start)

    // console.log(outerFolder_)
    // console.log(`${innerFolderParams}:${hymnNo}:${outerFolder_Start}:${hymnNo - parseInt(outerFolder_Start)}:${(hymnNo - parseInt(outerFolder_Start))/10}`)

    let innerFolder = innerFolderParams;
    let innerFolder_ = innerFolderParams.toString();
    if (innerFolder_.length < 2) innerFolder_ = '0' + innerFolder_;
    // if (innerFolder_.length < 3) innerFolder_ = '0' + innerFolder_;
    let innerFolder_Start = (innerFolder - 1) * 10 + parseInt(outerFolder_Start);
    let innerFolder_End = (innerFolder - 1) * 10 + 10 + parseInt(outerFolder_Start) - 1;
    innerFolder_End = innerFolder_End > endNumber ? endNumber : innerFolder_End
    innerFolder_Start = innerFolder_Start.toString()
    if (innerFolder_Start.length < 2) innerFolder_Start = '0' + innerFolder_Start
    if (innerFolder_Start.length < 3) innerFolder_Start = '0' + innerFolder_Start

    innerFolder_End = innerFolder_End.toString()
    if (innerFolder_End.length < 2) innerFolder_End = '0' + innerFolder_End
    if (innerFolder_End.length < 3) innerFolder_End = '0' + innerFolder_End
    innerFolder_ = `${innerFolder_}.${innerFolder_Start}-${innerFolder_End}`;
    // console.log(`innerFolder_${innerFolder_}`)

    let tmpNumber = hymnNo - parseInt(innerFolder_Start) + 1;
    tmpNumber = tmpNumber.toString()
    if (tmpNumber.length < 2) tmpNumber = '0' + tmpNumber;

    // if(outerFolder_Start === '001') {
    if(tmpNumber === '00') {
      console.log(hymnNo)
      console.log(innerFolder_Start)
      console.log(outerFolder_Start)
      console.log(`${outerFolder_}/${innerFolder_}/${tmpNumber}.${Title}`)
    }
    return `${outerFolder_}/${innerFolder_}/${tmpNumber}.${Title}`
  }
  let filePath = whichFolder(hymnNumber)
  filePath = filePath.split(" ").join("-")
  filePath = filePath.split("?").join("")

  
  // console.log(filePath)
  // process.exit();
  try {
    fs.mkdirSync(path.join(__dirname, "files", "lyrics", "created", "CH", filePath))
  } catch (error) {}
  fs.writeFileSync(path.join(__dirname, "files", "lyrics", "created", "CH", filePath, 'docs.md'), fileTxt)

  // try {
  //   fs.mkdirSync(path.join(__dirname, "files", "lyrics", "created", "CH", fileName))
  // } catch (error) {}

  // fs.writeFileSync(path.join(__dirname, "files", "lyrics", "created", "CH", fileName, `docs.md`), fileTxt)
  // console.log(fileTxt)
}


lineReader.on('line', (input) => {
  let line = JSON.parse(input)
  let {
    hymnNumber
  } = line
  foundNumbers.push(hymnNumber)
  try {
    createFile(line)
  } catch (error) {
    console.log(error)
  }
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
