let axios = require('axios'),
    to = require('await-to-js').to,
    util = require('util'),
    exec = util.promisify(require('child_process').exec);
const fs = require('fs-extra');
const path = require('path');
const events = new (require("events").EventEmitter)

const udp = require('dgram');
const console = require('console');
// const { resolve } = require('path');
const server = udp.createSocket('udp4');
const client = udp.createSocket('udp4');
const data = Buffer.from('next');

let headers = {}
let tensIndices = []
let hundedsIndices = []
let allIndices = []
let allKeys = []
let allTitles = []
let allComposers = []
let allYears = []
let allTopics = []
let titlesInfo = {}
let poetsInfo = {}
let topicsInfo = {}
let tunesInfo = {}
let composersInfo = {}
let keysInfo = {}
let yearsInfo = {}
let scripturesInfo = {}


let max = 949

let hundredsChaptersPathsObj = {}
let tensChaptersPathsObj = {}

const getPath = (number) => {
    let tensIndex = 0
    let hundredsIndex = 0
    let hundreds = [];
    let i = 0;
    while (i++ < number) {
        if ((i - 1) % 100 === 0) hundredsIndex++
        let maxDiff = 949 - i > 99 ? 99 : 949 - i
        hundreds.push([i, i += maxDiff])
    }
    hundreds = hundreds.filter(item => item[0] <= number && number <= item[1])[0]
    let tens = []
    i = hundreds[0] - 1

    while (i++ < hundreds[1]) {
        if ((i - 1) % 10 === 0) {
            tensIndex++
        }
        let maxDiff = 949 - i > 9 ? 9 : 949 - i
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
title: Christ in Song - ${tmpe_}
metadata:
    description: |
        Christ in Song - ${tmpe_}
    keywords:  |
        Christ in Song, adventhymnals, advent hymnals, ${tmpe_}
    author: Brian Onang'o
---
#### Advent Hymnals
## Christ in Song - ${tmpe_}
# Index of Titles
\# | Title                        
-- |-------------
`
    innerchapterTxt += tens.join("\n")
    fs.writeFileSync(`CIS/${tensChaptersPathsObj}/chapter.md`, innerchapterTxt)
}

let loadedHymns = {}

const loadHymn = async (number) => {
    return new Promise(async (resolve, reject) => {
        // let numberInText = number.toString()
        // console.log(numberInText)
        // while (numberInText.length < 3) numberInText = `0${numberInText}`
        try {
            let link = number.link
            // console.log(`https://raw.githubusercontent.com/GospelSounders/adventhymnals.old/master/tools/files/lyrics/CiS1908/${numberInText}.txt`)
            console.log(`https://m.egwwritings.org${link}`)
            let hymnText = (await to(axios.get(`https://m.egwwritings.org${link}`)))[1].data;
            // fs.ensureDirSync('MH')
            console.log(`MH/${number.number}`, hymnText, path.join(__dirname, `MH/${number.number}`))
            fs.writeFileSync(path.join(__dirname, `MH/${number.number}`), hymnText)
            loadedHymns[number.number] = hymnText
        } catch (error) { }
        resolve()
    })
}

const workOnSingleFile = async (header) => {
    if (!header) return
    let title = header["Title"];
    let poet = header["Author"] || '';
    let firstLine = header["First Line"] || ''; // check, get the firstLine
    let firstLineRefrain = header["Refrain First Line"] || '';
    let topic = header["Topic"] || '';
    let tune = header["Tune"] || '';
    let composer = header["Composer"] || '';
    let key = header["Key"] || '';
    let number = header["hymnNumber"] || '';
    let year = header["Publication Date"] || '';
    let scripture = header["Scripture"] || '';
    number = parseInt(number)
    let numberInText = number.toString();
    if (!title) title = firstLine

    let titleInd = 1
    while (allTitles.includes(title)) title = `${title}_${titleInd++}`
    allTitles.push(title)


    poetsInfo[numberInText] = poet
    topicsInfo[numberInText] = topic
    tunesInfo[numberInText] = tune
    composersInfo[numberInText] = composer
    keysInfo[numberInText] = key
    yearsInfo[numberInText] = year
    scripturesInfo[numberInText] = scripture

    while (numberInText.length < 3) numberInText = `0${numberInText}`
    let path_ = getPath(number)
    let dirPath = path_.replace(/\/[0-9]*$/, '')
    fs.ensureDirSync(`CIS/${dirPath}`)
    let hymnText;
    let firstStanzaSingleLine = ''
    try {
        // console.log(`https://raw.githubusercontent.com/GospelSounders/adventhymnals.old/master/tools/files/lyrics/CiS1908/${numberInText}.txt`)

        // hymnText = (await to(axios.get(`https://raw.githubusercontent.com/GospelSounders/adventhymnals.old/master/tools/files/lyrics/CiS1908/${numberInText}.txt`)))[1].data
        hymnText = loadedHymns[numberInText]
        delete loadedHymns[numberInText]
        if (!hymnText) {
            console.log(numberInText)
        }
        let hymnTextTmp = hymnText
        hymnText = hymnText.replace(/^[0-9]{3}[^\n]*/g, '')
        hymnText = hymnText.split(/\n/)
        if (!hymnText[0]) {
            // console.log(hymnTextTmp)
        }
        let tmpTmp = [...hymnText]
        try {
            while (tmpTmp[0].length === 0) tmpTmp.shift()
        } catch (error) {
            console.log(hymnTextTmp)
        }
        while (hymnText[0].length === 0) hymnText.shift()
        hymnText = hymnText.join("\n")

        let lines = hymnText.split("\n")
        lines = lines.map(line => line.replace(/[0-9]\./, '<stanza>'))
        lines = lines.filter(line => line.replace(/[0-9]\./, '').replace(/ /g, '').length > 0)
        lines = lines.join("\n")
        let stanzas, firstStanza
        stanzas = lines.split("<stanza>")

        // console.log(stanzas)
        let stanzaConsidered = stanzas[1]
        if (!stanzaConsidered) stanzaConsidered = stanzas[0]

        try {
            stanzaConsidered.replace(/^\n/, '').replace(/\n$/, '').split(/refrain/ig)[0]
        } catch (error) {
            console.log(number)
            console.log(stanzas)
            console.log(stanzaConsidered)
        }
        firstStanza = stanzaConsidered.replace(/^\n/, '').replace(/\n$/, '').split(/refrain/ig)[0]
        firstStanzaSingleLine = firstStanza.replace(/\n/g, ' ')
        First_Line = stanzaConsidered.replace(/^\n/, '').replace(/\n$/, '').split('\n')[0]
        Refrain_First_Line = stanzaConsidered.replace(/^\n/, '').replace(/\n$/, '').split(/refrain[^\n]*\n/ig)[1]
        if (!Refrain_First_Line) Refrain_First_Line = stanzaConsidered.replace(/^\n/, '').replace(/\n$/, '').split(/chorus:[^\n]*\n/ig)[1]
        if (Refrain_First_Line) Refrain_First_Line = Refrain_First_Line.split(/\n/)[0].replace(/\t/g, '').replace(/[^ -~]+/g, '')
        if (Refrain_First_Line) {
            firstLineRefrain = Refrain_First_Line
        }else {
            try{
                firstLineRefrain = firstLineRefrain.replace(/\t/g, '').replace(/[^ -~]+/g, '')
            }catch(error){}
        }

        if (number === 241) {
            console.log(stanzas)
            // console.log(stanzaConsidered)
            fs.writeFileSync("/tmp/tmp.txt", Refrain_First_Line)
            console.log(Refrain_First_Line)
            // process.exit()
        }
        let arr = [title];
        title !== firstLine ? arr.push(firstLine) : false;
        firstLineRefrain ? arr.push(firstLineRefrain.split(/\n/)[0]) : false;
        titlesInfo[number] = { TITLES: arr };

    } catch (err) {
        console.log(err)
    }
    // console.log(hymnText, numberInText, `firstStanzaSingleLine`, firstStanzaSingleLine, title)
    // let saveTitle = title.replace(/[^,`'"\-0-9a-zA-Z\_ ]/g, '').replace(/  /g, ' ').replace(/ /g, '-')
    let saveTitle = title.replace(/  /g, ' ').replace(/ /g, '-').replace(/\?/g, '')
    if(number === 5){
        console.log(title)
        console.log(saveTitle)
        // process.exit()
    }
    if (number === 545) console.log({ saveTitle, title })
    let saveDirPath = `CIS/${path_}.${saveTitle}`
    fs.ensureDirSync(saveDirPath)
    let urlPath = '/christ-in-song/' + saveDirPath.replace(/[0-9]+\./g, '')
    // console.log(saveDirPath, urlPath)
    tensIndices.push(`${numberInText}|[${title}](${urlPath})`)
    hundedsIndices.push(`${numberInText}|[${title}](${urlPath})`)
    allIndices.push(`${numberInText}|[${title}](${urlPath})`)
    if (number % 10 === 0) {
        await save10sChapter(tensIndices, tensChaptersPathsObj)
        tensIndices = []
    }
    if (number % 100 === 0) {
        await save10sChapter(hundedsIndices, hundredsChaptersPathsObj)
        hundedsIndices = []
    }
    if (number === 949) {
        fs.ensureDirSync("CISnfo")
        fs.writeFileSync(`CISnfo/titles.json`, JSON.stringify(titlesInfo))
        fs.writeFileSync(`CISnfo/poets.json`, JSON.stringify(poetsInfo))
        fs.writeFileSync(`CISnfo/topics.json`, JSON.stringify(topicsInfo)) // several
        fs.writeFileSync(`CISnfo/tunes.json`, JSON.stringify(tunesInfo))
        fs.writeFileSync(`CISnfo/composers.json`, JSON.stringify(composersInfo))
        fs.writeFileSync(`CISnfo/keys.json`, JSON.stringify(keysInfo))
        fs.writeFileSync(`CISnfo/years.json`, JSON.stringify(yearsInfo))
        fs.writeFileSync(`CISnfo/scriptures.json`, JSON.stringify(scripturesInfo))
        await save10sChapter(tensIndices, tensChaptersPathsObj)
        await save10sChapter(hundedsIndices, hundredsChaptersPathsObj)

        let indexContent =
            `---
title: Index of Titles - Christ in Song
metadata:
    description: |
        Christ in Song - Index of Titles
    keywords: |
        Christ in Song, adventhymnals, advent hymnals, index
    author: Brian Onang'o
---
#### Advent Hymnals
## Christ in Song
# Index of Titles
\# | Title                        
-- |-------------
`
        indexContent += allIndices.join("\n")
        fs.ensureDirSync("CIS/01.indices")
        fs.writeFileSync(`CIS/01.indices/chapter.md`, indexContent)
    }
    let saveText =
        `---
title: |
    ${numberInText}. ${title} - Christ in Song
metadata:
    description: |
        Christ in Song ${numberInText}. ${title}. ${firstStanzaSingleLine}
    keywords:  |
        Christ in Song, adventhymnals, advent hymnals, ${title}, ${firstLine}. ${firstLineRefrain ? firstLineRefrain : ''}
    author: Brian Onang'o
---
#### Advent Hymnals
## ${numberInText}. ${title.toUpperCase()}
####  Christ in Song,
\`\`\`txt
${hymnText}
\`\`\`
- |   -  |
-------------|------------|
Title | ${title} |
Key | ${key} |
Titles | ${firstLineRefrain} |
First Line | ${firstLine} |
Author | ${poet}
Year | ${year}
Composer| ${composer} |
Hymnal|  - |
Tune| ${tune} |
Metrical pattern | |
# Stanzas |  |
Chorus |  |
Chorus Type |  |
Subjects | ${topic} |
Texts | ${scripture} |
Print Texts | 
Scripture Song |  |
    
`
    // hundredsChaptersPathsObj
    //tensChaptersPathsObj
    if (number === 545) console.log({ dirPath, saveDirPath })
    try {
        fs.writeFileSync(`${saveDirPath}/docs.md`, saveText)
    } catch (error) {
        console.log(error)
    }
    // events.emit("next")
    client.send(data, 2222, 'localhost', function (error) {
    });
}
let missingNos = []
const main = async () => {
    let headers_ = fs.readFileSync("MH1843part1.html", "utf-8").split(/\n/).filter(item => item.length > 0);//.map(item => JSON.parse(item))
   
    max = headers_.length
    let start = 0;
    headers_.map(item => {
        item = item.split(/,,/)
        headers[start++] = {
            number: start,
            link: item[0],
            Title: item[1],
        }
    });
    console.log(headers)
    let numbers = [];
    let index = 0
    while (++index <= max) numbers.push(index)
    index = 0;
    
    // events.on("next", () => {
    //     if (++index > 949) {
    //         process.exit()
    //     }
    //     let header = headers[index]; return workOnSingleFile(header);
    // })
    server.on('message', async function (msg, info) {
        if (++index > max) {
            console.log(missingNos)
            process.exit()
        }
        let interval = 50;
        if ((index - 1) % interval == 0) {
            let arr = []
            let newInd = index
            while (newInd <= ((index + interval) <= max ? (index + interval) : max)) arr.push(newInd++)
            // let promises = arr.map((x)=>console.log(headers[x-1], max, x))
            let promises = arr.map((x)=>loadHymn(headers[x-1]))
            // await to(Promise.all(promises))
            console.log("passed")
        }
        // console.log(index);
        // process.exit()
        try {
            console.log(index)
            let header = headers[index-1];
            console.log(header, headers[0])
            if (!header) throw "missing " + index
            // return workOnSingleFile(header);
        } catch (error) {
            // console.log(error)
            // missingNos.push(index)
            client.send(data, 2222, 'localhost', function (error) { });
        }
        // let header = headers[index]; return workOnSingleFile(header);
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

}

main()