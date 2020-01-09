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