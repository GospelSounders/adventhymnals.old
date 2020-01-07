let axios = require('axios'),
  to = require('await-to-js').to,
  util = require('util'),
  exec = util.promisify(require('child_process').exec);
const fs = require('fs-extra');
const path = require('path');
const pathF = require('path');
const nthline = require('nthline');
const matchAll = require("match-all");

let foundNumbers = [];
let missingNumbers = [];

var decode = require('unescape');

const lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('CiSHeader.txt')
});




let startNumber = 1;
let endNumber = 695;

let haveRefrains = [];
////////////////////////////////////// first create folder structure...

// let folderPaths = []
// let boundaries = []
// let boundaries__ = []
// let createBigFolders = () => {
//   for (i = startNumber; i <= endNumber; i += 100) {
//     let boundary = [i, i + 100 - 1 > endNumber ? endNumber : i + 100 - 1]
//     boundaries.push(boundary);
//     // let outerNumber = 
//   }

//   let boundaries_ = []
//   for (let i in boundaries) {

//     let boundaryStart = boundaries[i][0];
//     let boundaryEnd = boundaries[i][1];
//     boundaryStart = boundaryStart.toString()
//     boundaryEnd = boundaryEnd.toString()

//     if (boundaryStart.length < 2) boundaryStart = '0' + boundaryStart
//     if (boundaryStart.length < 3) boundaryStart = '0' + boundaryStart

//     if (boundaryEnd.length < 2) boundaryEnd = '0' + boundaryEnd
//     if (boundaryEnd.length < 3) boundaryEnd = '0' + boundaryEnd

//     tmpe = `${boundaryStart}-${boundaryEnd}`
//     boundaries_.push(tmpe);


//     boundaryStart = parseInt(boundaryStart)
//     boundaryEnd = parseInt(boundaryEnd)
//     let boundariesInner = []
//     for (j = boundaryStart; j <= boundaryEnd; j += 10) {
//       let j_ = j.toString();
//       if (j_.length < 2) j_ = '0' + j_
//       if (j_.length < 3) j_ = '0' + j_

//       let j__ = j + 10 - 1
//       j__ = j__.toString();
//       if (j__.length < 2) j__ = '0' + j__
//       if (j__.length < 3) j__ = '0' + j__

//       let endNumber_j = endNumber.toString();
//       if (endNumber_j.length < 2) endNumber_j = '0' + endNumber_j
//       if (endNumber_j.length < 3) endNumber_j = '0' + endNumber_j

//       // let boundary = [j_, j + 10 - 1 > endNumber ? endNumber : j + 10 - 1]
//       let boundary = [j_, j + 10 - 1 > endNumber ? endNumber_j : j__]
//       boundariesInner.push(boundary);
//       //       // let outerNumber = 
//     }
//     boundaries_.push(boundariesInner);
//     //     boundaries__.push([tmpe, boundariesInner])
//   }

// }

// createBigFolders();
// // donsole.log(JSON.stringify(boundaries__));
// // donsole.log(boundaries__);

// //create the directories and etc...
// for (let i in boundaries__) {
//   let outerPath = (parseInt(i) + 2).toString();
//   if (outerPath.length < 2) outerPath = '0' + outerPath
//   outerPath = `${outerPath}.${boundaries__[i][0]}`


//   //create folders
//   try {
//     fs.mkdirSync(path.join(__dirname, "files", "lyrics", "created", "SDAH", outerPath))
//   } catch (error) {}


//   // create .md files
//   let chapterTxt =
//     `---
// title: Seventh Day Adventist Hymnal - ${boundaries__[i][0].split(":").join(";")}
// metadata:
//     description: Seventh Day Adventist Hymnal - ${boundaries__[i][0].split(":").join(";")}
//     keywords: Seventh Day Adventist Hymnal, ${boundaries__[i][0].split(":").join(";")}
//     author: Brian Onang'o
// ---


// ## Seventh Day Adventist Hymnal - ${boundaries__[i][0]}
//   `
//   fs.writeFileSync(path.join(__dirname, "files", "lyrics", "created", "SDAH", outerPath, `chapter.md`), chapterTxt)
//   // if (outerPath.length < 3) outerPath = '0' + outerPath
//   //   
//   // inner chapter folders
//   for (let j in boundaries__[i][1]) {
//     let tmpe_ = boundaries__[i][1][j]
//     
//     let innerPath = (parseInt(j) + 1).toString();
//     if (innerPath.length < 2) innerPath = '0' + innerPath
//     innerPath = `${innerPath}.${tmpe_[0]}-${tmpe_[1]}`
//     donsole.log(innerPath)
//     try {
//       fs.mkdirSync(path.join(__dirname, "files", "lyrics", "created", "SDAH", outerPath, innerPath))
//     } catch (error) {}

//     let innerchapterTxt =
//       `---
// title: Seventh Day Adventist Hymnal - ${tmpe_[0]}-${tmpe_[1]}
// metadata:
//     description: Seventh Day Adventist Hymnal - ${tmpe_[0]}-${tmpe_[1]}
//     keywords: Seventh Day Adventist Hymnal, ${tmpe_[0]}-${tmpe_[1]}
//     author: Brian Onang'o
// ---


// ## Seventh Day Adventist Hymnal - ${tmpe_[0]}-${tmpe_[1]}
//   `
//     fs.writeFileSync(path.join(__dirname, "files", "lyrics", "created", "SDAH", outerPath, innerPath, `chapter.md`), innerchapterTxt)
//   }
// }


let missingParts = {};

let createFile = (line) => {
  let {
    hymnNumber,
    Title,
    Author,
    Scripture,
    Topic,
    Composer,
    Key
  } = line;
  let First_Line = decode(line["First Line"])
  let Refrain_First_Line = decode(line["Refrain First Line"])
  let Publication_Date = decode(line["Publication Date"])
  hymnNumber = decodeURIComponent(hymnNumber)
  Title = decode(Title)
  Author = decode(Author)
  Scripture = decode(Scripture)
  Topic = decode(Topic)
  Composer = decode(Composer)
  Key = decode(Key)

  let fileTxt =
    `---
title: ${hymnNumber}. ${Title.split(":").join(";")}
metadata:
    description: 
    keywords: Seventh Day Adventist Hymnal, ${Title.split(":").join(";")}, ${First_Line.split(":").join(";")}, ${Refrain_First_Line.split(":").join(";")}
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
Tune|  |
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
    let outerFolder = (hymnNo / 100) > parseInt(hymnNo / 100) ? +parseInt(hymnNo / 100) + 1 : parseInt(hymnNo / 100);
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
    
    let tmpNumber = hymnNo - parseInt(innerFolder_Start) + 1;
    tmpNumber = tmpNumber.toString()
    if (tmpNumber.length < 2) tmpNumber = '0' + tmpNumber;

    // if(outerFolder_Start === '001') {

    return `${outerFolder_}/${innerFolder_}/${tmpNumber}.${Title}`
  }
  let filePath = whichFolder(hymnNumber)
  filePath = filePath.split(" ").join("-")
  filePath = filePath.split("?").join("")
  filePath += '/docs.md';

  let fileContents = fs.readFileSync(path.join(__dirname, "files", "lyrics", "created", "SDAH", filePath), 'utf-8')
  //   let title_c = fileContents.exec(/Title |/)
  let title_c = /Title \|([^\|]*?)+/.exec(fileContents)[0]
  let key_c = /Key \|([^\|]*?)+/.exec(fileContents)[0]
  let titles_c = /Titles \|([^\|]*?)+/.exec(fileContents)[0]
  let First_Line_c = /First Line \|([^\|]*?)+/.exec(fileContents)[0]
  let author_c = /Author \|([^\|]*?)+/.exec(fileContents)[0]
  let year_c = /Year \|([^\|]*?)+/.exec(fileContents)[0]
  let composer_c = /Composer\|([^\|]*?)+/.exec(fileContents)[0]
  let subjects_c = /Subjects \|([^\|]*?)+/.exec(fileContents)[0]
  let texts_c = /Texts \|([^\|]*?)+/.exec(fileContents)[0]
  let tune_c = /Tune\|([^\|]*?)+/.exec(fileContents)[0]
  // donsole.log(fileContents)
  // donsole.log(tune_c);process.exit();

  if (title_c === 'Title | ') {
    if (missingParts[hymnNumber] === undefined) missingParts[hymnNumber] = [];
    missingParts[hymnNumber].push('Title')
  }

  if (key_c === 'Key |  ') {
    if (missingParts[hymnNumber] === undefined) missingParts[hymnNumber] = [];
    missingParts[hymnNumber].push('Key')
  }
  //   if (titles_c === 'Titles |  ') {
  //     if (missingParts[hymnNumber] === undefined) missingParts[hymnNumber] = [];
  //     missingParts[hymnNumber].push('titles_c')
  //   }
  if (First_Line_c === 'First Line |  ') {
    if (missingParts[hymnNumber] === undefined) missingParts[hymnNumber] = [];
    missingParts[hymnNumber].push('First_Line_c')
  }
  if (author_c === 'Author |  ') {
    if (missingParts[hymnNumber] === undefined) missingParts[hymnNumber] = [];
    missingParts[hymnNumber].push('author_c')
  }
  if (year_c === 'Year |  ') {
    if (missingParts[hymnNumber] === undefined) missingParts[hymnNumber] = [];
    missingParts[hymnNumber].push('year_c')
  }
  if (composer_c === 'Composer|  ') {
    if (missingParts[hymnNumber] === undefined) missingParts[hymnNumber] = [];
    missingParts[hymnNumber].push('composer_c')
  }
  if (subjects_c === 'Subjects |  ') {
    if (missingParts[hymnNumber] === undefined) missingParts[hymnNumber] = [];
    missingParts[hymnNumber].push('subjects_c')
  }
  if (texts_c === 'Texts | ') {
    if (missingParts[hymnNumber] === undefined) missingParts[hymnNumber] = [];
    missingParts[hymnNumber].push('texts_c')
  }
  if (tune_c === 'Tune | ') {
    if (missingParts[hymnNumber] === undefined) missingParts[hymnNumber] = [];
    missingParts[hymnNumber].push('tune_c')
  }

  // donsole.log(fileContents);
  console.log(title_c)
  console.log(key_c)
  //   process.exit();


// donsole.log(filePath)
  // process.exit();
  //   try {
  //     fs.mkdirSync(path.join(__dirname, "files", "lyrics", "created", "SDAH", filePath))
  //   } catch (error) {}
  //   fs.writeFileSync(path.join(__dirname, "files", "lyrics", "created", "SDAH", filePath, 'docs.md'), fileTxt)



  // try {
  //   fs.mkdirSync(path.join(__dirname, "files", "lyrics", "created", "SDAH", fileName))
  // } catch (error) {}

  // fs.writeFileSync(path.join(__dirname, "files", "lyrics", "created", "SDAH", fileName, `docs.md`), fileTxt)
  }


let whichFolder = (hymnNo, Title) => {
  // let outerFolder = parseInt(hymnNo / 100) + 1
  // let outerFolder = parseInt(hymnNo / 100) + 1
  let outerFolder = (hymnNo / 100) > parseInt(hymnNo / 100) ? +parseInt(hymnNo / 100) + 1 : parseInt(hymnNo / 100);
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
  
  let tmpNumber = hymnNo - parseInt(innerFolder_Start) + 1;
  tmpNumber = tmpNumber.toString()
  if (tmpNumber.length < 2) tmpNumber = '0' + tmpNumber;

  // if(outerFolder_Start === '001') {
        return `${outerFolder_}/${innerFolder_}/${tmpNumber}.${Title}`
}


let input = "SDAH1985"
let start = 1
let stop = 695
let inputPath = path.join(__dirname, "files", "lyrics", input);
let fileNameFormat = 0; // integer in fileNames

let filePath = path.join(inputPath, `${start}.txt`)
try {
  fs.readFileSync(filePath)
} catch (error) {
  fileNameFormat = 1;
  }

start = parseInt(start)
stop = parseInt(stop)
let filePaths = [];
for (let i = start; i <= stop; i++) {
  if (fileNameFormat === 0) filePath = path.join(inputPath, `${start}.txt`)
  else {
    let tmp = i.toString();
    if (tmp.length < 2) tmp = '0' + tmp
    if (tmp.length < 3) tmp = '0' + tmp
    filePath = path.join(inputPath, `${tmp}.txt`)
      }
  filePaths.push(filePath)
  //   let hymnTxt = fs.readFileSync(filePath, 'utf-8')
  //   process.exit();
}
// process.exit();


let readLine = async (lineNumber, path) => {
  return new Promise((resolve, reject) => {
    
    try {
      nthline(lineNumber, path)
        .then(line => resolve(line))
    } catch (err) {
      resolve('')
    }
  })
}


let readTitle = async (path) => {

  let firstLine;

  try {
    firstLine = await readLine(0, path);
  } catch (err) {
    // donsole.error(err)
  }


  let tmps = firstLine.split('-')
  let hymnNumber = parseInt(tmps.shift());
  let title = tmps.join('-').replace(' ', '')

  let wholeFile = fs.readFileSync(path, 'utf-8')

  let firstLineofContent = /([\d])\.\n/.exec(wholeFile)
  try {
    firstLineofContent = firstLineofContent.index;
  } catch (error) {
    // donsole.error(error)
  }
  // donsole.log(firstLineofContent)  
// console.log(`#:${hymnNumber}->${firstLineofContent}`)
// console.log(`TITLE:${title}`)
// console.log(`file:${wholeFile}`)
  let patt = /[\d]\..*/s;
  let hymnText = patt.exec(wholeFile)
  hymnText = hymnText[0];

  //   ;process.exit()

  patt = /\nRefrain.*/s;
  // patt = /Chorus:(.*(?:\r?\n(?!\s*\r?\n).*)*)/;
  let chorus = patt.exec(hymnText)
// donsole.log('11111111111111111111111111111')
  try {
    if (chorus[0]) chorus = chorus[0].split('\n\n')[0]
  } catch (err) {}
//   console.log(`TITLE----1:${title}`)
// donsole.log('2222222222222222222222222222')
  //   patt = /Refrain:((.*)\n)*/;
  // patt = /Refrain:(.*(?:\r?\n(?!\s*\r?\n).*)*)/;
  //   let refrain = patt.exec(hymnText)
  let refrain = ""
  try {
    if (refrain[0]) refrain = refrain[0].split('\n\n')[0]
  } catch (err) {}

//   console.log(`TITLE----2:${title}`)
  hymnText = hymnText.replace(/ \[Chorus\]\n/g, `\n\n${chorus}\n\n`)
  hymnText = hymnText.replace(/ \[Refrain\]\n/g, `\n\n${refrain}\n\n`)

  // donsole.log('11111111111111111111111111111')
// donsole.log(chorus)
// donsole.log('11111111111111111111111111111')
// donsole.log(refrain)

  patt = /[\d]\..*/g;
  // let numStanzas = patt.exec(hymnText)
  let numStanzas = hymnText.match(patt).length
  // let numStanzas = matchAll(hymnText, patt).toArray();
  
  // let null_ = null
        let hasChorus = '-'
  if (chorus) hasChorus = 'chorus'
  else if (refrain) hasChorus = 'refrain'

  try {
    // let filePath = whichFolder(hymnNumber, title)
  } catch (error) {
      }
  let filePath = whichFolder(hymnNumber, title)

  let getCHFilePath = async (whichPath) => {
    // if(hymnNumber===695)console.log(`${hymnNumber}:=>${whichPath}`)
    return new Promise((resolve, reject) => {
      let lineReader1 = require('readline').createInterface({
        input: require('fs').createReadStream('SDAHpaths.txt')
      });

    //   process.exit();
      lineReader1.on('line', (input) => {
        let line = input
        // if(hymnNumber===695)console.log(line);
        // if(hymnNumber===695)console.log(line.includes(whichPath));
        // if(hymnNumber===695)console.log(whichPath);
        // console.log(line)
          if(line.includes(whichPath))
          {
            // console.log(input)
            // console.log(whichPath)
            // console.log(line.includes(whichPath))
          }
         
       
       if(line.includes(whichPath))return resolve(line);
                // donsole.log(`Received: ${input}`);
      });
    });
  }

//   console.log(`TITLE----4:${title}`)
// donsole.log(title);
//   process.exit();


// if(hymnNumber===695)console.log(`${hymnNumber}:${filePath}`)
filePath = filePath.split('/')
let tmpFilePath = filePath.pop();
tmpFilePath = tmpFilePath.split('.')
tmpFilePath = tmpFilePath.shift();
filePath = filePath.join('/')+'/'+tmpFilePath
// if(hymnNumber===695)console.log(`${hymnNumber}:${filePath}`)
// console.log(filePath)
// process.exit();
// filePath = path.joi(filePath, tmpFilePath)
try{
filePath = await getCHFilePath(filePath)
} catch (error) {
    console.log(error)
  }
//   if(hymnNumber===695)console.log(`${hymnNumber}:${filePath}`)
//     process.exit();

//   filePath = filePath.split(" ").join("-")
//   filePath = filePath.split("?").join("")
//   filePath += '/docs.md';
  
// console.log(`${hymnNumber}:${hasChorus}`)
  try {
                if(hasChorus !== '-'){
        // console.log("--------------")
        chorus = chorus.split("\n\n")[0]
        // console.log(chorus)
        // console.log("__________________")
        hymnText = hymnText.replace(chorus, "")
        hymnText = hymnText.split("\n\n")
        hymnText = hymnText.join(`\n\n${chorus}\n\n`)
       

        // count number of refrains... so that we do not add two at the end of the file...
        let numrefrains = hymnText.split("Refrain:").length
        if(numrefrains === numStanzas)hymnText += `${chorus}\n\n`
        // console.log("<<<<<<<<<<<<<<<<<<")
        // console.log(hymnText)
        // process.exit();
                // patt = /\nRefrain.*/s;
                haveRefrains.push([hymnNumber,hymnText] )
            }

    let fileContents = fs.readFileSync(pathF.join( __dirname, filePath), 'utf-8')
    fileContents = fileContents.split('```')
    let toJoin = [fileContents[0], `txt\n${hymnText}`, fileContents[2]]
    fileContents = toJoin.join('```')

    fileContents = fileContents.split('# Stanzas |  |')
    fileContents = fileContents.join(`# Stanzas | ${numStanzas} |`)

    fileContents = fileContents.split('Chorus |  |')
    fileContents = fileContents.join(`Chorus | ${hasChorus==='-'?'No':'Yes'} |`)

    fileContents = fileContents.split('Chorus Type |  |')
    fileContents = fileContents.join(`Chorus Type | ${hasChorus} |`)

    
    // console.log(hymnNumber)
    // console.log(fileContents)
    console.log(pathF.join( __dirname, filePath))
    fs.writeFileSync(pathF.join( __dirname, filePath),fileContents)
    // process.exit();
      } catch (error) {
    console.log(`=============>${filePath}`)
    console.log(`=============>${error}`)
  }
  // if(chorus)
  // process.exit();
//   files/lyrics/created/SDAH/08.601-695/05.641-650/07.Mine-Eyes-Have-Seen-the-Glory
//   files/lyrics/created/SDAH/08.601-700/05.641-650/07.Mine-Eyes-Have-Seen-the-Glory/docs.md
// /home/brian/Code/CSECO/cmsTests/Raneto/content/adventhymnal/tools/files/lyrics/created/SDAH/08.601-700/09.681-690/03.Jesus,-Stand-Among-Us/docs.md
// /home/brian/Code/CSECO/cmsTests/Raneto/content/adventhymnal/tools/files/lyrics/created/SDAH/08.601-695/09.681-690/03.Jesus,-Stand-Among-Us
// /home/brian/Code/CSECO/cmsTests/Raneto/content/adventhymnal/tools/files/lyrics/created/SDAH/08.601-695/09.681-690/03.Jesus,-Stand-Among-Us/docs.md 
    // process.exit();
    // /files/lyrics/created/SDAH/07.501-600/10.591-600/09.Rejoice,-Rejoice,-Believers/docs.md 
    // /files/lyrics/created/SDAH/07.501-600/10.591-600/09.Rejoice,-Rejoice,-Believers/docs.md
  return firstLine;
}


// let tmps = filePaths;
// tmps = tmps.reverse();
// console.log(tmps);process.exit();
let start_ = async () => {
  let promises = filePaths.map(function (path) {
    return readTitle(path)
  })
  console.log('adasld')
  let [err, care] = await to(Promise.all(promises));
  let titles = care;
}

start_();

setTimeout(function(){
//    console.log( haveRefrains)
for(let i in haveRefrains) {
    console.log(haveRefrains[i][0])
    console.log(haveRefrains[i][1])
    process.exit();
}
}, 5000)