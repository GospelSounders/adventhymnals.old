let axios = require('axios'),
    to = require('await-to-js').to,
    util = require('util'),
    exec = util.promisify(require('child_process').exec);
const fs = require('fs-extra');
const path = require('path');

const udp = require('dgram');
// const { resolve } = require('path');
const server = udp.createSocket('udp4');
const client = udp.createSocket('udp4');
const data = Buffer.from('next');

let tensIndices = []
let hundedsIndices = []
let hundredsIndices = []
let allIndices = []
let allTitles = []
let titlesInfo = {}
let poetsInfo = {}
let topicsInfo = {}
let tunesInfo = {}
let composersInfo = {}
let keysInfo = {}
let yearsInfo = {}
let scripturesInfo = {}


let max = 220
let hundredsChaptersPathsObj
let tensChaptersPathsObj

const getPath = (number) => {
    let tensIndex = 0
    let hundredsIndex = 0
    let hundreds = [];
    let i = 0;
    while (i++ < number) {
        if ((i - 1) % 100 === 0) hundredsIndex++
        let maxDiff = max - i > 99 ? 99 : max - i
        hundreds.push([i, i += maxDiff])
    }
    hundreds = hundreds.filter(item => item[0] <= number && number <= item[1])[0]
    let tens = []
    i = hundreds[0] - 1

    while (i++ < hundreds[1]) {
        if ((i - 1) % 10 === 0) {
            tensIndex++
        }
        let maxDiff = max - i > 9 ? 9 : max - i
        tens.push([i, i += maxDiff, tensIndex])
    }
    let numTens = tens.length

    tens = tens.filter(item => item[0] <= number && number <= item[1])[0]
    tensIndex = tens[2]
    tens = tens.slice(0, 2)
    hundreds = hundreds.map(item => { item = item.toString(); while (item.length < 3) item = `0${item}`; return item }).join("-")
    let tensZero = tens[0]
    tens = tens.map(item => { item = item.toString(); while (item.length < 3) item = `0${item}`; return item }).join("-")
    let numberInText = number.toString();
    while (numberInText.length < 2) numberInText = `0${numberInText}`
    tensIndex += 0
    hundredsIndex += 1
    hundredsIndex = hundredsIndex.toString();
    while (hundredsIndex.length < 2) hundredsIndex = `0${hundredsIndex}`
    tensIndex = tensIndex.toString();
    while (tensIndex.length < 2) tensIndex = `0${tensIndex}`
    // hundredsChaptersPathsObj[`${hundredsIndex}.${hundreds}`] = `${hundredsIndex}.${hundreds}`
    hundredsChaptersPathsObj = `${hundredsIndex}.${hundreds}`
    // tensChaptersPathsObj[`${hundredsIndex}.${hundreds}/${tensIndex}.${tens}`] = `${hundredsIndex}.${hundreds}/${tensIndex}.${tens}`
    tensChaptersPathsObj = `${hundredsIndex}.${hundreds}/${tensIndex}.${tens}`
    numTens = (number - tensZero + 1).toString()
    while (numTens.length < 2) numTens = `0${numTens}`
    return `${hundredsIndex}.${hundreds}/${tensIndex}.${tens}/${numTens}`
}

const save10sChapter = async (tens, tensChaptersPathsObj) => {
    let tmpe_ = tensChaptersPathsObj.replace(/[0-9]{2}\./g, '').split("/").slice(-1)[0]
    let innerchapterTxt =
        `---
title: Nyimbo za kristo - ${tmpe_}
metadata:
    description: |
        Nyimbo za kristo - ${tmpe_}
    keywords:  |
        Nyimbo za kristo, adventhymnals, advent hymnals, ${tmpe_}
    author: Brian Onang'o
---

#### Advent Hymnals
## Nyimbo za kristo - ${tmpe_}

# Index of Titles
\# | Title                        
-- |-------------
`
    innerchapterTxt += tens.join("\n")
    fs.ensureDirSync(`nyimbo-za-kristo/${tensChaptersPathsObj}/`)
    fs.writeFileSync(`nyimbo-za-kristo/${tensChaptersPathsObj}/chapter.md`, innerchapterTxt)
}


index = 0;
server.on('message', async function (msg, info) {
    if (index >= max) return
    let file = (++index).toString()
    while (file.length < 3) file = `0${file}`
    let titles = (await exec(`head -3 NZK_own/${file}.txt`)).stdout.split(/\r\n/).filter(item => item.length > 0)
    let number = titles[0].match(/([0-9\(\)]+)/)[1].replace(/^[0]*/g, '').replace("(2)", "a")
    titles = titles.map(item => item.replace(/([0-9\(\)]+)/, '').replace(/^[ ]+\-[ ]+/, '').replace(/^ +/g, '').replace(/^" +/g, '"'))

    let text = fs.readFileSync(`NZK_own/${file}.txt`, "utf-8")
    text = text.split(/\r\n/)
    text = text.slice(-(text.length - 3)).filter(item => !item.match(/[0-9]{3}/))
    text = text.join("\n")
    let lines = text.replace(/[0-9] *\n/g, '<stanza>')
    let hymnText = text
    try{
        (lines.split(/<stanza>/)[1] ||lines).replace(/<stanza>/, '')
    }catch(error){
        console.log(file, index, titles, number, "lines", lines)
    }
    let firstStanza = (lines.split(/<stanza>/)[1] ||lines).replace(/<stanza>/, '')
    let firstLine = firstStanza.split(/\n/)[0]
    let arr = titles;
    if (!arr.includes(firstLine)) {
        arr.push(firstLine)
    }
    let firstStanzaSingleLine = firstStanza.replace(/[\n\r]/g, ' ')

    let firstLineRefrain
    let Refrain_First_Line = firstStanza.replace(/^\n/, '').replace(/\n$/, '').split(/refrain[^\n]*\n/ig)[1]
    if (!Refrain_First_Line) Refrain_First_Line = firstStanza.replace(/^\n/, '').replace(/\n$/, '').split(/chorus:[^\n]*\n/ig)[1]
    if (Refrain_First_Line) Refrain_First_Line = Refrain_First_Line.split(/\n/)[0].replace(/\t/g, '').replace(/[^ -~]+/g, '')
    if (Refrain_First_Line) {
        firstLineRefrain = Refrain_First_Line
    }
    if (firstLineRefrain) {
        if (!arr.includes(firstLineRefrain)) {
            arr.push(firstLineRefrain)
        }
    }
    titlesInfo[number] = { TITLES: arr };
    let title = titles[0]
    // console.log(titlesInfo, title)
    let titleInd = 1
    while (allTitles.includes(title)) title = `${title}_${titleInd++}`
    allTitles.push(title)
    title = title.replace(/  /g, ' ').replace(/\?/g, '')
    titlesInfo[number].TITLES[0] = title


    let tmp = getPath(parseInt(number));
    let saveTitle = title.replace(/ /g, '-')
    let dirPath = 'nyimbo-za-kristo/' + tmp.replace(/[0-9]+$/, '')
    let savePath = 'nyimbo-za-kristo/' + tmp + `.${saveTitle}`
    // console.log(tmp, dirPath, savePath)
    fs.ensureDirSync(dirPath)
    fs.ensureDirSync(savePath)
    savePath = savePath + '/docs.md'
    // console.log(tmp, dirPath, savePath)
    // process.exit()
    title = titles[0]
    let numberInText = file
    let saveText =
        `---
title: |
    ${numberInText}. ${title} - Nyimbo za kristo
metadata:
    description: |
        Nyimbo za kristo ${file}. ${title}. ${firstStanzaSingleLine}
    keywords:  |
        Nyimbo za kristo, adventhymnals, advent hymnals, ${title}, ${firstLine}. ${firstLineRefrain ? firstLineRefrain : ''}
    author: Brian Onang'o
---

#### Advent Hymnals
## ${numberInText}. ${title.toUpperCase()}
####  Nyimbo za kristo,

\`\`\`txt
${hymnText}
\`\`\`

- |   -  |
-------------|------------|
Title | ${title} |
Key |  |
Titles | ${firstLineRefrain} |
First Line | ${firstLine} |
Author | 
Year | 
Composer| |
Hymnal|  - |
Tune|  |
Metrical pattern | |
# Stanzas |  |
Chorus |  |
Chorus Type |  |
Subjects | |
Texts |  |
Print Texts | 
Scripture Song |  |
    
`
    fs.writeFileSync(`${savePath}`, saveText);
    client.send(data, 2222, 'localhost', function (error) { });
    let urlPath = '/nyimbo-za-kristo/' + dirPath.replace(/[0-9]+\./g, '')
    tensIndices.push(`${file}|[${title}](${urlPath}${saveTitle})`)
    hundedsIndices.push(`${file}|[${title}](${urlPath}${saveTitle})`)
    allIndices.push(`${file}|[${title}](${urlPath}${saveTitle})`)
    // console.log(file)
    // if(parseInt(file) % 10 === 0){
    //     console.log(tensIndices)
    //     process.exit()
    // }
    if (parseInt(file) % 10 === 0) {
        await save10sChapter(tensIndices, tensChaptersPathsObj)
        tensIndices = []
    }
    if (parseInt(file) % 100 === 0) {
        await save10sChapter(hundedsIndices, hundredsChaptersPathsObj)
        hundedsIndices = []
    }

    if (parseInt(file) === max) {
        fs.ensureDirSync("NZKInfo")
        fs.writeFileSync(`NZKInfo/titles.json`, JSON.stringify(titlesInfo))
        fs.writeFileSync(`NZKInfo/poets.json`, JSON.stringify(poetsInfo))
        fs.writeFileSync(`NZKInfo/topics.json`, JSON.stringify(topicsInfo)) // several
        fs.writeFileSync(`NZKInfo/tunes.json`, JSON.stringify(tunesInfo))
        fs.writeFileSync(`NZKInfo/composers.json`, JSON.stringify(composersInfo))
        fs.writeFileSync(`NZKInfo/keys.json`, JSON.stringify(keysInfo))
        fs.writeFileSync(`NZKInfo/years.json`, JSON.stringify(yearsInfo))
        fs.writeFileSync(`NZKInfo/scriptures.json`, JSON.stringify(scripturesInfo))
        await save10sChapter(tensIndices, tensChaptersPathsObj)
        await save10sChapter(hundedsIndices, hundredsChaptersPathsObj)

        let indexContent =
            `---
title: Index of Titles - Church Hymnal 1941
metadata:
    description: |
        Church Hymnal 1941 - Index of Titles
    keywords: |
        Church Hymnal 1941, adventhymnals, advent hymnals, index
    author: Brian Onang'o
---

#### Advent Hymnals

## Church Hymnal 1941

# Index of Titles
\# | Title                        
-- |-------------
`
        indexContent += allIndices.join("\n")
        fs.ensureDirSync("nyimbo-za-kristo/01.indices")
        fs.writeFileSync(`nyimbo-za-kristo/01.indices/chapter.md`, indexContent)
    }
    // 
    // if (++index > max) {
    //     console.log(missingNos)
    //     process.exit()
    // }
    // let interval = 400;
    // if ((index - 1) % interval == 0) {
    //     let arr = []
    //     let newInd = index
    //     // console.log(newInd + interval)
    //     // let endAt = 
    //     while (newInd <= ((index + interval) <= max ? (index + interval) : max)) arr.push(newInd++)
    //     let promises = arr.map(loadHymn)
    //     await to(Promise.all(promises))
    //     console.log("passed")
    // }
    // // console.log(index);
    // // process.exit()
    // try {
    //     let header = headers[index];
    //     if (!header) throw "missing " + index
    //     return workOnSingleFile(header);
    // } catch (error) {
    //     console.log(error)
    //     missingNos.push(index)
    //     client.send(data, 2222, 'localhost', function (error) { });
    // }
});
server.on('listening', function () {
    var address = server.address();
    var port = address.port;
    var family = address.family;
    var ipaddr = address.address;
    console.log('Server is listening at port' + port);
    console.log('Server ip :' + ipaddr);
    console.log('Server is IP4/IP6 : ' + family);
    client.send(data, 2222, 'localhost', function (error) { });
});
server.bind(2222);