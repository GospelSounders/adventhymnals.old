"use strict";
const axios = require('axios'),
  to = require('await-to-js').to,
  util = require('util'),
  exec = util.promisify(require('child_process').exec);
const fs = require('fs-extra');
const path = require('path');
const hyphenopoly = require("hyphenopoly");
const nthline = require('nthline');
const prompts = require('prompts');


require = require('esm')(module /*, options*/ );
// import {Midi} from './Midi'
const Midi = require('./Midi')
const {
  convertArrayToCSV
} = require('convert-array-to-csv');

const hyphenator = hyphenopoly.config({
  "require": ["de", "en-us"],
  "hyphen": "-",
  "exceptions": {
    "en-us": "en-han-ces"
  }
});


const midiDir = path.join(__dirname, "../../", "files", "midi", "ChurchHymnalMID");

let hymnalPaths = {
  "Hpaths": "CHpaths.txt",
  midiDir,
  unequalStanzaSyllables: "CHunequalStanzaSyllables.txt",
  doneMidi: "CHDoneMidi.txt"
}

let dictionary = ''

async function hyphenate_en(text) {
  const hyphenateText = await hyphenator.get("en-us");
  return hyphenateText(text)
}

async function hyphenate_de(text) {
  const hyphenateText = await hyphenator.get("de");
  console.log(hyphenateText(text));
}

// hyphenate_en("hyphenation enhances justification.");



let hasRefrainF = (content) => {
  let patt = /\nRefrain.*/s;
  let chorus = patt.exec(content)
  if (!chorus) return false;
  return true;
}

// let readLine = async (lineNumber, path) => {
//   return new Promise((resolve, reject) => {

//     try {
//       nthline(lineNumber, path)
//         .then(line => resolve(line))
//     } catch (err) {
//       resolve('')
//     }
//   })
// }

let getSongNumber = async (content) => {
  let patt = /##(.*)/
  let numberLine = content.match(patt)[1].split(".")[0]
  return numberLine
}

let isInDictionary = (word) => {
  let re = new RegExp(`\n${word}`, 'g');
  return dictionary.match(re)
}

let hypernatefromDictionary = async (text) => {
  //   console.log(text)
  //   console.log('---------------')
  let words = text.split(' ')
  let tmpLen = words.length;
  let ret = '';
  let j = 0;
  while (j < tmpLen) {
    let word = words[j++];

    let re = new RegExp(`\n${word},(.*)`, 'g');
    let tmp = dictionary.match(re)
    try {
      tmp = tmp[0].replace(`\n${word},`, '')
      ret = `${ret}${tmp} `
    } catch (x) {}

  }
  return ret
}
let countSyllables = async (text) => {
  text = text.split('-').join(' ')
  while (text.split('  ').length > 1) {
    text = text.split('  ').join(' ')
  }
  let count = 0;
  let tmp = text.split(' ');
  let tmpLen = tmp.length;
  let i = 0;
  while (i < tmpLen) {
    // console.log(`${i}:${tmp[i]}`)
    //   if(parseInt(tmp[i][0]));
    //   else count++;
    if (tmp[i] !== '');
    count++
    i++;
  }

  return count;
}



let getStanzas = async (content) => {
  // content = content.replace(/\r\n/, '\n')
  // content = content.replace(/\r/, '\n')
  let stanzas = content.split('```txt')[1].split('```')[0].split('\n\n');
  let stanzas_1 = content.split('```txt')[1].split('```')[0].split('\r\n\r\n');
  if (stanzas_1.length > stanzas.length) stanzas = stanzas_1

  //   console.log(stanzas)
  //   console.log(stanzas_1)
  //   process.exit()
  //   let stanzas = content.replace('\r\n\r\n', '\n\n').split('```txt')[1].split('```')[0].split('\n\n');
  //   stanzas = stanzas.join('  ')
  //   stanzas = stanzas.split('\r\r')

  let hyhenatedStanzas = [];
  let numSyllables = [];

  let numStanzas = stanzas.length;
  let i = 0;
  //   console.log(numStanzas)
  while (i < numStanzas) {
    //   console.log(stanzas[i])
    stanzas[i] = stanzas[i].replace(/\n/, '')
    stanzas[i] = stanzas[i].split('\n').join(' ')
    stanzas[i] = stanzas[i].split('\r').join(' ')
    stanzas[i] = stanzas[i].replace(/^[\d]\./, '')
    stanzas[i] = stanzas[i].replace(/^[\s]/, '')

    //remove double spaces
    let tmp = stanzas[i].split('  ').join(' ')
    while (tmp.split('  ').length > 1) {
      tmp = tmp.split('  ').join(' ')
    }
    tmp = tmp.replace(/^[\d]\./, '')
    tmp = tmp.split(' ');
    let tmpLen = tmp.length;
    let j = 0;
    while (j < tmpLen) {
      let word = tmp[j++];
      if (!isInDictionary(word)) {
        let syllables = await hyphenate_en(word);
        const response = await prompts({
          type: 'text',
          name: 'ans',
          message: `${syllables || word}?`,
          initial: 'y'
        });
        if (response.ans !== 'y')
          syllables = response.ans
        let dictionaryLine = `${word},${syllables}`
        dictionary = `${dictionary}\n${dictionaryLine}`;
        fs.writeFileSync('syllabledictionary.txt', dictionary);
        dictionary = fs.readFileSync('syllabledictionary.txt', 'utf-8');
        console.log(dictionaryLine)
      }

    }


    // console.log(stanzas[i])


    // try{
    let hyphenated = await hypernatefromDictionary(tmp.join(' '));
    hyhenatedStanzas[i] = hyphenated;

    // count number of syllables in each stanza and report error if they are not equall
    numSyllables[i] = await countSyllables(hyphenated);

    i++;
  }


  return [stanzas, hyhenatedStanzas, numSyllables];
}


let numberOfNotesfromTracks = (tracks) => {
  let numTracks = tracks.length;
  let numTrackNotessArr = []
  let i = 0;
  while (i < numTracks) {
    if (tracks[i].notes)
      if (tracks[i].notes.length > 0)
        numTrackNotessArr.push(tracks[i].notes.length)
    i++;
  }
  return numTrackNotessArr
}

let trackswithNotes = (tracks) => {
  let ret = [];
  let numTracks = tracks.length;
  let i = 0;
  while (i < numTracks) {
    if (tracks[i].notes)
      if (tracks[i].notes.length > 0)
        ret.push(tracks[i].notes)
    i++;
  }
  return ret;
}


let mostNumberofNotesforTrack = (arrs) => {
  let i = 0;
  let most = 0;
  while (i < arrs.length) {
    if (most === 0)
      if (arrs[i].length > most) most = arrs[i].length
    else;
    else if (arrs[i].length > most) most = arrs[i].length
    i++
  }
  return most;
}
let leastNumberofNotesforTrack = (arrs) => {
  let i = 0;
  let least = 0;
  while (i < arrs.length) {
    if (least === 0)
      if (arrs[i].length > least) least = arrs[i].length
    else;
    else if (arrs[i].length < least) least = arrs[i].length
    i++
  }
  return least;
}

let greatestInArr = (arrs) => {
  let i = 0;
  let most = 0;
  while (i < arrs.length) {
    if (most === 0)
      if (arrs[i] > most) most = arrs[i]
    else;
    else if (arrs[i] > most) most = arrs[i]
    i++
  }
  return most;
}

let hasTie = (indices, tracks) => {
  console.log(indices)
  let durations = tracks.map((x, j) => {
    return parseFloat(x[indices[j]].quarterNotes)
  });
  console.log("CHECKING TIE...");
  console.log(durations)
  console.log(indices)
  let greatestTime = greatestInArr(durations)
  let greatestIndex = durations.indexOf(greatestTime)
  let addedNoteIndices = [0, 0, 0, 0]
  let indices_ = indices;
  for (let i in indices_) {
    let ii = indices_[i]
    let duration = durations[i]
    if (i !== greatestIndex) {
      while (duration < durations[greatestIndex]) {
        duration += parseFloat(tracks[i][++ii].quarterNotes)
      }
      addedNoteIndices[i] = ii - indices_[i]
      if (duration !== durations[greatestIndex]) return false
    }
  }
  return addedNoteIndices

}

let getSyllablesfromText = (txt) => {
  txt = txt.split('-').join('- ')
  while (txt.split('  ').length > 1) {
    txt = txt.split('  ').join(' ')
  }
  txt = txt.replace(/^[\d]\./, '')
  txt = txt.replace(/^[\s]/, '')
  txt = txt.split(' ')
  return txt;
}

let getNumberfromNote = (note) => {
  note = note.toLowerCase();

  let higherOctaves = (note.match(/'/g) || []).length
  let lowerOctaves = (note.match(/,/g) || []).length
  // console.log(higherOctaves)
  // console.log(lowerOctaves)
  note = note.split(',').join('')
  note = note.split("'").join('')
  let knownNote = ['c', 60];
  let noteSequence = ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B']
  let noteSequence_ = [];
  for (let i in noteSequence) {
    let tmp = noteSequence[i].replace('#', 'is').replace(/b/, 'es').toLowerCase();
    noteSequence_.push(tmp)
  }
  //   console.log(note)
  //   console.log(noteSequence_)
  let index = noteSequence_.indexOf(note)
  if (index === -1) {
    throw `unknown note ${note}`
  }
  let number = 60 + index + (higherOctaves * 12) - lowerOctaves * 12;
  return number;
}

let processTxtFile = async (path_) => {
  let fileContents = fs.readFileSync(path_, 'utf-8');
  let hasRefrain = hasRefrainF(fileContents)
  /*
   * songs without refrainFirst
   */
  if (!hasRefrain) {
    console.log(path_)
    let songNumber = await getSongNumber(fileContents)
    songNumber = parseInt(songNumber).toString();
    if (songNumber.length < 2) songNumber = '0' + songNumber
    if (songNumber.length < 3) songNumber = '0' + songNumber
    let midiFileName = 'C' + songNumber + '.mid';
    let midiFilePath = path.join(hymnalPaths.midiDir, midiFileName);


    let stanzasTmp = await getStanzas(fileContents);
    let stanzas = stanzasTmp[0]
    let stanzasHyphenated = stanzasTmp[1]
    let stanzasSyllables = stanzasTmp[2]
    let numStanzas = stanzas.length;
    let i = 0;
    // let j = 200;
    let tmp_ = [
      [],
      [],
      []
    ]
    while (i < numStanzas) {
      if (stanzasSyllables[i] === 1) {} else {
        tmp_[0].push(`${tmp_[2].length+1}. ${stanzas[i]}`)
        tmp_[1].push(stanzasSyllables[i])
        tmp_[2].push(`${tmp_[2].length+1}. ${stanzasHyphenated[i]}`)
      }
      i++;
    }
    stanzas = JSON.parse(JSON.stringify(tmp_[0]))
    stanzasSyllables = JSON.parse(JSON.stringify(tmp_[1]))
    stanzasHyphenated = JSON.parse(JSON.stringify(tmp_[2]))
    let allStanzashaveSameNumSyllables = stanzasSyllables.every((val, i, arr) => val === arr[0])
    if (!allStanzashaveSameNumSyllables) {
      // save wrong syllables errors
      let unequalStanzaSyllables = fs.readFileSync(hymnalPaths.unequalStanzaSyllables, 'utf-8')
      unequalStanzaSyllables = `${unequalStanzaSyllables}\n${songNumber}`
      fs.writeFileSync(hymnalPaths.unequalStanzaSyllables, unequalStanzaSyllables)
    }
    // console.log(stanzas)
    // console.log(stanzasHyphenated)
    // console.log(stanzasSyllables)
    // console.log(allStanzashaveSameNumSyllables)

    // read midiFile
    try {
      let fileBlob = fs.readFileSync(midiFilePath)
      let decoded = Midi.decode(fileBlob)
      // console.log(decoded)
      let numberOfNotesfromTracks_ = numberOfNotesfromTracks(decoded.tracks)
      let trackswithNotes_ = trackswithNotes(decoded.tracks)
      //   console.log(trackswithNotes_)

      //   let mostNumberofNotesforTrack_ = mostNumberofNotesforTrack(trackswithNotes_)
      //   console.log(mostNumberofNotesforTrack_);process.exit();
      let i = 0;
      let currentsNotes = [];
      let AllNotes = [];

      let ppq = decoded.header.PPQ;
      let bpm = decoded.header.bpm;
      //   console.log(decoded.gsMusicObject)
      //   console.log(decoded.header)
      //   let durations = [0,0,0,0];
      let voices_i = [0, 0, 0, 0];
      let voicesNotes = [
        [],
        [],
        [],
        []
      ];
      let voicesDuration = [0, 0, 0, 0];


      // add quaterNotes
      trackswithNotes_ = trackswithNotes_.map((track, j) => {
        track = track.map((note, j) => {
          let duration = note.duration;
          let pulses = (duration / (60 / bpm)) * ppq
          let quarterNotes = pulses / ppq;
          note.quarterNotes = quarterNotes.toFixed(3);
          return note
        })
        return track
      })

      let voicesTotalTime = [0, 0, 0, 0];
      for (let trackNumber in trackswithNotes_) {
        for (let j in trackswithNotes_[trackNumber]) voicesTotalTime[trackNumber] += parseFloat(trackswithNotes_[trackNumber][j].quarterNotes)
      }
      let voicesAtPar = voicesTotalTime.every((val, j, arr) => val === voicesTotalTime[0])

      let getSyllablesForTiedNotes = () => {
        let voicesNotes = [
          [],
          [],
          [],
          []
        ]
        let mostNumberofNotesforTrack_ = leastNumberofNotesforTrack(trackswithNotes_)
        while (i < mostNumberofNotesforTrack_ /* 37 */ ) { // note by note
          //   currentsNotes = trackswithNotes_.map((x, j) => {
          //     let index = voices_i[j]

          //     // console.log(index)
          //     console.log(`${i}:${mostNumberofNotesforTrack_}:${j}:${voices_i[j].length}`)
          //     let duration = x[index].duration;
          //     let pulses = (duration / (60 / bpm)) * ppq
          //     let quarterNotes = pulses / ppq;
          //     x[index].quarterNotes = quarterNotes.toFixed(3);
          //     return x[index];

          //   })
          currentsNotes = trackswithNotes_;
          for (let k in currentsNotes) {
            voicesDuration[k] += parseFloat(currentsNotes[k].quarterNotes)
          }

          let greatestTime = greatestInArr(voicesDuration)
          let voicesAtPar = voicesDuration.every((val, j, arr) => val === greatestTime)
          if (currentsNotes.length === 4) {

          } else {}
          if (voicesAtPar) {
            for (let k in voices_i) {
              voices_i[k]++;
              voicesNotes[k].push(currentsNotes[k])
            }
          } else {
            let hasTie_ = hasTie(voices_i, trackswithNotes_);
            if (hasTie_) {
              //   console.log(hasTie_)
              let currentNotes_1 = [];
              // save longest note
              let durations = trackswithNotes_.map((x, j) => {
                return parseFloat(x[voices_i[j]].quarterNotes)
              });
              let greatestTime = greatestInArr(durations)
              let greatestIndex = durations.indexOf(greatestTime)
              // console.log(voicesDuration) // duration has already been added. so add longest Notes...
              let greatestDuration = greatestInArr(voicesDuration)
              for (let tracksIndex in voicesDuration) {
                let voiceDuration = voicesDuration[tracksIndex]
                if (voiceDuration === greatestDuration) {
                  voicesNotes[tracksIndex].push(trackswithNotes_[tracksIndex][voices_i[tracksIndex]])
                  voices_i[tracksIndex]++ // increase by one the index of the track with the longest note...
                } else {
                  let indicestoIncreaseBy = 0;
                  let notegroup = [];
                  // console.log(hasTie_[tracksIndex])
                  while (indicestoIncreaseBy <= hasTie_[tracksIndex]) {
                    if (indicestoIncreaseBy > 0) {
                      voicesDuration[tracksIndex] += parseFloat(trackswithNotes_[tracksIndex][voices_i[tracksIndex]].quarterNotes)
                    }
                    notegroup.push(trackswithNotes_[tracksIndex][voices_i[tracksIndex]])
                    voices_i[tracksIndex]++
                    indicestoIncreaseBy++
                  }
                  voicesNotes[tracksIndex].push(notegroup)
                }
              }

            } else {
              return voicesNotes
            }
          }
        }
      }


      if (!voicesAtPar) {
        // for each lesser track, check for missing notes and insert...
        let greatestTime = greatestInArr(voicesAtPar)
        console.log(greatestTime)
        let trackNumber = 0;
        while (trackNumber < trackswithNotes_.length) {
          // for (let trackNumber in trackswithNotes_) {

          if (voicesTotalTime[trackNumber] === greatestTime) continue;
          let track = trackswithNotes_[trackNumber];
          let index = 0;
          let cummulativeTime = 0;
          let i = 0;
          while (i < track.length) {
            // for (let i in track) { // single track

            //   console.log(track.length)
            //   console.log(track[0])
            //   console.log(track[1])
            //   console.log(0)
            console.log('------------->520')
            console.log(`ct:${cummulativeTime}<<<<<>>>>>>>>>${track[i].time}:t.t`)
            if (track[i].time !== cummulativeTime) {
              console.log('------------->521')
              // console.log()
              let timeDiff = track[i].time - cummulativeTime;
              let duration = timeDiff;
              let pulses = (duration / (60 / bpm)) * ppq
              let quarterNotes = pulses / ppq;
              let noteSyllableGroups = getSyllablesForTiedNotes();
              let txtSyllableGroups = getSyllablesfromText(stanzasHyphenated[0]);
              console.log('==================>')
              let txt = ''
              let index = 0;
              for (let i in noteSyllableGroups[0]) {
                // console.log(`${i}:${txtSyllableGroups[i]}`)
                txt += `${txtSyllableGroups[i]} `
                index++;
              }
              txt += `${txtSyllableGroups[index]} `
              console.log(txt)
              console.log(`There is a problem at the last syllable (${txtSyllableGroups[index]}) for track ${trackNumber}`);
              console.log(`missing notes of ${timeDiff} (${quarterNotes} quarterNotes) at ${i} as t:t${track[i].time}:<<<<<>>>>>>>>>${cummulativeTime}:ct`)
              let response = await prompts({
                type: 'text',
                name: 'ans',
                message: `How many notes to insert? (a rest will be inserted by default)`,
                initial: 'rest'
              });
              let numNotestoInsert = response.ans;
              // insert notes
              if (numNotestoInsert !== 'rest') numNotestoInsert = parseInt(numNotestoInsert)
              let numNotes = 0;
              while (numNotes < numNotestoInsert) {
                response = await prompts({
                  type: 'text',
                  name: 'ans',
                  message: `Note, number of Quarter Notes`
                  // initial: 'rest'
                });
                let tmpNote = JSON.parse(JSON.stringify(track[i]))

                let noteNumber = getNumberfromNote(response.ans.split(',')[0])
                if (numNotestoInsert > 1) {
                  pulses = quarterNotes * ppq
                  duration = (pulses / ppq) * (60 / bpm)
                }
                // console.log('lost')
                // console.log(duration)
                cummulativeTime += duration;
                tmpNote.midi = noteNumber;
                tmpNote.time = cummulativeTime;
                tmpNote.duration = duration;
                tmpNote.quarterNotes = response.ans.split(',')[1] || '1.000';
                // 

                // index--

                console.log('llllllllllllllllllll')
                console.log(track.length)
                // console.log(track)
                trackswithNotes_[trackNumber].splice(i, 0, JSON.parse(JSON.stringify(tmpNote)))
                // track = track.splice(index, 0, JSON.parse(JSON.stringify(tmpNote)))

                // track.splice(index, 0, JSON.parse(JSON.stringify(tmpNote)))
                // console.log(`${i}==?${index} ${timeDiff} (${quarterNotes} quarterNotes) at ${i} as t:t${track[i].time}:<<<<<>>>>>>>>>${cummulativeTime}:ct,,${tmpNote.time}`)

                // let tmp = JSON.parse(JSON.stringify(trackswithNotes_[trackNumber]))
                // console.log(tmp)
                // track = tmp
                console.log(track.length)

                // process.exit();
                index++
                // console.log(tmpNote)
                // console.log(JSON.parse(JSON.stringify(track[0])))
                numNotes++
                console.log('------------------>579')
              }



              //   console.log(noteNumber)
              //   process.exit();
              console.log('------------------>586')
            }else {
                cummulativeTime += track[i].duration
            }

            console.log('------------->588')
            console.log(i)
            console.log(index)
            console.log(track[i])
            

            console.log('------------->590')
            // console.log(track[i])
            // }
            i++
          }

          //   if(track)

          // }
          trackNumber++;
        }
        console.log([trackswithNotes_[0].length, trackswithNotes_[1].length, trackswithNotes_[2].length, trackswithNotes_[3].length, ])
        console.log("IN CORRECTOIN LOOP")
        // process.exit();
      }
      console.log(voicesAtPar)
      console.log(trackswithNotes_[0].length)
      console.log(trackswithNotes_[1].length)
      console.log(trackswithNotes_[2].length)
      console.log(trackswithNotes_[3].length);
    //   process.exit();
      //   console.log(voicesTotalTime)
      //   console.log(voicesAtPar)
      //   process.exit();
      console.log('-------------------648')
     let mostNumberofNotesforTrack_ = leastNumberofNotesforTrack(trackswithNotes_)
     console.log(mostNumberofNotesforTrack_)
     i = 0;
     console.log('-------------------650')
     for (let k in currentsNotes) {
      voicesDuration[k] = 0
    }
    voices_i = [0,0,0,0]
      while (i < mostNumberofNotesforTrack_ /* 37 */ ) { // note by note
        // currentsNotes = trackswithNotes_.map((x, j) => x.splice(i, 1))
        // get all currentNotes from tracks...
        // for(let j in trackswithNotes_) {

        // }
        console.log(i)
        if(voices_i[0] === trackswithNotes_[0].length) break;
        currentsNotes = trackswithNotes_.map((x, j) => {
          let index = voices_i[j]
          console.log([trackswithNotes_[0].length, trackswithNotes_[1].length, trackswithNotes_[2].length, trackswithNotes_[3].length, ])
          console.log([voices_i[0], voices_i[1], voices_i[2], voices_i[3], ])
          console.log('-------------------660 ' + mostNumberofNotesforTrack_)
          console.log(index)
          console.log(j)
          console.log(trackswithNotes_[j].length)
          let duration = x[index].duration;
          
          let pulses = (duration / (60 / bpm)) * ppq
          let quarterNotes = pulses / ppq;
          x[index].quarterNotes = quarterNotes.toFixed(3);
          
          return x[index];

        })
        
        for (let k in currentsNotes) {
            console.log(currentsNotes[k].quarterNotes)
            console.log(voicesDuration[k])
          voicesDuration[k] += parseFloat(currentsNotes[k].quarterNotes)
        }
        console.log('-------------------671')
        console.log(voicesDuration);
        console.log('-------------------672')
        let greatestTime = greatestInArr(voicesDuration)
        // check if all voices are at par
        let voicesAtPar = voicesDuration.every((val, j, arr) => val === greatestTime)
        // if they are different....
        // if all voices
        if (currentsNotes.length === 4) {

        } else {
          // what happens here
          console.error("some voices missing...")
          process.exit();
        }
        
        console.log('<<<<<<<<<<<<<<<<<<<')
        console.log(voicesDuration)
        // console.log(greatestTime)
        console.log(voicesAtPar)
        console.log(voices_i)
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>')
        
        if (voicesAtPar) {
          for (let k in voices_i) {
            voices_i[k]++;
            voicesNotes[k].push(currentsNotes[k])
          }
          console.log('---------------------')
          console.log(voices_i)
          console.log('---------------------')
          
        } else {
          // check if there is a tie...

          //   console.log(trackswithNotes_)
          //   process.exit();
          let hasTie_ = hasTie(voices_i, trackswithNotes_);
          //   if(hasNo)
          if (hasTie_) {
            console.log(hasTie_)
            let currentNotes_1 = [];
            // save longest note
            let durations = trackswithNotes_.map((x, j) => {
              return parseFloat(x[voices_i[j]].quarterNotes)
            });
            let greatestTime = greatestInArr(durations)
            let greatestIndex = durations.indexOf(greatestTime)
            // console.log(voicesDuration) // duration has already been added. so add longest Notes...
            let greatestDuration = greatestInArr(voicesDuration)
            for (let tracksIndex in voicesDuration) {
              let voiceDuration = voicesDuration[tracksIndex]
              if (voiceDuration === greatestDuration) {
                voicesNotes[tracksIndex].push(trackswithNotes_[voices_i[tracksIndex]])
                voices_i[tracksIndex]++ // increase by one the index of the track with the longest note...
              } else {
                let indicestoIncreaseBy = 0;
                let notegroup = [];
                // console.log(hasTie_[tracksIndex])
                while (indicestoIncreaseBy <= hasTie_[tracksIndex]) {
                  if (indicestoIncreaseBy > 0) {
                    voicesDuration[tracksIndex] += parseFloat(trackswithNotes_[tracksIndex][voices_i[tracksIndex]].quarterNotes)
                  }
                  //   console.log(tracksIndex)
                  //   console.log(voices_i[tracksIndex])
                  //   console.log(trackswithNotes_[tracksIndex][voices_i[tracksIndex]])
                  notegroup.push(trackswithNotes_[tracksIndex][voices_i[tracksIndex]])
                  voices_i[tracksIndex]++
                  console.log(voices_i)
                  indicestoIncreaseBy++
                }
                console.log(notegroup)
                voicesNotes[tracksIndex].push(notegroup)

                // console.log(`==>${hasTie_[tracksIndex]}`)
              }
            }
            for (let t in voicesDuration) {
              // console.log(voicesDuration[t])     
              // console.log(voices_i[t])     
              // console.log(voicesDuration[t][voicesDuration[t].length-2])     
            }
            // for(let i in )
            // console.log(greatestDuration)
            // console.log(greatestIndex)
            // console.log(durations)
            // console.log(voicesDuration)
            // process.exit();
            // for (let trackNumber in voices_i) { // index for different tracks..., k is the track
            //     // console.log()
            // //   voicesNotes[trackNumber].push(trackswithNotes_[greatestIndex][trackNumber])
            //   for (let l in hasTie_) {
            //     let ii = voices_i[l]
            //     //   let duration = durations[i]
            //     if (l !== greatestIndex) {
            //       while (duration < durations[greatestIndex]) {
            //         duration += parseFloat(tracks[i][++ii].quarterNotes)
            //       }
            //       addedNoteIndices[i] = ii - indices_[i]
            //       if (duration !== durations[greatestIndex]) return false
            //     }
            //   }
            // }

          } else {
            console.error("MismatchedNotes and no tie...")
            // check which voice has a problem

            /*
             * if there is no problem with the time, then just exit for now... 
             */
            console.error("MismatchedNotes and no tie...")
            // list stanza...
            // ask what note is there... 
            console.log(voicesTotalTime)
            // ask to insert note at this point...

            // for (let k in voices_i) {
            //   // console.log()
            //   // console.log(voices_i[k])
            //   // console.log(trackswithNotes_[k][voices_i[k]])
            // }

            // for (let k in trackswithNotes_[2]) {
            // //   console.log(`=====>${voicesNotes[k].length}`)
            //   // console.log(k)
            //   // let note_0_ = voicesNotes[0][k];
            //   // let note_0;
            //   // if(note_0_.quarterNotes)note_0 = note_0_
            //   // console.log(note_0)
            //   // console.log()
            //   console.log(`${k}:${trackswithNotes_[2][k].quarterNotes}`)
            //   // console.log(trackswithNotes_[k][voices_i[k]])
            // }
            // // for (let k in voicesNotes) {
            // //   console.log(`=====>${voicesNotes[k].length}`)
            // //   // console.log(k)
            // //   // let note_0_ = voicesNotes[0][k];
            // //   // let note_0;
            // // check where there is
            // //   // if(note_0_.quarterNotes)note_0 = note_0_
            // //   // console.log(note_0)
            // //   // console.log()
            // //   // console.log(`${k}:${trackswithNotes_[1][k].quarterNotes}`)
            // //   // console.log(trackswithNotes_[k][voices_i[k]])
            // // }
            // for (let k in voicesNotes[0]) {
            //   let note_0_ = voicesNotes[0][k];

            //   let note_0;
            //   try {
            //     if (note_0_.quarterNotes) note_0 = note_0_.quarterNotes
            //   } catch (err) {
            //     console.log(note_0_)
            //   }
            // }
            // process.exit();
          }
          //   console.log(voicesNotes)
          //   process.exit();
        }
       
        // console.log(i)
        // console.log(mostNumberofNotesforTrack_)

        // if (i === 1) process.exit();
        i++;
      }
      
      console.log('-------------------->858')
      console.log(mostNumberofNotesforTrack_)
      console.log(stanzasSyllables)
      console.log(numberOfNotesfromTracks_)
      console.log('-------------------->859')
      for(let k in trackswithNotes_[0]){
          console.log(`${k}:${trackswithNotes_[0][k]}`)
      }
      for(let k in trackswithNotes_[1]){
        console.log(`${k}:${trackswithNotes_[1][k]}`)
    }
    for(let k in trackswithNotes_[2]){
        console.log(`${k}:${trackswithNotes_[2][k]}`)
    }
    for(let k in trackswithNotes_[3]){
        console.log(`${k}:${trackswithNotes_[0][k]}`)
    }
      process.exit();

    } catch (err) {
      console.log(err)
    }
    console.log(songNumber)
    process.exit();
    if (songNumber === '002')
      process.exit();
    // let hyhenatedStanzas = [];
    // console.log(songNumber)
    // console.log(midiFileName)
    // console.log(midiFilePath)

    // if (songNumber === '001') {
    //   // for(let i in stanzas[0])
    //   // for(let i in stanzas[1])
    //   console.log(stanzas[0])
    //   console.log(stanzas[1])
    //   console.log(songNumber)
    // //   console.log(midiFileName)
    //   console.log(midiFilePath)
    //   //   process.exit();
    // }
    // let numStanzas = stanzas.length;
    // let i = 0;
    // while(i < numStanzas) {
    //     let words = stanzas[i++].split(" ");
    // }


  }
  //   console.log(fileContents)
}
/*
 * get textFilePaths...
 */
let filepaths = [];
let startNumber = 1;
let endNumber = 703;

async function main(page) {
  let filePathContents = fs.readFileSync(hymnalPaths.Hpaths, 'utf-8')
  dictionary = fs.readFileSync('syllabledictionary.txt', 'utf-8')
  let filePaths = filePathContents.split('\n')
  let counts = filePaths.length;
  let i = 0;
  while (i < counts) {
    let path_ = filePaths[i++]
    await to(processTxtFile(path.join(__dirname, "../../", path_)))
  }
}

main();
