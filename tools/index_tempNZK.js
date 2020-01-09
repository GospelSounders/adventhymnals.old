let axios = require('axios'),
to = require('await-to-js').to,
util = require('util'),
exec = util.promisify(require('child_process').exec);
const fs = require('fs-extra');
const matchAll = require("match-all");
const path = require("path");

let SDAHContents = fs.readFileSync(path.join(__dirname, "SDAHsongs.txt"), 'utf-8')
SDAHContents = JSON.parse(SDAHContents).songs
// console.log(SDAHContents)

let toSave = '';
for(let i in SDAHContents) {
    let tmp = {};
    let song = SDAHContents[i]
    for(let j in song) {
        let j_ = j;
        if(j === 'id')j_ = "hymnNumber"
        if(j === 'title')j_ = "Title"
        if(j === 'author')j_ = "Author"
        if(j === 'key')j_ = "Key"
        if(j !== 'stanzas' && j !== 'choruses' && parseInt(song.id) <= 695){
            tmp[j_] = song[j]
        }
    }
    if(Object.keys(tmp).length){
    // if(parseInt(song.id) <= 695){
    toSave += `${JSON.stringify(tmp)}\n`
    // console.log(tmp)
    // console.log(song.id)
    }
    // console.log(tmp)
    // process.exit();
}

// console.log(toSave)
fs.writeFileSync(path.join(__dirname, "SDAHHeader.txt"), toSave)

// {"First Line":"What shall I do with Jesus?","
// Title":"Christ or Barabbas?",
// "Author":"F. E. B.",
// "Refrain First Line":"This is the question now",
// "Publication Date":"1908",
// "Scripture":"Matthew 27:21-22",
// "Topic":"Invitation and Repentance; Invitation and Repentance: Decision Day; Special Selections: Solos",
// "Tune":"What shall I do with Jesus?",
// "Composer":"F. E. Belden",
// "Key":"C Major",
// "hymnNumber":1}
