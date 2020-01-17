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

let produceMedia = false;
let startFrom = 1;
let endAt = 1;

let dictionary = ''
async function hyphenate_en(text) {
  const hyphenateText = await hyphenator.get("en-us");
  return hyphenateText(text)
}
async function hyphenate_de(text) {
  const hyphenateText = await hyphenator.get("de");
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
  let last2 = word.slice(-2);
  let tmpWord;
  if (last2 === "'s") {
    tmpWord = word.slice(0, -2)
  } else {
    tmpWord = word
    last2 = '';
  }
  tmpWord = tmpWord.replace(/[^A-Za-z0-9]/g, '')
  tmpWord = tmpWord.toLowerCase();
  let re = new RegExp(`\n${tmpWord}`, 'g');
  // if(!dictionary.match(re)){
  // }
  return dictionary.match(re)
}
let hypernatefromDictionary = async (text) => {
  let words = text.split(' ')
  let tmpLen = words.length;
  let ret = '';
  let j = 0;
  while (j < tmpLen) {
    let word = words[j++];
    let tmpWord;
    let last2 = word.slice(-2);
    if (last2 === "'s") {
      tmpWord = word.slice(0, -2)
    } else {
      tmpWord = word
      last2 = '';
    }
    tmpWord = tmpWord.replace(/[^A-Za-z0-9]/g, '')
    // if()
    tmpWord = tmpWord.toLowerCase();
    let re = new RegExp(`\n${tmpWord},(.*)[^a-zA-Z\.]+`, 'g');
    let tmp = dictionary.match(re)
    try {
      if (!tmp[0]) throw "";
      // replace word with hyphenatedWord;
      // let i = 0 //letterIndex
      let tmp0 = tmp[0].split(',')[1]
      tmp0 = tmp0.split('\n').join('')
      let newWord = '';
      let replacing = true;
      while (replacing) {
        let oldWordLetter = word[0]
        let compareLetter = tmp0[0]
        if (oldWordLetter.toLowerCase() === compareLetter) {
          newWord += oldWordLetter;
          //substrings...
          word = word.substr(1);
          tmp0 = tmp0.substr(1);
        } else {
          if (compareLetter === '-') {
            newWord += compareLetter;
            tmp0 = tmp0.substr(1);
          } else {
            newWord += oldWordLetter;
            //substrings...
            word = word.substr(1);
          }
        }
        if (word === '') replacing = false;
      }
      // newWord += last2
      // tmp = tmp[0].replace(`\n${newWord},`, '')
      // ret = `${ret}${tmp} `
      ret = `${ret}${newWord} `
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
    if (tmp[i] !== '');
    count++
    i++;
  }
  return count;
}
let getStanzas = async (content) => {
  let stanzas = content.split('```txt')[1].split('```')[0].split('\n\n');
  let stanzas_1 = content.split('```txt')[1].split('```')[0].split('\r\n\r\n');
  if (stanzas_1.length > stanzas.length) stanzas = stanzas_1
  let hyhenatedStanzas = [];
  let numSyllables = [];
  let numStanzas = stanzas.length;
  let i = 0;
  while (i < numStanzas) {
    stanzas[i] = stanzas[i].trim();
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
    tmp = tmp.trim();
    tmp = tmp.split(' ');
    let tmpLen = tmp.length;
    let j = 0;
    while (j < tmpLen) {
      let word = tmp[j++];
      if (!isInDictionary(word)) {
        let syllables = await hyphenate_en(word);
        let response = await prompts({
          type: 'text',
          name: 'ans',
          message: `${syllables || word}?`,
          initial: 'y'
        });
        if (response.ans !== 'y')
          syllables = response.ans
        let last2 = word.slice(-2);
        let tmpWord;
        if (last2 === "'s") {
          tmpWord = word.slice(0, -2)
        } else {
          tmpWord = word
          last2 = '';
        }
        tmpWord = tmpWord.replace(/[^A-Za-z0-9]/g, '')
        tmpWord = tmpWord.toLowerCase();
        syllables = syllables.toLowerCase().replace(/[;:\.]/g, '')
        let dictionaryLine = `${tmpWord},${syllables}`
        dictionary = `${dictionary}${dictionaryLine}\n`;
        fs.writeFileSync('syllabledictionary.txt', dictionary);
        dictionary = fs.readFileSync('syllabledictionary.txt', 'utf-8');
      }
    }
    let hyphenated = await hypernatefromDictionary(tmp.join(' '));
    hyphenated = hyphenated.trim();
    hyhenatedStanzas[i] = hyphenated;
    // count number of syllables in each stanza and report error if they are not equall
    numSyllables[i] = await countSyllables(hyphenated);
    i++;
  }
  return [stanzas, hyhenatedStanzas, numSyllables];
}
let getStanzasWithLines = async (content) => {
  let stanzas = content.split('```txt')[1].split('```')[0].split('\n\n');
  let stanzas_1 = content.split('```txt')[1].split('```')[0].split('\r\n\r\n');
  if (stanzas_1.length > stanzas.length) stanzas = stanzas_1
  let tmp_stanzas = [];
  for (let i in stanzas) {
    if (stanzas[i].length) tmp_stanzas.push(stanzas[i])
  }
  stanzas = JSON.parse(JSON.stringify(tmp_stanzas))
  let hyhenatedStanzas = [];
  let numSyllables = [];
  let numStanzas = stanzas.length;
  let i = 0;
  while (i < numStanzas) {
    stanzas[i] = stanzas[i].replace(/\n/, '')
    // stanzas[i] = stanzas[i].split('\n').join(' ')
    // stanzas[i] = stanzas[i].split('\r').join(' ')
    stanzas[i] = stanzas[i].replace(/^[\d]\./, '')
    stanzas[i] = stanzas[i].replace(/^[\s]/, '')
    //remove double spaces
    stanzas[i] = stanzas[i].split('  ').join(' ')
    while (stanzas[i].split('  ').length > 1) {
      stanzas[i] = stanzas[i].split('  ').join(' ')
    }
    // let hyphenated = await hypernatefromDictionary(tmp.join(' '));
    // hyhenatedStanzas[i] = hyphenated;
    // count number of syllables in each stanza and report error if they are not equall
    // numSyllables[i] = await countSyllables(hyphenated);
    i++;
  }
  return stanzas;
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
let hasTieinFile = (voices_i, fileTies) => {
  let re = new RegExp(`\n${voices_i[0]},(.*),(.*),(.*),(.*)`)
  let tiesforNote = fileTies.match(re)
  if (tiesforNote === null) return false
  tiesforNote = tiesforNote[0].split(',')
  tiesforNote.shift()
  tiesforNote = tiesforNote.map(x => parseInt(x))
  return tiesforNote
}
let hasTie = (indices, tracks) => { // indices = index of beats in corresponding tracks
  let durations = tracks.map((x, j) => {
    return parseFloat(x[indices[j]].quarterNotes)
  });
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
  let ret = []
  for (let i in txt)
    if (txt[i] !== '') ret.push(txt[i])
  return ret;
}
let getNumberfromNote = (note) => {
  note = note.toLowerCase();
  let higherOctaves = (note.match(/'/g) || []).length
  let lowerOctaves = (note.match(/,/g) || []).length
  note = note.split(',').join('')
  note = note.split("'").join('')
  let knownNote = ['c', 60];
  let noteSequence = ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B']
  let noteSequence_ = [];
  for (let i in noteSequence) {
    let tmp = noteSequence[i].replace('#', 'is').replace(/b/, 'es').toLowerCase();
    noteSequence_.push(tmp)
  }
  let index = noteSequence_.indexOf(note)
  if (index === -1) {
    throw `unknown note ${note}`
  }
  let number = 60 + index + (higherOctaves * 12) - lowerOctaves * 12;
  return number;
}
let addTie = (trackswithNotes_, voices_i, voicesDuration, hasTie_, voicesNotes) => { // cluster notes which have a tie...
  let durations = trackswithNotes_.map((x, j) => {
    return parseFloat(x[voices_i[j]].quarterNotes)
  });
  let greatestTime = greatestInArr(durations)
  let greatestIndex = durations.indexOf(greatestTime)
  let greatestDuration = greatestInArr(voicesDuration)
  let voicesDuration_t = []
  for (let z in voicesDuration) voicesDuration_t[z] = voicesDuration[z].toFixed(4)
  let greatestDuration_t = greatestInArr(voicesDuration_t)
  let durationsAtPar = voicesDuration_t.every((val, j, arr) => val === greatestDuration_t)
  for (let tracksIndex in voicesDuration) {
    let voiceDuration = voicesDuration[tracksIndex]
    if (voiceDuration === greatestDuration && !durationsAtPar) {
      voicesNotes[tracksIndex].push(trackswithNotes_[tracksIndex][voices_i[tracksIndex]])
      voices_i[tracksIndex]++ // increase by one the index of the track with the longest note...
    } else {
      let indicestoIncreaseBy = 0;
      let notegroup = [];
      while (indicestoIncreaseBy <= hasTie_[tracksIndex]) {
        if (indicestoIncreaseBy > 0) {
          voicesDuration[tracksIndex] += parseFloat(trackswithNotes_[tracksIndex][voices_i[tracksIndex]].duration)
        }
        notegroup.push(trackswithNotes_[tracksIndex][voices_i[tracksIndex]])
        voices_i[tracksIndex]++
        indicestoIncreaseBy++
      }
      voicesNotes[tracksIndex].push(notegroup)
    }
  }
  return [voicesNotes, voicesDuration, voices_i]
}
let getTrackwithProblem = (tracks, decoded) => {
  let ppq = decoded.header.PPQ;
  let bpm = decoded.header.bpm;
  for (let k in tracks) {
    let track = tracks[k];
    let trackDurations = 0;
    for (let l in track) {
      let timeDiff = track[l].time - trackDurations;
      let duration = timeDiff;
      let pulses = (duration / (60 / bpm)) * ppq
      let quarterNotes = pulses / ppq;
      if (trackDurations !== track[l].time) return [k, l, quarterNotes, trackDurations];
      trackDurations += track[l].duration
    }
  }
}
let checkMissingNotes = async (trackswithNotes_, decoded, stanzasHyphenated, stanzasWithLines, tiesPath) => {
  let meters = [];
  // for (let i in stanzasWithLines) {
  //   let stanzaWithLines = stanzasWithLines[i]
  //   let stanzaWithLines_1 = stanzaWithLines.split('\n')
  //   let stanzaWithLines_2 = stanzaWithLines.split('\r');
  //   stanzaWithLines = stanzaWithLines_1;
  //   if (stanzaWithLines.length < stanzaWithLines_2.length) stanzaWithLines = stanzaWithLines_2;
  //   let meter = [];
  //   for (let k in stanzaWithLines) {
  //     let line = stanzaWithLines[k]
  //     line = await hypernatefromDictionary(line);
  //     line = getSyllablesfromText(line)
  //     // shorten or lengthen hyphenated words if there are several options for them...
  //     if (line.length)
  //       meter.push(line.length);
  //   }
  //   meters.push(meter.join('.'))
  // }
  let voicesNotes = [
    [],
    [],
    [],
    []
  ]
  let voices_i = [0, 0, 0, 0]; // index of beat in various channels
  let voicesDuration = [0, 0, 0, 0];
  let ppq = decoded.header.PPQ;
  let bpm = decoded.header.bpm;
  let mostNumberofNotesforTrack_ = leastNumberofNotesforTrack(trackswithNotes_)
  let i = 0;
  let fileTies = ''
  try {
    console.log(tiesPath)
    fileTies = fs.readFileSync(tiesPath, 'utf-8')
  } catch (err) {}
  while (i < mostNumberofNotesforTrack_ /* 37 */ ) { // note by note
    let currentsNotes = trackswithNotes_;
    for (let k in currentsNotes) {
      if (voices_i[k] >= currentsNotes[k].length) return trackswithNotes_
      // if(currentsNotes[k][voices_i[k]] === undefined){
      //     for(let p in currentsNotes[k]){
      //     }
      // }
      // voicesDuration[k] += parseFloat(currentsNotes[k][voices_i[k]].quarterNotes)
      voicesDuration[k] += parseFloat(currentsNotes[k][voices_i[k]].duration)
    }
    let greatestTime = greatestInArr(voicesDuration)
    let voicesAtPar = voicesDuration.every((val, j, arr) => val === greatestTime)
    if (currentsNotes.length === 4) {} else {
      throw " check 339 error"
    }
    if (voicesAtPar) {
      let hasTie_1 = hasTieinFile(voices_i, fileTies)
      if (hasTie_1) {
        // 
        console.log(voices_i)
        console.log(hasTie_1)
        let tmp = addTie(trackswithNotes_, voices_i, voicesDuration, hasTie_1, voicesNotes)
        voicesNotes = tmp[0]
        voicesDuration = tmp[1]
        voices_i = tmp[2]
        console.log(hasTie_1)
        console.log(voices_i)
      } else {
        for (let k in voices_i) {
          voices_i[k]++;
          voicesNotes[k].push(currentsNotes[k])
        }
      }
    } else {
      let hasTie_ = hasTie(voices_i, trackswithNotes_);
      if (hasTie_) {
        let currentNotes_1 = [];
        // save longest note
        let tmp = addTie(trackswithNotes_, voices_i, voicesDuration, hasTie_, voicesNotes)
        voicesNotes = tmp[0]
        voicesDuration = tmp[1]
        voices_i = tmp[2]
      } else {
        console.log('---------->MARK no tie.... ask to rectify note...')
        console.log('what is the index of the missing note???')
        let txtSyllableGroups = getSyllablesfromText(stanzasHyphenated[0]);
        let getSyllablesForTiedNotes = () => {
          //we should know the index.., but we require the index...
        }
        // let noteSyllableGroups = getSyllablesForTiedNotes();
        let txt = ''
        let index = 0;
        while (index < i) {
          txt += `${txtSyllableGroups[index]} `
          index++;
        }
        txt += `${txtSyllableGroups[index]} `
        console.log(txt)
        // get the track with the problem and its index... 
        let tmp = getTrackwithProblem(trackswithNotes_, decoded);
        let trackNumber = tmp[0];
        let trackinnerIndex = tmp[1];
        let quarterNotes = tmp[2];
        let cummulativeTime = tmp[3];
        let timeDiff = trackswithNotes_[trackNumber][trackinnerIndex].time - tmp[3]
        // let maxEntry = 0;
        console.log(`There is a problem at the last syllable (${txtSyllableGroups[index]}) for track ${trackNumber}`);
        console.log(`missing notes of ${timeDiff} (${quarterNotes} quarterNotes) at ${trackinnerIndex} as t:t${trackswithNotes_[trackNumber][trackinnerIndex].time}:<<<<<>>>>>>>>>${cummulativeTime}:ct`)
        let response = await prompts({
          type: 'text',
          name: 'ans',
          message: `How many notes to insert? (a rest will be inserted by default)`,
          initial: 'rest'
        });
        // try {} catch (error) {
        // }
        // process.exit()
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
          let tmpNote = JSON.parse(JSON.stringify(trackswithNotes_[trackNumber][trackinnerIndex]))
          let noteNumber = getNumberfromNote(response.ans.split(',')[0])
          let pulses, duration;
          duration = timeDiff;
          if (numNotestoInsert > 1) {
            pulses = quarterNotes * ppq
            duration = (pulses / ppq) * (60 / bpm)
          }
          //   cummulativeTime += duration;
          tmpNote.midi = noteNumber;
          tmpNote.time = cummulativeTime;
          tmpNote.duration = duration;
          tmpNote.quarterNotes = response.ans.split(',')[1] || '1.000';
          //   // 
          //   // index--
          trackswithNotes_[trackNumber].splice(trackinnerIndex, 0, JSON.parse(JSON.stringify(tmpNote)))
          index++
          numNotes++
          console.log('------------------>579')
        }
        // this is a missing note... ask to rectify it...
      }
    }
    i++;
  }
  return trackswithNotes_
}
let getSyllablesFromNotes = (tracks, tiesPath) => {
  let fileTies = ''
  try {
    fileTies = fs.readFileSync(tiesPath, 'utf-8')
  } catch (err) {}
  let trackswithNotes_ = tracks
  let voices = [
    [],
    [],
    [],
    []
  ]
  let partials = false;
  let durations = [0, 0, 0, 0]
  let indices = [0, 0, 0, 0];
  let i = 0;
  let leastNumberofNotesforTrack_ = leastNumberofNotesforTrack(trackswithNotes_)
  // partials
  for (let k in trackswithNotes_) {
    let duration = 0;
    for (let j in trackswithNotes_[k]) {
      if (duration - trackswithNotes_[k][j].time !== 0) {
        if (parseInt(j) === 0) partials = trackswithNotes_[k][j].time
      }
      duration += trackswithNotes_[k][j].duration;
    }
  }
  i = 0;
  while (i < leastNumberofNotesforTrack_) {
    // for(let k in voices){
    //   for(let l in voices[i]){
    //     if(voices[k][l]===undefined){
    //       // process.exit()
    //     }
    //   }
    // }
    let durations__ = [0, 0, 0, 0]
    for (let k in tracks) {
      let track = tracks[k];
      if (track[indices[k]] === undefined) {
        return [voices, partials];
      }
      // durations[k] += track[indices[k]].duration
      durations__[k] += track[indices[k]].duration
    }
    // for (let k in voices) {
    //   for (let l in voices[k]) {
    //     if (voices[k][l] === undefined) {
    //       // process.exit()
    //     }
    //   }
    // }
    // for (let i in tracks[0]) {
    let voicesAtPar = durations__.every((val, j, arr) => val === durations__[0])
    if (voicesAtPar) {
      let hasTie_1 = hasTieinFile(indices, fileTies)
      if (hasTie_1) {
        // 
        let tmp = addTie(trackswithNotes_, indices, durations, hasTie_1, voices)
        voices = tmp[0]
        durations = tmp[1]
        indices = tmp[2]
      } else {
        for (let k in tracks) {
          let track = tracks[k];
          voices[k].push(track[indices[k]])
          durations[k] += track[indices[k]].duration
          indices[k]++;
          // durations[k] += JSON.parse(JSON.stringify(durations__[k]))
          if (voices[k] === undefined) process.exit();
        }
      }
    } else {
      //   get ties
      let hasTie_ = hasTie(indices, trackswithNotes_);
      for (let k in durations) {
        durations[k] += durations__[k]
      }
      //   if(hasNo)
      if (hasTie_) {
        // save longest note
        let durations_ = trackswithNotes_.map((x, j) => {
          return parseFloat(x[indices[j]].quarterNotes)
        });
        let greatestTime = greatestInArr(durations_)
        let greatestIndex = durations_.indexOf(greatestTime)
        let greatestDuration = greatestInArr(durations)
        for (let tracksIndex in durations) {
          let voiceDuration = durations[tracksIndex]
          // let greatestDuration = greatestInArr(durations)
          if (voiceDuration === greatestDuration) {
            voices[tracksIndex].push(trackswithNotes_[tracksIndex][indices[tracksIndex]])
            if (voices[tracksIndex] === undefined) process.exit();
            indices[tracksIndex]++ // increase by one the index of the track with the longest note...
          } else {
            let indicestoIncreaseBy = 0;
            let notegroup = [];
            while (indicestoIncreaseBy <= hasTie_[tracksIndex]) {
              try {
                if (indicestoIncreaseBy > 0) {
                  //   durations[tracksIndex] += parseFloat(trackswithNotes_[tracksIndex][voices_i[tracksIndex]].quarterNotes)
                  durations[tracksIndex] += trackswithNotes_[tracksIndex][indices[tracksIndex]].duration
                }
                notegroup.push(trackswithNotes_[tracksIndex][indices[tracksIndex]])
                indices[tracksIndex]++
                indicestoIncreaseBy++
              } catch (erro) {
                console.error(erro)
              }
            }
            voices[tracksIndex].push(notegroup)
            if (voices[tracksIndex] === undefined) process.exit();
          }
        }
      }
    }
    i++;
  }
  return [voices, partials];
}
let getMetricalPattern = async (stanzasWithLines, stanzasHyphenated) => {
  let meters = [];
  let stanzasHyphenated_t = [];
  for (let i in stanzasHyphenated) {
    stanzasHyphenated_t.push(stanzasHyphenated[i].replace(/[\d]\./, '').trim())
  }
  // console.log(stanzasWithLines)
  // process.exit()
  //  = stanzasHyphenated
  let numWords = [
    [],
    [],
    [],
    []
  ]
  for (let k in stanzasWithLines) {
    // console.log(k)
    let stanzaWithLines = stanzasWithLines[k];
    stanzaWithLines = stanzaWithLines.trim().split('\n')
    let linesHere = stanzaWithLines;
    let meter = [];
    let lineIndex = 0;
    let hyphenatedLine = stanzasHyphenated_t[k].split(' ')
    for (let i in linesHere) {
      let lineHere = linesHere[i].trim()
      let wordCount = lineHere.split(' ').length;
      let wordsHere = lineHere.split(' ')
      let hyphenatedWords = []
      for (let j in wordsHere) {
        hyphenatedWords.push(hyphenatedLine.shift())
      }
      hyphenatedWords = hyphenatedWords.join(' ').split('-').join(' ').split(' ')
      meter.push(hyphenatedWords.length)
      lineIndex++;
    }
    meters.push(meter.join('.'))
  }
  // for (let i in stanzasWithLines) {
  //   let stanzaWithLines = stanzasWithLines[i]
  //   let stanzaWithLines_1 = stanzaWithLines.split('\n')
  //   let stanzaWithLines_2 = stanzaWithLines.split('\r');
  //   stanzaWithLines = stanzaWithLines_1;
  //   if (stanzaWithLines.length < stanzaWithLines_2.length) stanzaWithLines = stanzaWithLines_2;
  //   let meter = [];
  //   for (let k in stanzaWithLines) {
  //     let line = stanzaWithLines[k]
  //     line = await hypernatefromDictionary(line);
  //     line = getSyllablesfromText(line)
  //     // shorten or lengthen hyphenated words if there are several options for them...
  //     if (line.length)
  //       meter.push(line.length);
  //   }
  //   meters.push(meter.join('.'))
  // }
  let compareMeterindex = 0;
  for (let i in meters)
    if (meters[i].length === 1)
      delete meters[i];
    else compareMeterindex = i;
  let regularMeter = meters.every((val, j, arr) => val === meters[compareMeterindex])
  if (regularMeter) meters = meters[compareMeterindex];
  else meters = 'Irregular'
  if (meters === '8.8.8.8') meters = 'L.M';
  if (meters === '8.6.8.6') meters = 'C.M';
  if (meters === '6.6.8.6') meters = 'S.M';
  if (meters === '6.5.6.5.6.5.6.5.') meters = '6.5.6.5.D';
  return meters;
}
let getKeyfromNotesArray = (notesArr) => {
  let notes = {};
  for (let i in notesArr) {
    let note = notesArr[i]
    if (!notes[note]) notes[note] = 1;
    else notes[note]++;
  }
  let sharps = 0;
  let flats = 0;
  // preference: whether to use flats or sharps
  let notes_ = {};
  for (let i in notes) {
    let accdntl = ''
    if (i.length > 1) { // we need to check which one is prefered between the sharp and the flat.
      let sharpNoteLetter = i[0]
      let flatNoteLetter = i.split('/')[1][0]
      let accidentedNotes = notes[i];
      let natural_for_flatNotes = notes[flatNoteLetter] || 0
      let natural_for_sharpNotes = notes[sharpNoteLetter] || 0
      if (natural_for_flatNotes < natural_for_sharpNotes) accdntl = 'b'
      else accdntl = '#'
      if (accdntl === 'b') notes_[i.split('/')[1]] = notes[i]
      else notes_[i.split('/')[0]] = notes[i]
    } else {
      notes_[i] = notes[i]
    }
  }
  // suppose some notes are sharp and others are flat,, make all of them one of the other...
  // notes_["Gb"] = 2
  sharps = 0;
  flats = 0;
  for (let note in notes_) {
    if (note[1] === '#') sharps++
    if (note[1] === 'b') flats++
  }
  let accidental = 'N';
  let notes_1 = {}
  if (sharps >= flats) { // make all sharps
    accidental = '#'
    let index = 0;
    for (let note in notes_) {
      if (note[1] === 'b') {
        let getSharpNote = (notes, note) => {
          for (let noteInner in notes) {
            if (noteInner.indexOf(note) !== -1) return noteInner.split('/')[0]
          }
        }
        let tmpNote = getSharpNote(notes, note);
        if (notes_1[tmpNote] === undefined) notes_1[tmpNote] = notes_[note];
        else notes_1[tmpNote] += notes_[note];
      } else {
        if (notes_1[note] === undefined) notes_1[note] = notes_[note];
        else notes_1[note] += notes_[note];
      }
      index++;
    }
  }
  if (sharps < flats) { // make all flats
    accidental = 'b'
    let index = 0;
    for (let note in notes_) {
      if (note[1] === '#') {
        let getFlatNote = (notes, note) => {
          for (let noteInner in notes) {
            if (noteInner.indexOf(note) !== -1) return noteInner.split('/')[1]
          }
        }
        if (notes_1[tmpNote] === undefined) notes_1[tmpNote] = notes_[note];
        else notes_1[tmpNote] += notes_[note];
      } else {
        if (notes_1[note] === undefined) notes_1[note] = notes_[note];
        else notes_1[note] += notes_[note];
      }
      index++;
    }
  }
  let accidentedNotesObj = {}; //retain only the notes that have the greatest occurance so we can know which notes are #s/bs throughout
  for (let note in notes_1) {
    let letterNote = note[0];
    let sharpNote = `${letterNote}#`
    let flatNote = `${letterNote}b`
    let sharpNotes = notes_1[sharpNote] || 0
    let flatNotes = notes_1[flatNote] || 0
    let nauturalNotes = notes_1[letterNote] || 0
    let accidentedNotes = sharpNotes;
    if (accidentedNotes < flatNotes) accidentedNotes = flatNotes;
    if (accidentedNotes > nauturalNotes) accidentedNotesObj[letterNote] = letterNote;
  }
  let numAccidentedNotes = Object.keys(accidentedNotesObj).length
  let key = getKeyfromNumAccidentedNotes(accidental, numAccidentedNotes)
  return key;
}
let getKeyfromNumAccidentedNotes = (acc, number, type = 'major') => {
  try {
    type = type.toLowerCase()
  } catch (error) {}
  let sharps = [
    ["C", "G", "D", "A", "E", "B", "F#", "C#"],
    ["A", "E", "B", "F#", "C#", "G#", "D#", "A#"]
  ]
  let flats = [
    ["C", "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb"],
    ["A", "D", "G", "C", "F", "Bb", "Eb", "Ab", ]
  ]
  if (type === 'minor') type = 1;
  else type = 0
  switch (acc) {
    case '#':
      return `${sharps[type][number]} ${type===1 ?"Minor" : "Major"}`;
    case "b":
      return `${flats[type][number]} ${type===1 ?"Minor" : "Major"}`;
    default:
      return 'C Major'
  }
}
let getNotesfromTracks = (tracks) => {
  let singlenotesfromTracks = [];
  let sumofQuarterNotes = 0;
  let notesfromTracks = [];
  for (let k in tracks) notesfromTracks.push([])
  for (let i in tracks) {
    let track = tracks[i];
    let notesforThisTrack = []
    for (let k in track) {
      let noteObj = track[k];
      let note;
      try {
        if (noteObj.length > 1) { // is a tie. check read also this from file...
          let tiedNotes = [];
          for (let l in noteObj) {
            let tmp = noteObj[l];
            note = getNotefromNumber(tmp.midi)
            singlenotesfromTracks.push(note[0]);
            tiedNotes.push([note[0], tmp.quarterNotes, note[1]])
            sumofQuarterNotes += parseFloat(tmp.quarterNotes)
          }
          notesforThisTrack.push(tiedNotes)
        } else {
          if (noteObj.length === 1)
            noteObj = noteObj[0];
          note = getNotefromNumber(noteObj.midi)
          singlenotesfromTracks.push(note[0]);
          notesforThisTrack.push([note[0], noteObj.quarterNotes, note[1]])
          sumofQuarterNotes += parseFloat(noteObj.quarterNotes)
        }
      } catch (error) {}
    }
    notesfromTracks[i] = notesforThisTrack;
  }

  // get the key from singlenotesfromTracks.length
  let key = getKeyfromNotesArray(singlenotesfromTracks) // move out and up
  return [notesfromTracks, key, sumofQuarterNotes]
}
let getNotefromNumber = (number) => { //check return also octave...
  let knownNote = ['c', 48];
  let noteSequence = ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B']
  // if(number < 60)
  let diff = (number - knownNote[1])
  let smallNumber = diff % 12
  let octave
  if (diff < 0)
    octave = Math.floor(diff / 12)
  else octave = parseInt(diff / 12)
  if (diff < 0) smallNumber += 12
  let note = noteSequence[smallNumber];
  // 1, 1 => 0
  let retOctave = ''
  while (octave > 0) {
    retOctave += "'"
    octave--
  }
  while (octave < 0) {
    retOctave += ","
    octave++
  }
  return [note, retOctave];
}
let fixYearfromComposerData = (headerData) => {
  let composer = headerData.Composer[0];
  let year = composer.match(/[\d]+/)
  try {
    if (parseInt(year[0]) > 1000) { // is a valid year
      year = parseInt(year[0]);
      year = year.toString();
      let oldYear = headerData.Year[0]
      headerData.Year[0] = year
      if (oldYear.split(' ').join('').length > 0) {
        headerData.Year[1] = headerData.Year[1].split(oldYear).join(year)
      } else {
        let tmp = headerData.Year[1].split('|')
        tmp[1] = year;
        headerData.Year[1] = tmp.join('|')
      }
    }
  } catch (err) {}
  return headerData
}
let extractHeaderDatafromContents = async (contents) => {
  let ret = {}
  let patt = /([A-Za-z]+)(.*)[\|]+/g
  let matches = contents.match(patt)
  // let match = fileContents.matchAll(patt)
  for (let i in matches) {
    let match = matches[i]
    let key = match.split('|')[0].split(' ')[0]
    let value = match.split('|')[1]
    ret[key] = [value, match]
  }
  return ret;
}
let addToHeaderData = (headerData, key, value) => {
  let tmp = headerData[key];
  tmp[0] = value;

  let tmp2 = tmp[1].split('|');
  tmp2[0] = tmp2[0].trim();
  tmp2[1] = value;
  tmp[1] = tmp2.join('|')
  headerData[key] = tmp;
  // process.exit();
  return headerData
}
let saveHeaderData = async (headerData, contents, path_) => { // assumes that keys should already exist... use different function to create missing keys
  for (let i in headerData) {
    let header = headerData[i][1].split('|')[0]
    while (header[header.length - 1] === '')
      header = header.slice(0, -1);
    let re = new RegExp(`\n${header}[\\s]?\\|.*`, 'g');
    console.log(re)
    let replace = `\n${headerData[i][1]}`
    contents = contents.replace(re, replace)
  }
  fs.writeFileSync(path_, contents)
}
let sharpOrflatUsingKey = (note, key) => {
  while (key.split('  ').length > 1) {
    key = key.split('  ').join(' ')
  }
  let keyLetter = key.split(' ')[0];
  let majorOrMinor = key.split(' ')[1] || 'Major';
  majorOrMinor = majorOrMinor === 'Major' ? 0 : 1;
  let acc = [
    ["C", "G", "D", "A", "E", "B", "F#", "C#", "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb"],
    ["A", "E", "B", "F#", "C#", "G#", "D#", "A#", "D", "G", "C", "F", "Bb", "Eb", "Ab", ]
  ]
  let sharps = [0, 'F', 'C', 'G', 'D', 'A', 'E', 'B']
  let flats = [0, 'B', 'E', 'A', 'D', 'G', 'C', 'F']
  let keyIndex = acc[majorOrMinor].indexOf(keyLetter)
  let arrtoCheck;
  let toAppend = ''
  if (keyIndex <= 7) {
    arrtoCheck = sharps;
    toAppend = '#'
  } else {
    keyIndex -= 7;
    arrtoCheck = flats;
    toAppend = 'b'
  }
  let ret = [];
  let i = 0;
  while (i <= keyIndex) {
    ret.push(`${arrtoCheck[i]}${toAppend}`)
    i++
  }
  return [ret, toAppend];
}
let getNoteFinally = (note, key) => {
  let note_ = note[0].replace("#", 'is').replace(/b/, 'es').toLowerCase()
  // get whole notes and the dot...
  let tmpDuration = 1 / (note[1] / 4)
  let fullNote = (tmpDuration % 1) ? (tmpDuration * 3) / 2 : tmpDuration
  let halfNote = (tmpDuration % 1) ? "." : "";
  if (note_.split('/').length > 1) {
    let accs_ = sharpOrflatUsingKey(note_, key)
    let accs = accs_[0]
    let optionNote1 = note_.split('/')[0][0].toUpperCase()
    let optionNote2 = note_.split('/')[1][0].toUpperCase()
    let optionNote1Index = accs.indexOf(`${optionNote1}#`)
    let optionNote2Index = accs.indexOf(`${optionNote2}b`)
    if (optionNote2Index > -1) note_ = note_.split('/')[1]
    else {
      if (optionNote1Index > -1) note_ = note_.split('/')[0]
      else {
        let toAppend = accs_[1];
        if (toAppend === '#') note_ = note_.split('/')[0]
        else note_ = note_.split('/')[1]
      }
    }
  }
  note_ = `${note_}${note[2]}${Math.ceil(fullNote)}${halfNote}` // check. Either floor or ceil depending...
  return note_
}
let gcd = function (a, b) {
  if (!b) return a;
  return gcd(b, a % b);
};
let toFraction = (fraction) => {
  let len = fraction.toString().length - 2;
  let denominator = Math.pow(10, len);
  let numerator = fraction * denominator;
  let divisor = gcd(numerator, denominator);
  numerator /= divisor;
  denominator /= divisor;
  return Math.floor(numerator) + '/' + Math.floor(denominator);
}
let createLilypondFiles = (header, notes, stanzas, timesignature, bpm, ppq, songNumber, key_, partials, repeat) => {
  // notes has: note, quarterNotes, octave...
  // include songNumber in title
  // subtitle should have00
  let subtitle = ''
  subtitle = header.Texts[0];
  while (subtitle.split(' ').length > 1) subtitle = subtitle.split(' ').join('')
  let subtitle_ = '';
  if (subtitle.length) subtitle_ = `${header.Texts[0]}; ${header.Metrical[0]}`
  else subtitle_ = header.Metrical[0]
  // console.log(header.Author);process.exit();;
  let lilyTxt = `\\header
    {
      tagline = ""  % removed
      title = "${parseInt(songNumber)}.${header.Title[0]}"
      composer = "${header.Composer[0]}"
      poet = "${header.Author[0]}"
      subtitle = "${subtitle_}"
    }
    \\version "2.18.2"
    %
    %% global for all staves
    %\n`
  // todo: calculating partials...
  let pulses = (partials / (60 / bpm)) * ppq
  let quarterNotes = pulses / ppq;
  partials = quarterNotes
  let notesPerMeasure = parseInt(timesignature.split('/')[0])
  let notesInMeasure = parseInt(timesignature.split('/')[1])
  let allNotesinMeasure = 1 / notesInMeasure * notesPerMeasure
  if (partials !== 0) {
    partials *= (1 / 4)
    partials = allNotesinMeasure - partials
    partials = (1 / partials).toString()
  }
  let global = 'global = { ';
  let key = key_
  global += `\\key ${key.split(' ')[0].replace('#', 'is').replace(/b/, "es").toLowerCase()} \\${key.split(' ')[1].toLowerCase()} \\time ${timesignature} `
  let tempo = `\\tempo ${timesignature[2]} = ${parseInt(bpm)} ` // \\tempo 4 = 120
  global += tempo
  let partial = partials ? `\\partial ${partials}` : '' // ` \\ partial 4`
  global += partial
  global += ' }'
  lilyTxt += global;
  let lilyVoices = [
    [],
    [],
    [],
    []
  ]
  let notesPeriods = [{}, {}, {}, {}]
  let notesPeriodsCummuative = [0, 0, 0, 0]
  for (let i in notes) {
    for (let k in notes[i]) {
      let note = notes[i][k]
      if (typeof note[0] === 'object') {
        for (let l in note) {
          let tmp = getNoteFinally(note[l], key)
          notesPeriods[i][notesPeriodsCummuative[i]] = tmp.split('is').join('').split('es').join('').split(/[\d]/).join('')
          notes[i][k][l][3] = notesPeriodsCummuative[i]
          notesPeriodsCummuative[i] += parseFloat(note[l][1])
        }
      } else {
        let tmp = getNoteFinally(note, key)
        notes[i][k][3] = notesPeriodsCummuative[i]
        notesPeriods[i][notesPeriodsCummuative[i]] = tmp.split('is').join('').split('es').join('').split(/[\d]/).join('')
        notesPeriodsCummuative[i] += parseFloat(note[1])
        // if(isNaN(parseFloat(note[1])))
      }
    }
  }
  for (let i in lilyVoices) {
    for (let k in notes[i]) {
      let note = notes[i][k]
      if (typeof note[0] === 'object') {
        let tmpNotes = note;
        let numTiedNotes = note.length;
        let countNotes = 0;
        for (let l in tmpNotes) {
          let note_ = getNoteFinally(tmpNotes[l], key)
          let origNote = note_.split('is').join('').split('es').join('').split(/[\d]/).join('')
          // tie
          // if (++countNotes < numTiedNotes)
          //   note_ = `${note_}~`
          // slur
          if (countNotes === 1)
            note_ = `(${note_}`
          if (countNotes === numTiedNotes - 1)
            note_ = `${note_})`
          countNotes++
          // what time is the note???
          let noteTime = tmpNotes[l][3]
          let numSimilar = 0;
          if (i > 0) { // check if there are similar notes in other tracks: 1 - 4. No shifts on first track
            // let otherTimeNotes = [];
            for (let z in notesPeriods) {
              if (z < 3 && z < i) { // don't compare with last track. z is track index being check, i is current track index
                if (notesPeriods[z][noteTime])
                  if (notesPeriods[z][noteTime] === origNote) numSimilar++;
              }
            }
          }
          // if (numSimilar > 0) { // check........... temp disabled..........
          //   note_ = `\\override NoteColumn.force-hshift = 10 ${note_}`
          // }
          lilyVoices[i].push(note_)
        }
      } else {
        let note_ = getNoteFinally(note, key)
        lilyVoices[i].push(note_)
      }
    }
  }
  // let lilyVoices_ = ["soprano = \\relative c{", "alto = \\relative c{", "tenor = \\relative c{", "bass = \\relative c{"]
  let lilyVoices_ = ["soprano = {", "alto = {", "tenor = {", "bass = {"]
  for (let i in lilyVoices) {
    for (let k in lilyVoices[i])
      lilyVoices_[i] += lilyVoices[i][k] + ' '
  }
  for (let i in lilyVoices_) {
    lilyVoices_[i] += '}'
  }
  let lilyVoices_1 = JSON.parse(JSON.stringify(lilyVoices_)) // all stanzas in one line
  for (let j in lilyVoices_1) {
    let patt = /{(.*)}/
    let voiceNotes_ = lilyVoices_[j].match(patt)[1]; // j is a voice: sop,alto,tenor,bass
    console.log(repeat)
    console.log('===================================', voiceNotes_)
    let voiceNotes_AllStanzas = '';
    for (let i in stanzas) voiceNotes_AllStanzas += `${voiceNotes_} `
    lilyVoices_1[j] = lilyVoices_1[j].split(voiceNotes_).join(voiceNotes_AllStanzas)
  }
  lilyTxt += `\n%Individual voices\n`
  lilyVoices_ = lilyVoices_.join('\n')
  lilyVoices_1 = lilyVoices_1.join('\n')
  let lilyTxt_1 = `${lilyTxt}\n${lilyVoices_1}`
  lilyTxt += `\n${lilyVoices_}`
  // lyrics
  lilyTxt += `\n%lyrics\n`
  lilyTxt_1 += `\n%lyrics\n`
  let aphapet = ''
  for (let i = 9; ++i < 36;) aphapet += i.toString(36)
  // combine also all lyrics into one line...
  let singleLyricsLine = ''
  let stanzas_ = {};
  for (let i in stanzas) {
    let stanza = stanzas[i]
    stanza = stanza.split('-').join('- ')
    while (stanza.split('  ').length > 1) stanza = stanza.split('  ').join(' ')
    let stanzaKey = `stanza${aphapet[parseInt(i)]}`
    stanza = stanza.replace(/[\d]\.[\s]+/, '')
    stanzas_[stanzaKey] = ` \\lyricmode { \\set stanza = #"${parseInt(i) + 1}. "${stanza}}`
    singleLyricsLine += `${stanza} `
  }
  singleLyricsLine = `\\lyricmode { ${singleLyricsLine}}`
  let stanzas_1 = {
    stanzaa: singleLyricsLine
  } // all stanzas into one
  let lyricsLines = '';
  for (let i in stanzas_) {
    lilyTxt += `${i} = ${stanzas_[i]}\n`
    lyricsLines += `\\new Lyrics \\lyricsto "Sop" { \\${i} }\n`
  }
  let lyricsLines_1 = '';
  for (let i in stanzas_1) {
    lilyTxt_1 += `${i} = ${stanzas_1[i]}\n`
    lyricsLines_1 += `\\new Lyrics \\lyricsto "Sop" { \\${i} }\n`
  }
  let getLilyScore = (lyricsLines, staves = ['', ''], copiesIndex, separated, repeat) => {
    let treble = staves[0] || ''
    let bass = staves[1] || ''
    let staff1Lyrics = ''
    let staff2Lyrics = ''
    if (copiesIndex > 3) {
      staff1Lyrics = lyricsLines
    } else {
      if (copiesIndex > 1) staff2Lyrics = lyricsLines
      else staff1Lyrics = lyricsLines
    }
    let treble_ = '';
    let repeatTimes = repeat === false ? 1 : repeat === '' ? 1 : repeat // check start here...
    if (bass === '') { // treble clef voices...
      let i = 0;
      while (i++ < repeatTimes) {
        treble_ += `\\new Staff <<\n\\clef "treble"
        ${treble}\n
        ${staff1Lyrics || staff2Lyrics}\n>>\n`
      }
    } else {
      treble_ = `\\new Staff <<\n\\clef "treble"
      ${treble}\n
      ${staff1Lyrics}\n>>\n`
    }
    let bass_ = '';
    if (treble === '') {
      let i = 0;
      while (i++ < repeatTimes) {
        bass_ += `\\new Staff <<\n\\clef "bass"
        ${bass}\n
        ${staff1Lyrics || staff2Lyrics}\n>>\n`
      }
    } else {
      bass_ = `\\new Staff <<
      \\clef "bass"
      ${bass}\n
      ${staff2Lyrics}\n>>\n`
    }
    // if (treble === '') {
    //   let i = 0;
    //   while (i++ < repeatTimes) {
    //     bass_ += `\\new Staff <<\n\\clef "bass"
    //     ${bass}\n
    //     ${staff1Lyrics || staff2Lyrics}\n>>\n`
    //   }
    // } else {
    //   bass_ = `\\new Staff <<
    //   \\clef "bass"
    //   ${bass}\n
    //   ${staff2Lyrics}\n>>\n`
    // }
    let trebles_ = ''
    let basss_ = ''
    if (separated && bass_ !== '' && treble !== '') {
      console.log(treble);
      let trebles = treble.split('}\n')
      trebles[0] = trebles[0] + '}\n'
      let i = 0;
      while (i++ < repeatTimes) {
        trebles_ += `\\new Staff <<\n\\clef "treble"
      ${trebles[0]}\n
      ${staff1Lyrics}\n>>\n`
      let voiceName = trebles[1].match(/Voice = "(.*)"/)[1]
      staff1Lyrics = staff1Lyrics.split('lyricsto "Sop"').join(`lyricsto "${voiceName}"`)
      let oldVoice = voiceName;
      // 
      trebles_ += `\\new Staff <<\n\\clef "treble"
      ${trebles[1]}\n
      ${staff1Lyrics}\n>>\n`
      let basses = bass.split('}\n')
      basses[0] = basses[0] + '}\n'
      voiceName = basses[0].match(/Voice = "(.*)"/)[1]
      staff1Lyrics = staff1Lyrics.split(`lyricsto "${oldVoice}"`).join(`lyricsto "${voiceName}"`)
      basss_ = `\\new Staff <<\n\\clef "bass"
      ${basses[0]}\n
      ${staff1Lyrics}\n>>\n`
      oldVoice = voiceName;
      voiceName = basses[1].match(/Voice = "(.*)"/)[1]
      staff1Lyrics = staff1Lyrics.split(`lyricsto "${oldVoice}"`).join(`lyricsto "${voiceName}"`)
      basss_ += `\\new Staff <<\n\\clef "bass"
      ${basses[1]}\n
      ${staff1Lyrics}\n>>\n`
      i++
      }
      treble_ = trebles_
      bass_ = basss_
      // console.log(treble_);
      // process.exit();
    }
    let txt = `\\score {
      \\new ChoirStaff <<
       ${treble_}
        ${bass_}
      >>
    \\layout{}
    \\midi{}
    }`
    // let txt = `\\score {
    //   \\new ChoirStaff <<
    //     \\new Staff <<
    //       \\clef "treble"
    //       ${treble}\n
    //       ${staff1Lyrics}\n
    //     >>
    //     \\new Staff <<
    //       \\clef "bass"
    //       ${bass}\n
    //       ${staff2Lyrics}\n
    //     >>
    //   >>
    // \\layout{}
    // \\midi{}
    // }`
    return txt;
  }
  // let getLiLyScoreComplex = 
  let copies = {
    'soprano': [`\\new Voice = "Sop" { \\voiceOne \\global \\soprano}`, '', "Sop"],
    'alto': [`\\new Voice = "Alto" { \\voiceTwo \\global \\alto}`, '', "Alto"],
    'tenor': ['', `\\new Voice = "Tenor" { \\voiceOne \\global \\tenor}`, "Tenor"],
    'bass': ['', `\\new Voice = "Bass" { \\voiceOne \\global \\bass}`, "Bass"],
    'choir': [`\\new Voice = "Sop" { \\voiceOne \\global \\soprano}\n\\new Voice = "Alto" { \\voiceTwo \\global \\alto}`, `\\new Voice = "Tenor" { \\voiceOne \\global \\tenor}\n\\new Voice = "Bass" { \\voiceOne \\global \\bass}`],
    'separated': [`\\new Voice = "Sop" { \\voiceOne \\global \\soprano}\n\\new Voice = "Alto" { \\voiceTwo \\global \\alto}`, `\\new Voice = "Tenor" { \\voiceOne \\global \\tenor}\n\\new Voice = "Bass" { \\voiceOne \\global \\bass}`]
  }
  let copies_ = {};
  let copies_1 = {};
  let copiesIndex = 0;
  for (let i in copies) {
    let tmp = copies[i];
    let tmp_ = lyricsLines;
    let tmp_1 = lyricsLines_1;
    if (tmp[2]) {
      tmp_ = tmp_.split('lyricsto "Sop"').join(`lyricsto "${tmp[2]}"`)
      tmp_1 = tmp_1.split('lyricsto "Sop"').join(`lyricsto "${tmp[2]}"`)
    }
    copies_[i] = lilyTxt + getLilyScore(tmp_, copies[i], copiesIndex++, i === 'separated' ? true : false, repeat)
    copies_1[i] = lilyTxt_1 + getLilyScore(tmp_1, copies[i], copiesIndex++, i === 'separated' ? true : false, repeat)
  }
  return [copies_, copies_1];
}

let exec_ = async (command) => {
  return new Promise((resolve, reject) => {
    exec(`${command}`, function (error, stdout, stderr) {
      if (error) {
        // console.log(error.code);
      }
      // console.log(stdout)
      // console.log(stderr)
      resolve(true)
    });
  })
}

let processTxtFile = async (path_) => {
  console.log(path_);
  let fileContents = fs.readFileSync(path_, 'utf-8');
  let hasRefrain = hasRefrainF(fileContents)
  let syllablesDirPath = path_.split('created')[0] + (path_.split('created')[1].split('/')[1]) + '-syllables'
  // let trackswithNotes_Path = path_.split('created')[0] + (path_.split('created')[1].split('/')[1]) + '-trackswithNotes_'
  try {
    fs.mkdirSync(syllablesDirPath)
  } catch (err) {}
  let syllablesPath = path.join(syllablesDirPath, path_.split('/').slice(-2)[0])
  let trackswithNotes_Path = path.join(syllablesDirPath, path_.split('/').slice(-2)[0]) + '-trackswithNotes_'
  /*
   * songs without refrainFirst
   */
  if (!hasRefrain) {
    let songNumber = await getSongNumber(fileContents)
    songNumber = parseInt(songNumber).toString();
    if (songNumber.length < 2) songNumber = '0' + songNumber
    if (songNumber.length < 3) songNumber = '0' + songNumber
    let tiesPath = path_.split('/')
    tiesPath.pop()
    tiesPath.pop()
    tiesPath.pop()
    tiesPath.pop()
    let hName = tiesPath.pop();
    tiesPath.pop()
    tiesPath = tiesPath.join('/') + `/${hName}-ties/${songNumber}`
    let midiFileName = 'C' + songNumber + '.mid';
    let midiFilePath = path.join(hymnalPaths.midiDir, midiFileName);
    let stanzasSaved = false;
    try {
      stanzasSaved = fs.readFileSync(syllablesPath, 'utf-8')
    } catch (err) {}
    let stanzasTmp;
    if (!stanzasSaved) stanzasTmp = await getStanzas(fileContents); // check if saved
    else stanzasTmp = JSON.parse(stanzasSaved)
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
        if (isNaN(stanzas[i][0]) && stanzas[i][1] !== '.') tmp_[0].push(`${tmp_[2].length+1}. ${stanzas[i]}`)
        else tmp_[0].push(`${stanzas[i]}`)
        tmp_[1].push(stanzasSyllables[i])
        // tmp_[2].push(`${tmp_[2].length+1}. ${stanzasHyphenated[i]}`)
        if (isNaN(stanzasHyphenated[i][0]) && stanzasHyphenated[i][1] !== '.') tmp_[2].push(`${tmp_[2].length+1}. ${stanzasHyphenated[i]}`)
        else tmp_[2].push(`${stanzasHyphenated[i]}`)
      }
      i++;
    }
    stanzas = JSON.parse(JSON.stringify(tmp_[0]))
    stanzasSyllables = JSON.parse(JSON.stringify(tmp_[1]))
    stanzasHyphenated = JSON.parse(JSON.stringify(tmp_[2]))
    let allStanzashaveSameNumSyllables = stanzasSyllables.every((val, i, arr) => val === arr[0])
    console.log('-------------------------------------------->1545' + allStanzashaveSameNumSyllables)
    if (!allStanzashaveSameNumSyllables) {
      for (let ii in stanzasHyphenated) {
        let sta = stanzasHyphenated[ii].split('-').join(' ').split(' ')
        for (let iii in sta) console.log(`${iii}:${sta[iii]}`)
      }
      // save wrong syllables errors
      console.log(hymnalPaths.unequalStanzaSyllables)
      let unequalStanzaSyllables = fs.readFileSync(hymnalPaths.unequalStanzaSyllables, 'utf-8')
      console.log('-------------------------------------------->1545')
      unequalStanzaSyllables = `${unequalStanzaSyllables}\n${songNumber}`
      console.log('-------------------------------------------->1545')
      fs.writeFileSync(hymnalPaths.unequalStanzaSyllables, unequalStanzaSyllables)
    }
    console.log('-------------------------------------------->1545*')
    // if success, save result.
    fs.writeFileSync(syllablesPath, JSON.stringify([stanzas, stanzasHyphenated, stanzasSyllables]));
    try {
      let fileBlob = fs.readFileSync(midiFilePath) // check if saved
      let decoded = Midi.decode(fileBlob)
      let numberOfNotesfromTracks_ = numberOfNotesfromTracks(decoded.tracks)
      let trackswithNotes_ = trackswithNotes(decoded.tracks)
      console.log('-------------------------------------------->1546-1')
      let i = 0;
      let currentsNotes = [];
      let AllNotes = [];
      let ppq = decoded.header.PPQ;
      let timeSin_tmp = {}
      for (let p in decoded.gsMusicObject.timeSignatures) {
        if (timeSin_tmp[decoded.gsMusicObject.timeSignatures[p]] === undefined) timeSin_tmp[decoded.gsMusicObject.timeSignatures[p]] = 0
        else timeSin_tmp[decoded.gsMusicObject.timeSignatures[p]]++
      }
      let greater = {}
      for (let p in timeSin_tmp) {
        let occurences = timeSin_tmp[p]
        if (!greater[occurences]) greater[occurences] = [p]
        else greater[occurences].push(p)
      }
      // which is the greater...
      console.log(greater)
      // sort obj of timeSignature numbers
      var sortable = [];
      for (let occurance in greater) {
        sortable.push([occurance, greater[occurance]]);
      }
      sortable.sort(function (a, b) {
        return parseInt(a[0]) - parseInt(b[0]);
      });
      let greatest = sortable.slice(-1)[0][1]
      let timesignatureStr;
      if (greatest.length === 0) {
        timesignatureStr = `${greatest[0].split('/')[0]}/${greatest[0].split('/')[1]}`
      } else {
        let tmpGreatest = []
        for (let i in greatest) {
          let tmp = parseInt(greatest[i].split('/')[0]) / parseInt(greatest[i].split('/')[1])
          tmpGreatest.push([tmp, greatest[i]])
        }
        // descending order
        tmpGreatest = tmpGreatest.sort(function (a, b) {
          if (a > b) return -1;
          if (b > a) return 1;
        })
        tmpGreatest = tmpGreatest.slice(-1)[0][1]
        timesignatureStr = tmpGreatest
      }
      let bpm = decoded.header.bpm;
      // let timesignatureStr = `${decoded.header.timeSignature[0]}/${decoded.header.timeSignature[1]}`
      console.log('-------------------------------------------->1546-2')
      // check if trackWithNotes was saved...
      let stanzasSaved = false;
      try {
        trackswithNotes_ = JSON.parse(fs.readFileSync(trackswithNotes_Path, 'utf-8'))
        // trackswithNotes_ = fs.readFileSync(trackswithNotes_Path, 'utf-8')
      } catch (err) {}
      console.log('1', path_)
      let l = 0;
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
      let stanzasWithLines = await getStanzasWithLines(fileContents); // check if saved
      while (l < trackswithNotes_[0].length) {
        let tmp = await checkMissingNotes(trackswithNotes_, decoded, stanzasHyphenated, stanzasWithLines, tiesPath);
        l++;
      }
      console.log(stanzasSyllables)
      // trackswithNotes_ save
      fs.writeFileSync(trackswithNotes_Path, JSON.stringify(trackswithNotes_))
      console.log('-------------------------------------------->1546-3')
      let noteSyllableGroups_ = getSyllablesFromNotes(trackswithNotes_, tiesPath);
      let noteSyllableGroups = noteSyllableGroups_[0];
      let partials = noteSyllableGroups_[1];
      let txtSyllableGroups = [];
      for (let k in stanzasHyphenated) txtSyllableGroups[k] = getSyllablesfromText(stanzasHyphenated[k])
      console.log('-------------------------------------------->1546-4')
      let meter = await getMetricalPattern(stanzasWithLines, stanzasHyphenated)
      console.log('-------------------------------------------->1546-5')
      console.log(meter)
      let notesfromTracks_ = getNotesfromTracks(noteSyllableGroups) // move out and up
      let notesforAllVoices = notesfromTracks_[0]
      let sumofQuarterNotes = notesfromTracks_[2]
      let key = notesfromTracks_[1]
      console.log('-------------------------------------------->1546-6')
      let headerData = await extractHeaderDatafromContents(fileContents)
      headerData = fixYearfromComposerData(headerData)
      // add data to text contents and save: key, meter
      headerData = addToHeaderData(headerData, 'Key', key)
      headerData = addToHeaderData(headerData, 'Metrical', meter)

      await saveHeaderData(headerData, fileContents, path_)
      // console.log(fileContents);process.exit();
      console.log('-------------------------------------------->1546')
      console.log('-------------------------------------------->1546')
      // from English and Texts go into the middle... No because from english will be found in the index...
      // into the middle go texts and meter
      // create lilypond file...
      // return // check. start here
      /*
       * repeats, 
       * long and short... 
       */
      let forLylipond = async (repeat) => {
        let lilypondFiles_ = createLilypondFiles(headerData, notesforAllVoices, stanzasHyphenated, timesignatureStr, bpm, ppq, songNumber, key, partials, repeat)
        let lilypondFiles = lilypondFiles_[0]
        let lilypondFiles1 = lilypondFiles_[1]
        let lyPath = path_.split('/created/')
        let hymnalName = path_.split('/created/')[1].split('/')[0] + '-ly'
        lyPath = path.join(lyPath[0], "created", hymnalName);
        try {
          fs.mkdirSync(lyPath)
        } catch (error) {}
        // lyPath = path.join(lyPath, songNumber);
        let filesCount = Object.keys(lilypondFiles).length;
        let filesIndex = 0;
        try {
          fs.mkdirSync(lyPath)
        } catch (error) {}

        let lilinksTemplate = {
          noRepeat: {
            short: '',
            long: ''
          },
          repeat: {
            short: '',
            long: ''
          }
        }
        let lilinks = {
          soprano: JSON.parse(JSON.stringify(lilinksTemplate)),
          alto: JSON.parse(JSON.stringify(lilinksTemplate)),
          tenor: JSON.parse(JSON.stringify(lilinksTemplate)),
          bass: JSON.parse(JSON.stringify(lilinksTemplate)),
          choir: JSON.parse(JSON.stringify(lilinksTemplate)),
          "choir-separated": JSON.parse(JSON.stringify(lilinksTemplate))
        }

        while (filesIndex < filesCount) {
          let lyPartName = ''
          let lyPartName1 = ''
          let lyPartContent = ''
          let lyPartContent1 = ''
          let j = 0;

          for (let i in lilypondFiles) {
            lyPartName = i
            lyPartName1 = i
            lyPartContent = lilypondFiles[i]
            lyPartContent1 = lilypondFiles1[i]
            if (j++ === filesIndex) break;
          }
          let lyFilePath;
          let lyFilePath1;
          let repeated = repeat ? repeat : ''
          let norepeatedOrNot;
          if (repeated === '') {
            norepeatedOrNot = 'noRepeat'
          } else norepeatedOrNot = 'repeat'
          if ('separated' === lyPartName) {
            lyPartName = 'choir-separated'
          }
          // start here....

          lyFilePath = path.join(lyPath, `${songNumber}-${repeated}-${lyPartName}.ly`)
          lyFilePath1 = path.join(lyPath, `${songNumber}-long-${repeated}-${lyPartName}.ly`)
          // if ('separated' !== lyPartName) {
          //   lyFilePath = path.join(lyPath, `${songNumber}-${repeated}-${lyPartName}.ly`)
          //   lyFilePath1 = path.join(lyPath, `${songNumber}-long-${repeated}-${lyPartName}.ly`)
          // } else {
          //   lyFilePath = path.join(lyPath, `${songNumber}-${lyPartName}.ly`)
          //   lyFilePath1 = path.join(lyPath, `${songNumber}-long-${lyPartName}.ly`)
          // }
          fs.writeFileSync(lyFilePath, lyPartContent);
          fs.writeFileSync(lyFilePath1, lyPartContent1);
          // exec(`cd ${lyPath} && lilypond ${lyFilePath}`)
          let getMediaFilePath = (path__, extension) => {
            path__ = path__.split('.')
            path__.pop();
            path__ = path__.join('.') + '.' + extension
            return path__
          }
          let midiPath = getMediaFilePath(lyFilePath, 'midi');
          let mp3Path = getMediaFilePath(lyFilePath, 'mp3');
          let wavPath = getMediaFilePath(lyFilePath, 'wav');

          if (produceMedia) {
            await exec_(`cd ${lyPath} && lilypond ${lyFilePath}`)
            console.log(lyFilePath)
            await exec_(`cd ${lyPath} && timidity -Ow -o ${wavPath} ${midiPath}`)
            await exec_(`cd ${lyPath} && lame ${wavPath} ${mp3Path}`)
            await exec_(`cd ${lyPath} && rm ${wavPath}`)
          }
          let midiPath1 = getMediaFilePath(lyFilePath1, 'midi');
          let mp3Path1 = getMediaFilePath(lyFilePath1, 'mp3');
          let wavPath1 = getMediaFilePath(lyFilePath1, 'wav');
          if (produceMedia) {
            await exec_(`cd ${lyPath} && lilypond ${lyFilePath1}`)
            await exec_(`cd ${lyPath} && timidity -Ow -o ${wavPath1} ${midiPath1}`)
            await exec_(`cd ${lyPath} && lame ${wavPath1} ${mp3Path1}`)
            await exec_(`cd ${lyPath} && rm ${wavPath1}`)
          }

          let dir__ = midiPath1.split('/').slice(-2)[0].split('-')[0];
          let publicDir = '/home/brian/Code/CSECO/cmsTests/Raneto/public/sites/adventhymnal';
          let dir_midi = 'midi'
          let dir_mp3 = 'mp3'
          let dir_mp3Singing = 'singing'
          let dir_mp3SingingHarmonica = 'programmable-singing'
          let dir_ly = 'ly'
          fs.mkdirpSync(path.join(publicDir, dir__))
          fs.mkdirpSync(path.join(publicDir, dir__, dir_midi))
          fs.mkdirpSync(path.join(publicDir, dir__, dir_ly))
          fs.mkdirpSync(path.join(publicDir, dir__, dir_mp3))
          fs.mkdirpSync(path.join(publicDir, dir__, dir_mp3Singing))
          fs.mkdirpSync(path.join(publicDir, dir__, dir_mp3SingingHarmonica))

          let voice__ = midiPath1.split('/').slice(-1)[0].split('-').slice(-1)[0].split('.')[0];
          let fileName__ = midiPath1.split('/').slice(-1)[0]
          if (repeated === '') {
            let lyNotRepeated = lyFilePath
            let lyNotRepeatedLong = lyFilePath1
          }


          voice__ = midiPath1.split('/').slice(-1)[0].split('-').slice(-1)[0].split('.')[0];
          fileName__ = midiPath1.split('/').slice(-1)[0]
          let linkPath_midi = `{{{cself}}}/${dir__}/${dir_midi}/${fileName__.split('.')[0]}.midi`
          let linkPath_mp3 = `{{{cself}}}/${dir__}/${dir_mp3}/${fileName__.split('.')[0]}.mp3`
          let linkPath_singing = `{{{cself}}}/${dir__}/${dir_mp3Singing}/${fileName__.split('.')[0]}-v.mp3`
          let linkPath_SingingHarmonica = `{{{cself}}}/${dir__}/${dir_mp3SingingHarmonica}/${fileName__.split('.')[0]}-vs.html`
          let linkPath_ly = `{{{cself}}}/${dir__}/${dir_ly}/${fileName__.split('.')[0]}.ly`

          lilinks[lyPartName][norepeatedOrNot].short = `${midiPath}<>${path.join(publicDir, dir__)}<>${linkPath_midi}<>${linkPath_mp3}<>${linkPath_singing}<>${linkPath_SingingHarmonica}<>${linkPath_ly}`
          lilinks[lyPartName][norepeatedOrNot].long = `${midiPath1}<>${path.join(publicDir, dir__)}<>${linkPath_midi}<>${linkPath_mp3}<>${linkPath_singing}<>${linkPath_SingingHarmonica}<>${linkPath_ly}`

          filesIndex++
        }
        // copy and move ly files
        let linksData = {
          ly: {},
          midi: {},
          pdf: {},
          vocalized: {},
          unvocalized: {},
          singing: {}
        } // lilypond
        for (let voice in lilinks) {
          let tmp;
          let voiceLinks = ''
          let audioLinks = ''
          if (repeat) {
            tmp = lilinks[voice].repeat

          } else tmp = lilinks[voice].noRepeat
          for (let len in tmp) {
            let tmp_ = tmp[len];
            if (len === 'short') tmp_ = tmp_.split('-long-').join('--')
            tmp_ = tmp_.split('<>')
            let nowLocation = tmp_[0]
            let publicDir = tmp_[1]
            let midiLocationDir = tmp_[2]
            let mp3LocationDir = tmp_[3]
            let mp3SingingLocationDir = tmp_[4]
            let myrrSingingLocationDir = tmp_[5]
            let lyLocationDir = tmp_[6]

            //move ly files
            let tmpFileDest, tmpFileSource, tmpLinkName;
            tmpFileDest = path.join(publicDir, lyLocationDir.split('/').slice(-2).join('/'))
            tmpFileSource = nowLocation.split('.');
            tmpFileSource.pop()
            tmpFileSource += '.ly'

            let pdfSource = tmpFileSource.replace(/\.ly/, '.pdf')
            let pdfDest = tmpFileDest.replace(/\.ly/, '.pdf').replace(/\/ly\//, '/pdf/')

            let midiSource = tmpFileSource.replace(/\.ly/, '.midi')
            let midiDest = tmpFileDest.replace(/\.ly/, '.midi').replace(/\/ly\//, '/midi/')

            let mp3Source = tmpFileSource.replace(/\.ly/, '.mp3')
            let mp3Dest = tmpFileDest.replace(/\.ly/, '.mp3').replace(/\/ly\//, '/mp3/')


            try {
              fs.moveSync(tmpFileSource, tmpFileDest, {
                overwrite: true
              })
            } catch (err) {}
            try {
              fs.moveSync(pdfSource, pdfDest, {
                overwrite: true
              })
            } catch (err) {}
            try {
              fs.moveSync(midiSource, midiDest, {
                overwrite: true
              })
            } catch (err) {}
            try {
              if (repeat) {
                fs.moveSync(mp3Source, mp3Dest, {
                  overwrite: true
                })
              }
            } catch (err) {}
            tmpLinkName = lyLocationDir.split('/').slice(-1).join('/').replace(/\.(.*)/, '').replace(/[\d]+-+/, '').replace(/[\d]+-+/, '')
            voiceLinks += `<a href="${lyLocationDir}" target="_blank">${tmpLinkName}, </a>`

            if (tmpLinkName.match(/long-/) !== null) audioLinks += `<a href="${lyLocationDir}" target="_blank">${tmpLinkName}, </a>`
          }
          linksData['ly'][voice] = voiceLinks
          linksData['pdf'][voice] = voiceLinks.split(/\.ly/).join('.pdf').split(/\/ly\//).join('/pdf/')
          linksData['midi'][voice] = voiceLinks.split(/\.ly/).join('.midi').split(/\/ly\//).join('/midi/')
          linksData['unvocalized'][voice] = audioLinks.split(/\.ly/).join('.mp3').split(/\/ly\//).join('/mp3/')
          linksData['vocalized'][voice] = audioLinks.split(/\.ly/).join('-v.mp3').split(/\/ly\//).join('/singing/')
          linksData['singing'][voice] = audioLinks.split(/\.ly/).join('.html').split(/\/ly\//).join('/programmable-singing/')

        }

        let re;
        if (!repeat)
          re = new RegExp(`(Lilypond file )(\\|)(.*)(\\|)(.*)(\\|)(.*)(\\|)(.*)(\\|)(.*)(\\|)(.*)`)
        else re = new RegExp(`(Lilypond \\(x8\\) )(\\|)(.*)(\\|)(.*)(\\|)(.*)(\\|)(.*)(\\|)(.*)(\\|)(.*)`)

        fileContents = fileContents.replace(re, `$1$2${linksData.ly.soprano}$4${linksData.ly.alto}$6${linksData.ly.tenor}$8${linksData.ly.bass}$10${linksData.ly.choir}$12${linksData.ly["choir-separated"]}`)

        if (!repeat)
          re = new RegExp(`(pdf )(\\|)(.*)(\\|)(.*)(\\|)(.*)(\\|)(.*)(\\|)(.*)(\\|)(.*)`)
        else re = new RegExp(`(pdf\\(x8\\) )(\\|)(.*)(\\|)(.*)(\\|)(.*)(\\|)(.*)(\\|)(.*)(\\|)(.*)`)
        fileContents = fileContents.replace(re, `$1$2${linksData.pdf.soprano}$4${linksData.pdf.alto}$6${linksData.pdf.tenor}$8${linksData.pdf.bass}$10${linksData.pdf.choir}$12${linksData.pdf["choir-separated"]}`)

        if (!repeat) {
          re = new RegExp(`(midi )(\\|)(.*)(\\|)(.*)(\\|)(.*)(\\|)(.*)(\\|)(.*)(\\|)(.*)`)
          fileContents = fileContents.replace(re, `$1$2${linksData.midi.soprano}$4${linksData.midi.alto}$6${linksData.midi.tenor}$8${linksData.midi.bass}$10${linksData.midi.choir}$12${linksData.midi["choir-separated"]}`)

        }
        if (repeat) {

          re = new RegExp(`(unvocalized )(\\|)(.*)(\\|)(.*)(\\|)(.*)(\\|)(.*)(\\|)(.*)(\\|)(.*)`)
          fileContents = fileContents.replace(re, `$1$2${linksData.unvocalized.soprano}$4${linksData.unvocalized.alto}$6${linksData.unvocalized.tenor}$8${linksData.unvocalized.bass}$10${linksData.unvocalized.choir}$12${linksData.unvocalized["choir-separated"]}`)

          re = new RegExp(`(vocalized )(\\|)(.*)(\\|)(.*)(\\|)(.*)(\\|)(.*)(\\|)(.*)(\\|)(.*)`)
          fileContents = fileContents.replace(re, `$1$2${linksData.vocalized.soprano}$4${linksData.vocalized.alto}$6${linksData.vocalized.tenor}$8${linksData.vocalized.bass}$10${linksData.vocalized["choir-separated"]}$12${linksData.vocalized["choir-separated"]}`)

          re = new RegExp(`(singing file )(\\|)(.*)(\\|)(.*)(\\|)(.*)(\\|)(.*)(\\|)(.*)(\\|)(.*)`)
          fileContents = fileContents.replace(re, `$1$2${linksData.singing.soprano}$4${linksData.singing.alto}$6${linksData.singing.tenor}$8${linksData.singing.bass}$10${linksData.singing["choir-separated"]}$12${linksData.singing["choir-separated"]}`)

          let sopAudio = linksData.singing.soprano.match(/href="([\.\{\}a-zA-Z0-9\/-]*)"/g)
          let altoAudio = linksData.singing.alto.match(/href="([\.\{\}a-zA-Z0-9\/-]*)"/g)
          let tenorAudio = linksData.singing.tenor.match(/href="([\.\{\}a-zA-Z0-9\/-]*)"/g)
          let bassAudio = linksData.singing.bass.match(/href="([\.\{\}a-zA-Z0-9\/-]*)"/g)
          let choirAudio = linksData.singing.choir.match(/href="([\.\{\}a-zA-Z0-9\/-]*)"/g)
          let tmp = '';
          for (let ze in sopAudio)
            if (sopAudio[ze].match(/-long-/)) {
              tmp = sopAudio[ze].replace(/\.html/, '.mp3').replace(/href="([\.\{\}a-zA-Z0-9\/-]*)"/, `<audio controls><source src="$1" type="audio/mpeg">Your browser does not support the audio element.</audio>`)
            }
          sopAudio = tmp
          for (let ze in altoAudio)
            if (altoAudio[ze].match(/-long-/)) {
              tmp = altoAudio[ze].replace(/\.html/, '.mp3').replace(/href="([\.\{\}a-zA-Z0-9\/-]*)"/, `<audio controls><source src="$1" type="audio/mpeg">Your browser does not support the audio element.</audio>`)
            }
          altoAudio = tmp
          for (let ze in tenorAudio)
            if (tenorAudio[ze].match(/-long-/)) {
              tmp = tenorAudio[ze].replace(/\.html/, '.mp3').replace(/href="([\.\{\}a-zA-Z0-9\/-]*)"/, `<audio controls><source src="$1" type="audio/mpeg">Your browser does not support the audio element.</audio>`)
            }
          tenorAudio = tmp
          for (let ze in bassAudio)
            if (bassAudio[ze].match(/-long-/)) {
              tmp = bassAudio[ze].replace(/\.html/, '.mp3').replace(/href="([\.\{\}a-zA-Z0-9\/-]*)"/, `<audio controls><source src="$1" type="audio/mpeg">Your browser does not support the audio element.</audio>`)
            }
          bassAudio = tmp
          for (let ze in choirAudio)
            if (choirAudio[ze].match(/-long-/)) {
              tmp = choirAudio[ze].replace(/\.html/, '.mp3').replace(/href="([\.\{\}a-zA-Z0-9\/-]*)"/, `<audio controls><source src="$1" type="audio/mpeg">Your browser does not support the audio element.</audio>`)
            }
          choirAudio = tmp

          let dir_midi = 'midi'
          let dir_mp3 = 'mp3'
          let dir_mp3Singing = 'singing'
          let dir_mp3SingingHarmonica = 'programmable-singing'
          let dir_ly = 'ly'

          re = new RegExp(`(\nSoprano )(\\|)(.*)(\\|)(.*)(\\|)(.*)(\\|)(.*)`)
          fileContents = fileContents.replace(re, `$1$2${linksData.singing.soprano}$4${sopAudio.replace('.mp3', '-v.mp3').replace(`${dir_mp3SingingHarmonica}`, dir_mp3Singing)}$6${sopAudio.replace(`${dir_mp3SingingHarmonica}`, dir_mp3)}$8`)
          re = new RegExp(`(\nAlto )(\\|)(.*)(\\|)(.*)(\\|)(.*)(\\|)(.*)`)
          fileContents = fileContents.replace(re, `$1$2${linksData.singing.alto}$4${altoAudio.replace('.mp3', '-v.mp3').replace(`${dir_mp3SingingHarmonica}`, dir_mp3Singing)}$6${altoAudio.replace(`${dir_mp3SingingHarmonica}`, dir_mp3)}$8`)
          re = new RegExp(`(\nTenor )(\\|)(.*)(\\|)(.*)(\\|)(.*)(\\|)(.*)`)
          fileContents = fileContents.replace(re, `$1$2${linksData.singing.tenor}$4${tenorAudio.replace('.mp3', '-v.mp3').replace(`${dir_mp3SingingHarmonica}`, dir_mp3Singing)}$6${tenorAudio.replace(`${dir_mp3SingingHarmonica}`, dir_mp3)}$8`)
          re = new RegExp(`(\nBass )(\\|)(.*)(\\|)(.*)(\\|)(.*)(\\|)(.*)`)
          fileContents = fileContents.replace(re, `$1$2${linksData.singing.bass}$4${bassAudio.replace('.mp3', '-v.mp3').replace(`${dir_mp3SingingHarmonica}`, dir_mp3Singing)}$6${bassAudio.replace(`${dir_mp3SingingHarmonica}`, dir_mp3)}$8`)
          re = new RegExp(`(\nChoir )(\\|)(.*)(\\|)(.*)(\\|)(.*)(\\|)(.*)`)
          fileContents = fileContents.replace(re, `$1$2${linksData.singing.choir}$4${choirAudio.replace('.mp3', '-v.mp3').replace(`${dir_mp3SingingHarmonica}`, dir_mp3Singing)}$6${choirAudio.replace(`${dir_mp3SingingHarmonica}`, dir_mp3)}$8`)
        }

        fs.writeFileSync(path_, fileContents)
        fileContents = fs.readFileSync(path_, 'utf-8')
        // await exec_(`cd ${lyPath} && rm ${songNumber}*`)
        // timidity -Ow -o $MIDI_SOP_FILE.wav $MIDI_SOP_FILE.midi
        // lame $MIDI_SOP_FILE.wav $MIDI_SOP_FILE.mp3
      }
      await forLylipond(false)
      await forLylipond(8)
      // process.exit();
    } catch (err) {
      console.log(err)
    }
  }
}
/*
 * get textFilePaths...
 */
let filepaths = [];

async function main(page) {
  let filePathContents = fs.readFileSync(hymnalPaths.Hpaths, 'utf-8')
  let toaddtoFile = `## Learn to Sing
>>>> The files available in this section have comparatively large sizes. If you need to save on data, then you can download the midi files in the download section as they are of smaller sizes.
Voice |  Singing Hymnal | Vocalized | unvocalized music |
-------------|------------|------------|------------|------------|
Soprano | | | |
Alto | | | |
Tenor | | | |
Bass | | | |
Choir | | | |

## Downloads

- |  Soprano | Alto | Tenor | Bass | Choir | Separated |
-------------|------------|------------|------------|------------|------------|------------|---|---|
pdf | | | | | |
pdf(x8) | | | | | |
midi | | | | | |
vocalized | | | | | |
unvocalized | | | | | |
singing file | | | | | |
Lilypond file | | | | | |
Lilypond (x8) | | | | | |

  `
  // let startFrom = 9; // index from 1. Hymn Number to start from
  let endNumber = 703;
  dictionary = fs.readFileSync('syllabledictionary.txt', 'utf-8')
  let filePaths = filePathContents.split('\n')
  let counts = filePaths.length;
  let i = 0;
  while (i < counts) {
    console.log(i, startFrom - 1)
    let path_ = filePaths[i]
    if (i >= (startFrom - 1)) {
      console.log(i)
      if (i >= endAt) process.exit();
      console.log(path_)
      let filePathI = path.join(__dirname, "../../", path_);
      let filePathIContents = fs.readFileSync(filePathI, 'utf-8')
      if (filePathIContents.split('## Downloads').length === 1) {
        filePathIContents += toaddtoFile
        fs.writeFileSync(filePathI, filePathIContents)
      }
      await to(processTxtFile(path.join(__dirname, "../../", path_)))
      console.log(`-----------`)
    }
    i++
  }
}
// dictionary = fs.writeFileSync('syllabledictionary.txt', dictionary = fs.readFileSync('syllabledictionary.txt', 'utf-8').toLowerCase());

startFrom = parseInt(process.argv[3]) || 1
endAt = parseInt(process.argv[4]) || startFrom
console.log(endAt)
// process.exit();
if (process.argv[2] === 'true') produceMedia = true;
main();

// console.log(process.argv)
