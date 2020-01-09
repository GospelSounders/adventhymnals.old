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
        let response = await prompts({
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
      }

    }

    let hyphenated = await hypernatefromDictionary(tmp.join(' '));
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

let hasTie = (indices, tracks) => { // indices = index of beats in corresponding tracks
  let durations = tracks.map((x, j) => {
    return parseFloat(x[indices[j]].quarterNotes)
  });
  //   console.log("CHECKING TIE...");
  //   console.log(indices)
  //   console.log(durations)
  //   console.log("END OF CHECKING TIE...");
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

let checkMissingNotes = async (trackswithNotes_, decoded, stanzasHyphenated) => {
  // console.log('checkMissingNotes')
  // console.log(trackswithNotes_[0].length,trackswithNotes_[1].length,trackswithNotes_[2].length,trackswithNotes_[3].length)
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
  // console.log(mostNumberofNotesforTrack_)
  let i = 0;
  while (i < mostNumberofNotesforTrack_ /* 37 */ ) { // note by note

    let currentsNotes = trackswithNotes_;

    for (let k in currentsNotes) {
      // console.log(voices_i)
      if (voices_i[k] >= currentsNotes[k].length) return trackswithNotes_
      // if(currentsNotes[k][voices_i[k]] === undefined){
      //     console.log('DEBUG..........')
      //     console.log(k)
      //     console.log(voices_i[k])
      //     console.log(i)
      //     console.log(currentsNotes[k][voices_i[k]-1])
      //     console.log(currentsNotes[k][voices_i[k]+1])
      //     for(let p in currentsNotes[k]){
      //         console.log(`${p}: ${currentsNotes[k][p]}`)
      //     }
      // }
      voicesDuration[k] += parseFloat(currentsNotes[k][voices_i[k]].quarterNotes)
    }

    let greatestTime = greatestInArr(voicesDuration)
    // console.log('---------------->500v_indeices:v_Durations')
    // console.log(greatestTime)
    // console.log(voicesDuration)
    let voicesAtPar = voicesDuration.every((val, j, arr) => val === greatestTime)
    // console.log(voicesAtPar)

    if (currentsNotes.length === 4) {

    } else {
      throw " check 339 error"
    }

    if (voicesAtPar) {
      //   console.log('---------------->100v_indeices:v_Durations')
      //   console.log(voices_i)
      //   console.log(voicesDuration)
      for (let k in voices_i) {
        voices_i[k]++;
        voicesNotes[k].push(currentsNotes[k])
      }
    } else {

      let hasTie_ = hasTie(voices_i, trackswithNotes_);
      if (hasTie_) {
        // console.log(voicesAtPar);process.exit();
        // console.log('---------------->376:v_indeices:hasTie:v_Durations')
        // console.log(voices_i)
        // console.log(hasTie_)
        // console.log(voicesDuration)

        let currentNotes_1 = [];
        // save longest note
        // console.log(trackswithNotes_[0].length)
        let tmp = addTie(trackswithNotes_, voices_i, voicesDuration, hasTie_, voicesNotes)
        voicesNotes = tmp[0]
        // console.log(trackswithNotes_[0])
        // console.log(trackswithNotes_[0].length)
        voicesDuration = tmp[1]
        voices_i = tmp[2]
        // console.log('---------------->377:v_indeices:hasTie:v_Durations')
        // console.log(voices_i)
        // console.log(hasTie_)
        // console.log(voicesDuration)
        // process.exit();

        // console.log(voicesDuration) // duration has already been added. so add longest Notes...



      } else {
        console.log('---------->MARK no tie.... ask to rectify note...')
        console.log('what is the index of the missing note???')


        let txtSyllableGroups = getSyllablesfromText(stanzasHyphenated[0]);

        let getSyllablesForTiedNotes = () => {
          //we should know the index.., but we require the index...
        }

        // console.log(voices_i[0])
        // console.log(voices_i[1])
        // console.log(voices_i[2])
        // console.log(voices_i[3])
        // console.log(i)
        // console.log(txtSyllableGroups.length)
        // let noteSyllableGroups = getSyllablesForTiedNotes();
        // // console.log(txtSyllableGroups)
        // // console.log('==================>')
        let txt = ''
        let index = 0;
        while (index < i) {
          // console.log(`${i}:${txtSyllableGroups[i]}`)
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
        //   console.log(error)
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
          // console.log('lost')
          // console.log(duration)
          //   cummulativeTime += duration;
          tmpNote.midi = noteNumber;
          tmpNote.time = cummulativeTime;
          tmpNote.duration = duration;
          tmpNote.quarterNotes = response.ans.split(',')[1] || '1.000';
          //   // 

          //   // index--

          //   console.log('llllllllllllllllllll')
          //   console.log(track.length)
          //   //   // console.log(track)
          //   console.log(`-------------------<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<${trackswithNotes_[trackNumber].length}`)
          trackswithNotes_[trackNumber].splice(trackinnerIndex, 0, JSON.parse(JSON.stringify(tmpNote)))
          //   console.log(`-------------------<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<${trackswithNotes_[trackNumber].length}`)
          //   console.log(track.length)

          // process.exit();
          index++
          // console.log(tmpNote)
          // console.log(JSON.parse(JSON.stringify(track[0])))
          numNotes++
          console.log('------------------>579')
        }
        // this is a missing note... ask to rectify it...
        // console.log(voices_i);
        // console.log(hasTie_);
        // console.log(greatestTime);
        // console.log(trackswithNotes_[0][voices_i[0]]);
        // process.exit();

      }
    }
    i++;
  }
  //   console.log('---------->MARK')
  //   console.log(hasTie_);
  //   console.log(greatestTime);
  //   console.log(voicesAtPar);
  //   console.log(voicesAtPar);
  return trackswithNotes_
  //   process.exit();
}

let getSyllablesFromNotes = (tracks) => {
  let trackswithNotes_ = tracks
  let voices = [
    [],
    [],
    [],
    []
  ]
  let durations = [0, 0, 0, 0]
  let indices = [0, 0, 0, 0];
  let i = 0;
  let leastNumberofNotesforTrack_ = leastNumberofNotesforTrack(trackswithNotes_)
  // console.log('leastNumberofNotesforTrack_')
  // console.log(leastNumberofNotesforTrack_)
  // process.exit();
  for (let k in trackswithNotes_) {
    let duration = 0;
    for (let j in trackswithNotes_[k]) {
      // console.log(`${k}:${j}:${duration - trackswithNotes_[k][j].time}`)

      // console.log(trackswithNotes_[k][j])
      // console.log(trackswithNotes_[k][j].duration)
      // console.log(trackswithNotes_[k][j].time)
      // console.log(duration)

      if (duration - trackswithNotes_[k][j].time !== 0) process.exit();
      duration += trackswithNotes_[k][j].duration;
    }
  }

  while (i < leastNumberofNotesforTrack_) {
    // for(let k in voices){
    //   // console.log(voices[k])
    //   for(let l in voices[i]){
    //     // console.log(k, l, i)
    //     if(voices[k][l]===undefined){
    //       // console.log(`${k} . ${l} . ${i}`)
    //       // process.exit()
    //     }
    //   }

    // }
    // console.log(`&&&&&&&&&&&&&&&&&&&&&&&&&&&&-------------->${i}`)
    // console.log(indices)
    let durations__ = [0, 0, 0, 0]
    for (let k in tracks) {
      let track = tracks[k];
      if (track[indices[k]] === undefined) {
        // console.log('undefined ' + i)
        // for (let i in voices[0]) console.log(`0-|||||||||>>>>>>>>>>>:${i}:${voices[0][i]}`)
        // for (let i in voices[1]) console.log(`1-|||||||||>>>>>>>>>>>:${i}:${voices[1][i]}`)
        // for (let i in voices[2]) console.log(`2-|||||||||>>>>>>>>>>>:${i}:${voices[2][i]}`)
        // process.exit();
        return voices;
      }
      // durations[k] += track[indices[k]].duration
      durations__[k] += track[indices[k]].duration
    }

    // for (let k in voices) {
    //   // console.log(voices[k])
    //   for (let l in voices[k]) {
    //     // console.log(`${k}:::::${l}++++++++++++++++++${voices[k][l]}`)
    //     if (voices[k][l] === undefined) {
    //       // console.log(`${k} . ${l} . ${i}`)
    //       // process.exit()
    //     }
    //   }

    // }

    // console.log("trial:", voices[0].length, voices[1].length, voices[2].length, voices[3].length )
    // console.log("trial:", durations[0], durations[1], durations[2], durations[3] )
    // console.log("trial:", durations[0]+durations__[0], durations[1]+durations__[1], durations[2]+durations__[2], durations[3]+durations__[3] )
    // console.log("trial:", tracks[0][indices[0]].quarterNotes, tracks[1][indices[1]].quarterNotes, tracks[2][indices[2]].quarterNotes, tracks[3][indices[3]].quarterNotes )
    // for (let i in tracks[0]) {


    let voicesAtPar = durations__.every((val, j, arr) => val === durations__[0])
    if (voicesAtPar) {


      for (let k in tracks) {
        let track = tracks[k];

        voices[k].push(track[indices[k]])
        durations[k] += track[indices[k]].duration
        indices[k]++;
        // durations[k] += JSON.parse(JSON.stringify(durations__[k]))
        if (voices[k] === undefined) process.exit();
      }

    } else {
      //   get ties
      let hasTie_ = hasTie(indices, trackswithNotes_);
      // console.log('hasTie_')
      for (let k in durations) {
        durations[k] += durations__[k]
      }
      //   if(hasNo)
      if (hasTie_) {
        // console.log(hasTie_)
        // save longest note
        let durations_ = trackswithNotes_.map((x, j) => {
          return parseFloat(x[indices[j]].quarterNotes) // check. start frm here.....  
        });
        let greatestTime = greatestInArr(durations_)
        let greatestIndex = durations_.indexOf(greatestTime)
        // console.log(voicesDuration) // duration has already been added. so add longest Notes...
        let greatestDuration = greatestInArr(durations)

        for (let tracksIndex in durations) {
          // console.log(`=============>${tracksIndex}`)
          let voiceDuration = durations[tracksIndex]
          // let greatestDuration = greatestInArr(durations)
          // console.log(`${voiceDuration}:${greatestDuration}`)
          if (voiceDuration === greatestDuration) {
            voices[tracksIndex].push(trackswithNotes_[tracksIndex][indices[tracksIndex]])
            // console.log(`=============>${tracksIndex}`)
            if (voices[tracksIndex] === undefined) process.exit();
            indices[tracksIndex]++ // increase by one the index of the track with the longest note...
          } else {
            // console.log('working...')
            let indicestoIncreaseBy = 0;
            let notegroup = [];
            // console.log(hasTie_[tracksIndex])
            while (indicestoIncreaseBy <= hasTie_[tracksIndex]) {
              try {
                if (indicestoIncreaseBy > 0) {
                  //   durations[tracksIndex] += parseFloat(trackswithNotes_[tracksIndex][voices_i[tracksIndex]].quarterNotes)
                  // console.log(trackswithNotes_[tracksIndex][indices[tracksIndex]].duration)
                  durations[tracksIndex] += trackswithNotes_[tracksIndex][indices[tracksIndex]].duration
                  // console.log(`${durations[tracksIndex]}`)
                }
                notegroup.push(trackswithNotes_[tracksIndex][indices[tracksIndex]])
                indices[tracksIndex]++
                // console.log('voices_i')
                indicestoIncreaseBy++
              } catch (erro) {
                console.error(erro)
              }
            }
            //   console.log(notegroup)
            voices[tracksIndex].push(notegroup)
            if (voices[tracksIndex] === undefined) process.exit();

          }
        }
      }

    }
    i++;
  }
  // for (let i in voices[0]) console.log(`0-|||||||||>>>>>>>>>>>:${i}:${voices[0][i]}`)
  // for (let i in voices[1]) console.log(`1-|||||||||>>>>>>>>>>>:${i}:${voices[1][i]}`)
  // for (let i in voices[2]) console.log(`2-|||||||||>>>>>>>>>>>:${i}:${voices[2][i]}`)
  // process.exit();
}

let getMetricalPattern = async (stanzasWithLines) => {
  let meters = [];
  for (let i in stanzasWithLines) {
    let stanzaWithLines = stanzasWithLines[i]
    let stanzaWithLines_1 = stanzaWithLines.split('\n')
    let stanzaWithLines_2 = stanzaWithLines.split('\r');
    stanzaWithLines = stanzaWithLines_1;
    if (stanzaWithLines.length < stanzaWithLines_2.length) stanzaWithLines = stanzaWithLines_2;
    let meter = [];
    for (let k in stanzaWithLines) {
      let line = stanzaWithLines[k]
      line = await hypernatefromDictionary(line);
      line = getSyllablesfromText(line)
      meter.push(line.length);
    }
    meters.push(meter.join('.'))
  }
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
  // console.log(notes_)
  // suppose some notes are sharp and others are flat,, make all of them one of the other...
  // notes_["Gb"] = 2
  // console.log(notes_)
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
        if (noteObj.length > 1) { // is a tie
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
      } catch (error) {
        // console.log(error)
      }

    }
    notesfromTracks[i] = notesforThisTrack;
  }
  // console.log(singlenotesfromTracks.length)
  // console.log(notesfromTracks[0].length)
  // console.log(notesfromTracks[1].length)
  // console.log(notesfromTracks[2].length)
  // console.log(notesfromTracks[3].length)



  // console.log(tracks[0].length)
  // console.log(tracks[1].length)
  // console.log(tracks[2].length)
  // console.log(tracks[3].length)
  // for(let i in tracks[0])console.log(`0->>>>>>>>>>>:${i}:${tracks[0][i]}`)
  // for(let i in tracks[1])console.log(`1->>>>>>>>>>>:${i}:${tracks[1][i]}`)
  // for(let i in tracks[2])console.log(`2->>>>>>>>>>>:${i}:${tracks[2][i]}`)


  // get the key from singlenotesfromTracks.length

  // console.log(singlenotesfromTracks)
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
  // console.log(smallNumber, octave)
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
  tmp2[1] = value;
  tmp[1] = tmp2.join('|')
  headerData[key] = tmp;
  return headerData
}
let saveHeaderData = async (headerData, contents, path_) => { // assumes that keys should already exist... use different function to create missing keys
  for (let i in headerData) {
    let header = headerData[i][1].split('|')[0]
    while (header[header.length - 1] === '')
      header = header.slice(0, -1);
    let re = new RegExp(`${header}[\\s]?\\|.*`, 'g');
    let replace = headerData[i][1]
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
    //   console.log(note)
    // process.exit();
    let accs_ = sharpOrflatUsingKey(note_, key)
    let accs = accs_[0]
    // console.log(accs)
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
  note_ = `${note_}${note[2]}${fullNote}${halfNote}`
  return note_
}
let createLilypondFiles = (header, notes, stanzas, timesignature, bpm, songNumber, key_) => {
  // notes has: note, quarterNotes, octave...
  // include songNumber in title
  // subtitle should have00
  let subtitle = ''
  subtitle = header.Texts[0];
  while (subtitle.split(' ').length > 1) subtitle = subtitle.split(' ').join('')
  let subtitle_ = '';
  if (subtitle.length) subtitle_ = `${header.Texts[0]}; ${header.Metrical[0]}`
  else subtitle_ = header.Metrical[0]
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

  let global = 'global = { ';
  let key = key_
  // console.log(key)
  // console.log(key_)
  // process.exit();
  global += `\\key ${key.split(' ')[0].replace('#', 'is').replace(/b/, "es").toLowerCase()} \\${key.split(' ')[1].toLowerCase()} \\time ${timesignature} `
  let tempo = `\\tempo ${timesignature[2]} = ${parseInt(bpm)} ` // \\tempo 4 = 120
  global += tempo
  let partial = '' // ` \\ partial 4`
  global += partial
  global += ' }'
  // console.log(global)
  lilyTxt += global;

  // todo: calculating partials...
  let lilyVoices = [
    [],
    [],
    [],
    []
  ]
  for (let i in lilyVoices) {
    for (let k in notes[i]) {
      let note = notes[i][k]
      // console.log(note)
      // console.log(note[0])

      if (typeof note[0] === 'object') {
        // console.log(note[0])
        let tmpNotes = note;
        let numTiedNotes = note.length;
        let countNotes = 0;
        for (let l in tmpNotes) {
          // console.log('tmpNotes[l]')

          let note_ = getNoteFinally(tmpNotes[l], key)
          // tie
          // if (++countNotes < numTiedNotes)
          //   note_ = `${note_}~`

          // slur
          if (countNotes === 1)
            note_ = `(${note_}`
          if (countNotes === numTiedNotes - 1)
            note_ = `${note_})`
          countNotes++

          lilyVoices[i].push(note_)
          // console.log(`${note[1]}----------${note_}~`)
        }
      } else {
        let note_ = getNoteFinally(note, key)
        lilyVoices[i].push(note_)
      }


    }
  }
  // console.log(lilyVoices)
  // let lilyVoices_ = ["soprano = \\relative c{", "alto = \\relative c{", "tenor = \\relative c{", "bass = \\relative c{"]
  let lilyVoices_ = ["soprano = {", "alto = {", "tenor = {", "bass = {"]
  for (let i in lilyVoices) {
    for (let k in lilyVoices[i])
      lilyVoices_[i] += lilyVoices[i][k] + ' '
  }
  for (let i in lilyVoices_) {
    lilyVoices_[i] += '}'
  }
  lilyTxt += `\n%Individual voices\n`
  // console.log(lilyVoices_)
  lilyVoices_ = lilyVoices_.join('\n')
  // console.log(lilyVoices_)
  lilyTxt += `\n${lilyVoices_}`

  // lyrics
  lilyTxt += `\n%lyrics\n`
  let aphapet = ''
  for (let i = 9; ++i < 36;) aphapet += i.toString(36)
  // console.log(stanzas)
  let stanzas_ = {};
  for (let i in stanzas) {
    let stanza = stanzas[i]
    stanza = stanza.split('-').join('- ')
    while (stanza.split('  ').length > 1) stanza = stanza.split('  ').join(' ')
    let stanzaKey = `stanza${aphapet[parseInt(i)]}`
    stanza = stanza.replace(/[\d]\.[\s]+/, '')
    stanzas_[stanzaKey] = ` \\lyricmode { \\set stanza = #"${parseInt(i) + 1}. "${stanza}}`
  }
  let lyricsLines = '';
  for (let i in stanzas_) {
    lilyTxt += `${i} = ${stanzas_[i]}\n`
    lyricsLines += `\\new Lyrics \\lyricsto "Sop" { \\${i} }\n`
  }

  let getLilyScore = (lyricsLines, staves = ['', ''], copiesIndex) => {
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
    let txt = `\\score {
      \\new ChoirStaff <<
        \\new Staff <<
          \\clef "treble"
          ${treble}\n
          ${staff1Lyrics}\n
        >>
        \\new Staff <<
          \\clef "bass"
          ${bass}\n
          ${staff2Lyrics}\n
        >>
      >>
    \\layout{}
    \\midi{}
    }`
    return txt;
  }
  let copies = {
    'soprano': [`\\new Voice = "Sop" { \\voiceOne \\global \\soprano}`, '', "Sop"],
    'alto': [`\\new Voice = "Alto" { \\voiceTwo \\global \\alto}`, '', "Alto"],
    'tenor': ['', `\\new Voice = "Tenor" { \\voiceOne \\global \\tenor}`, "Tenor"],
    'bass': ['', `\\new Voice = "Bass" { \\voiceOne \\global \\bass}`, "Bass"],
    'all': [`\\new Voice = "Sop" { \\voiceOne \\global \\soprano}\n\\new Voice = "Alto" { \\voiceTwo \\global \\alto}`, `\\new Voice = "Tenor" { \\voiceOne \\global \\tenor}\n\\new Voice = "Bass" { \\voiceOne \\global \\bass}`]
  }
  let copies_ = {};
  let copiesIndex = 0;
  for (let i in copies) {
    let tmp = copies[i];
    // console.log(tmp[2])

    let tmp_ = lyricsLines;
    if (tmp[2]) tmp_ = tmp_.split('lyricsto "Sop"').join(`lyricsto "${tmp[2]}"`)
    copies_[i] = lilyTxt + getLilyScore(tmp_, copies[i], copiesIndex++)
    // console.log(copies_[i])

  }

  // console.log(lilyTxt)
  return copies_
}


let processTxtFile = async (path_) => {
  let fileContents = fs.readFileSync(path_, 'utf-8');
  let hasRefrain = hasRefrainF(fileContents)
  /*
   * songs without refrainFirst
   */
  if (!hasRefrain) {
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

    try {
      let fileBlob = fs.readFileSync(midiFilePath)
      let decoded = Midi.decode(fileBlob)
      let numberOfNotesfromTracks_ = numberOfNotesfromTracks(decoded.tracks)
      let trackswithNotes_ = trackswithNotes(decoded.tracks)

      let i = 0;
      let currentsNotes = [];
      let AllNotes = [];

      let ppq = decoded.header.PPQ;
      let bpm = decoded.header.bpm;
      let timesignatureStr = `${decoded.header.timeSignature[0]}/${decoded.header.timeSignature[1]}`
      // console.log(decoded.header)
      // console.log(key)
      // process.exit();
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

      let l = 0;
      while (l < trackswithNotes_[0].length) {
        let tmp = await checkMissingNotes(trackswithNotes_, decoded, stanzasHyphenated);
        l++;
      }

      // no problem with notes

      let noteSyllableGroups = getSyllablesFromNotes(trackswithNotes_);
      let txtSyllableGroups = [];
      for (let k in stanzasHyphenated) txtSyllableGroups[k] = getSyllablesfromText(stanzasHyphenated[k])
      // console.log(noteSyllableGroups[0].length)
      // console.log(noteSyllableGroups[1].length)
      // console.log(noteSyllableGroups[2].length)
      // console.log(noteSyllableGroups[3].length)
      // console.log(txtSyllableGroups[0].length)
      // console.log(txtSyllableGroups[1].length)
      // console.log(txtSyllableGroups[2].length)
      // console.log(txtSyllableGroups[3].length)
      // console.log(txtSyllableGroups[0][0], txtSyllableGroups[0][txtSyllableGroups[0].length - 1])
      // console.log(txtSyllableGroups[1][0], txtSyllableGroups[1][txtSyllableGroups[1].length - 1])
      // console.log(txtSyllableGroups[2][0], txtSyllableGroups[2][txtSyllableGroups[2].length - 1])
      // console.log(txtSyllableGroups[3][0], txtSyllableGroups[3][txtSyllableGroups[3].length - 1])
      // console.log()

      let stanzasWithLines = await getStanzasWithLines(fileContents);
      let meter = await getMetricalPattern(stanzasWithLines)

      let notesfromTracks_ = getNotesfromTracks(noteSyllableGroups) // move out and up
      let notesforAllVoices = notesfromTracks_[0]
      let sumofQuarterNotes = notesfromTracks_[2]
      let key = notesfromTracks_[1]

      let headerData = await extractHeaderDatafromContents(fileContents)
      headerData = fixYearfromComposerData(headerData)
      // console.log(headerData)
      // add data to text contents and save: key, meter
      headerData = addToHeaderData(headerData, 'Key', key)
      headerData = addToHeaderData(headerData, 'Metrical', meter)
      await saveHeaderData(headerData, fileContents, path_)
      // from English and Texts go into the middle... No because from english will be found in the index...
      // into the middle go texts and meter

      // create lilypond file...
      // console.log(key)
      let lilypondFiles = createLilypondFiles(headerData, notesforAllVoices, stanzasHyphenated, timesignatureStr, bpm, songNumber, key)
      // console.log(lilypondFiles)

      // yes, sir! we are here..
      // await savelilypondFiles()
      console.log(path_)
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
      while (filesIndex < filesCount) {
        let lyPartName = ''
        let lyPartContent = ''
        let j = 0;
        for (let i in lilypondFiles) {
          lyPartName = i
          lyPartContent = lilypondFiles[i]
          if (j++ === filesIndex) break;
        }
        // console.log(lyPartName)
        let lyFilePath;
        if ('all' !== lyPartName)
          lyFilePath = path.join(lyPath, `${songNumber}-${lyPartName}.ly`)
        else lyFilePath = path.join(lyPath, `${songNumber}.ly`)
        // console.log(lyFilePath)
        fs.writeFileSync(lyFilePath, lyPartContent);
        // exec(`cd ${lyPath} && lilypond ${lyFilePath}`)
        console.log(lyPath)
        await new Promise((resolve, reject) => {
          exec(`cd ${lyPath} && lilypond ${lyFilePath}`, function(error, stdout, stderr) {
            if (error) {
              console.log(error.code);
            }
            console.log(stdout)
            console.log(stderr)
            resolve(true)
          });
        })
        filesIndex++
      }
      // create midis & mp3s,,,

      // insert midis and mp3s to txt file...

      // create singing hymnal files..

      // upload mp4...

      // add mp3 to adhymnal and add link to text_file...
      process.exit();
      

    } catch (err) {
      console.log(err)
    }

  }
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
