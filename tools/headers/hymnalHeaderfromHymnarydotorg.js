const axios = require('axios'),
  to = require('await-to-js').to,
  util = require('util'),
  exec = util.promisify(require('child_process').exec),
  path = require('path'),
  fs = require('fs-extra'),
  matchAll = require("match-all"),
  prompts = require('prompts');

class hymnalHeaderfromHymnarydotorg {
  constructor(hymnaryHymnal, numSongsinHymnal) {
    let self = this;
    self.hymnaryHymnal = hymnaryHymnal
    self.numSongsinHymnal = numSongsinHymnal
    self.hymnalUrl = `https://hymnary.org/hymn/${hymnaryHymnal}`
    self.numbers = [];

    if (isNaN(numSongsinHymnal)) throw `invalid numSongsinHymnal: ${numSongsinHymnal}`
    let i = 0;
    while (++i <= numSongsinHymnal) {
      self.numbers.push(i)
    }
  }

  enterMissingInfo = async () => {
    let self = this

    return new Promise(async (resolve, reject) => {
      await this.missingNumbers();;
      let line = await this.getSingleLine()
      let newEntry = {};
      let keys = Object.keys(line)
      let missingNumbers = fs.readFileSync(`${self.hymnaryHymnal}-missing`, 'utf-8').split('\n')
      let tmpMissing = missingNumbers;
      missingNumbers = [];
      for (let i in tmpMissing)
        if (!isNaN(parseInt(tmpMissing[i]))) missingNumbers.push(tmpMissing[i])
      // missing numbers...
      while (missingNumbers.length) {
        let missingNumber = missingNumbers.shift();
        keys = Object.keys(line)
        let numKeys = keys.length
        newEntry = {
          "hymnNumber": parseInt(missingNumber)
        }
        while (keys.length) {
          let key = keys.shift()
          if (newEntry[key]) continue;
          console.log(`Enter details for ${self.hymnaryHymnal} ${newEntry.hymnNumber}`)
          let response = await prompts({
            type: 'text',
            name: 'ans',
            message: `${key}?`,
            initial: ''
          });
          // console.log(key)
          newEntry[key] = response.ans

        }
        if (Object.keys(newEntry) === numKeys)
          fs.appendFileSync(`${self.hymnaryHymnal}Header`, self.titleCase(self.decode(JSON.stringify(newEntry)) + '\n'));
      }
      //  console.log(line)
      await to(this.missingNumbers());;
      resolve(line)
    })
  }
  checkMissingAuthors = async () => {
    let self = this
    return new Promise((resolve, reject) => {
      const lineReader = require('readline').createInterface({
        input: require('fs').createReadStream(`${this.hymnaryHymnal}Header`)
      });
      let lines = []
      // await this.exec(`echo "" > /tmp/${self.hymnaryHymnal}Header`)
      lineReader.on('line', async (input) => {
        try {
          let line = JSON.parse(input)
          if (!Object.keys(line).includes('Author') || line.Author.trim().length === 0) {
            // console.log(line)
            lines.push(line)

          } else {
            fs.appendFileSync(`/tmp/${self.hymnaryHymnal}Header`, this.titleCase(this.decode(JSON.stringify(line)) + '\n'));
          }
          // return resolve(line);
        } catch (err) {}
      }).on('close', async () => {
        while (lines.length) {
          let line = lines.shift();
          console.log(line)
          let response = await prompts({
            type: 'text',
            name: 'ans',
            message: `Author?`,
            initial: ''
          });
          line.Author = response.ans
          fs.appendFileSync(`/tmp/${self.hymnaryHymnal}Header`, this.titleCase(this.decode(JSON.stringify(line)) + '\n'));
        }
        await this.exec(`mv /tmp/${this.hymnaryHymnal}Header ${this.hymnaryHymnal}Header`)
        resolve(true)
      })
    })
  }

  listAllAuthors = async () => {
    let self = this
    return new Promise(async (resolve, reject) => {
      await this.exec(`echo "" > ${self.hymnaryHymnal}Authors-1`)
      const lineReader = require('readline').createInterface({
        input: require('fs').createReadStream(`${this.hymnaryHymnal}Header`)
      });
      let authors = {};
      lineReader.on('line', async (input) => {
        try {
          let line = JSON.parse(input)
          let author = line.Author
          author = author.replace(/([A-Z-a-z][A-Z-a-z]+)\./g, "$1")
          if (author === 'Anonymous') author = 'Anon'
          author = author.trim();
          let hasDate = author.match(/\(.*\)/)
          // console.log(hasDate)
          if (hasDate) {
            author = author.replace(/\(.*\)/, '')
            author = author.trim()
            hasDate = hasDate[0];
          }
          // change name formats...
          let tmpAuthor = author.replace(/\./g, '')
          tmpAuthor = tmpAuthor.split(' ')
          let arrInitials = (name) => {
            return name.join('').length === name.length || name.join('').indexOf(':') > -1 || name.includes('of')
          }
          let formatName = (name) => {
            let firstName = name.pop()
            if (firstName.length === 1) {
              if (firstName.match(/[^A-Za-z]/)) firstName = name.pop()
            }
            if (!isNaN(parseInt(firstName))) {
              return [formatName(name), firstName]
            }
            name = name.reverse();
            name.push(`${firstName},`)
            name = name.reverse();
            return name.join(' ')
          }
          if (arrInitials(tmpAuthor)) author = author
          else {
            author = formatName(tmpAuthor)
            if (typeof author !== 'string') {
              authors[author[0]] = [`(${author[1]})`]
              author = author[0]
            }
          }
          let hymnNumber = line.hymnNumber
          if (authors[author] === undefined) {
            if (hasDate) {
              authors[author] = [hasDate];
              authors[author].push(hymnNumber)
            } else
              authors[author] = [hymnNumber]
          } else {
            authors[author].push(hasDate)
            authors[author].push(hymnNumber)
          }
        } catch (err) {}
      }).on('close', async () => {
        // console.log(authors)
        let tmp = [];
        // sort numbers
        let tmpAuthors = {};
        for (let i in authors) {
          // let tmpA = [i]
          let tmpB = [];
          for (let j in authors[i]) {
            if (!tmpB.includes(authors[i][j])) tmpB.push(authors[i][j])
          }
          tmpB = tmpB.sort((a, b) => a - b);
          tmpAuthors[i] = tmpB
        }

        authors = tmpAuthors
        for (let i in authors) tmp.push([i, authors[i].join(',')])
        tmp = tmp.sort();
        while (tmp.length) {
          let line = tmp.shift();
          // console.log(line)
          line = line.join(',')
          while (line.split(',,').length > 1) line = line.split(',,').join(',')
          fs.appendFileSync(`${self.hymnaryHymnal}Authors-1`, line + '\n');

        }
        // await this.exec(`mv /tmp/${this.hymnaryHymnal}Header ${this.hymnaryHymnal}Header`)
        resolve(true)
      })
    })
  }

  checkMissing = async () => {
    console.log(this.hymnaryHymnal)
    return new Promise(async (resolve, reject) => {
      let table = `\n1 - authors\n2- poets`
      let response = await prompts({
        type: 'text',
        name: 'ans',
        message: `check for which key?${table}`,
        initial: ''
      });
      switch (response.ans) {
        case '1':
          await this.checkMissingAuthors();
          await this.listAllAuthors();
          // await this.checkAuthorsAgainstRoughIndex();
          resolve(true)
          break;
      }
    })
  }

  getSingleLine = async () => {
    return new Promise((resolve, reject) => {
      let self = this;
      const lineReader = require('readline').createInterface({
        input: require('fs').createReadStream(`${self.hymnaryHymnal}Header`)
      });
      lineReader.on('line', (input) => {
        try {
          let line = JSON.parse(input)
          return resolve(line);
        } catch (err) {}
      })
    })
  }

  missingNumbers = async () => {
    return new Promise(async (resolve, reject) => {
      await this.exec(`echo "" > ${this.hymnaryHymnal}-missing`)
      let foundNumbers = [];
      let missingNumbers = [];
      let self = this;
      const lineReader = require('readline').createInterface({
        input: require('fs').createReadStream(`${self.hymnaryHymnal}Header`)
      });

      lineReader.on('line', (input) => {
        // console.log(input)
        try {
          let line = JSON.parse(input)
          let {
            hymnNumber
          } = line
          foundNumbers.push(hymnNumber)
        } catch (err) {}
      }).on('close', function (line) {
        for (let i = 1; i <= self.numSongsinHymnal; i++) {
          if (!foundNumbers.includes(i)) {
            missingNumbers.push(i)
          }
        }
        console.log(missingNumbers)
        if (missingNumbers.length)
          fs.appendFileSync(`${self.hymnaryHymnal}-missing`, missingNumbers.join('\n'));
        resolve(true)
      });
    })

  }


  fetchHymnHeader = async (url) => {
    try {
      let [err, hymnPage] = await to(axios.get(url))
      let title, title_number;
      hymnPage = hymnPage.data
      await this.getFromOnline(hymnPage)
    } catch (err) {

    }
  }

  getFromOnline = async (pageData) => {
    try {
      let title_number = /<h2 class='hymntitle'>([^;]+)<\/h2>/.exec(pageData)[1];
      let hymnNumber = parseInt(title_number)
      let author = /<.*?>(.*?)<\/.*?>/g.exec(pageData)[4];
      let reg = new RegExp(/<.*?>(.*?)<\/.*?>/g)
      let extracted;
      //  let extracted = pageData.matchAll(/<.*?>(.*?)<\/.*?>/)    //matchAll does not work in node version < 12
      extracted = matchAll(pageData, /<.*?>(.*?)<\/.*?>/g).toArray();
      let result = {}
      let searchFor = [
        'hymntitle', 'Meter:', 'Author:', 'Composer:', 'Arranger:', 'Tune:', 'Name:', 'Key:', 'First Line:', 'Title:', 'Refrain First Line:', 'Publication Date:', 'Scripture:', 'Topic:'
      ]
      let requiredData = {};
      let previousLine = 'nothing previous';
      let tmpDetails = {}
      while ((result = reg.exec(pageData)) !== null) {
        if (searchFor.indexOf(previousLine) !== -1) {
          let innerReg = />([^<](.*))/g;
          try {
            let innerResult = innerReg.exec(result[1])[1]
            if (previousLine === 'Name:') {
              previousLine = 'Tune:'
            }
            innerResult = innerResult.split('[').join('')
            innerResult = innerResult.split(']').join('')
            innerResult = innerResult.replace(/<.*>/g, '')
            tmpDetails[previousLine.replace(":", '')] = innerResult
            let tmpLine = result[1];
            previousLine = result[1];
          } catch (err) {

          }
        } else
          previousLine = result[1];

      }

      tmpDetails['hymnNumber'] = hymnNumber;
      console.log(tmpDetails)
      fs.appendFileSync(`${this.hymnaryHymnal}Header`, this.titleCase(this.decode(JSON.stringify(tmpDetails)) + '\n'));
    } catch (err) {

    }
  }

  decode = (str) => {
    str = str.replace(/&quot;/g, "'")
    return str.replace(/&#(\d+);/g, function (match, dec) {

      return String.fromCharCode(dec);
    });
  }

  titleCase = (str) => {
    return str.replace(/([A-Z])([A-Z]+)([^A-Z]+)/g, function (match, $1, $2, $3) {
      return $1 + $2.toLowerCase() + $3
    })
  }


  exec = async (command) => {
    return new Promise((resolve, reject) => {
      exec(`${command}`, function (error, stdout, stderr) {
        if (error) {
          console.log(error)
          reject(error)
        }
        console.log(stdout)
        console.log(stderr)
        resolve(true)
      });
    })
  }

  getHeaders = async () => {
    try {
      await this.exec(`echo "" > ${this.hymnaryHymnal}Header`)
      // while (this.numbers.length) {
      //   let number = this.numbers.shift();
      //   let url = path.join(this.hymnalUrl, number.toString());
      //   url = url.replace(/:\/([^\/])/, "://$1")
      //   console.log(url)
      //   await this.fetchHymnHeader(url);

      // }
      let promises = this.numbers.map((number) => {
        let url = path.join(this.hymnalUrl, number.toString());
        url = url.replace(/:\/([^\/])/, "://$1")
        // console.log(url)
        try {
          return this.fetchHymnHeader(url);
        } catch (abc) {
          console.log(abc)
        }
      });
      let [err, care] = await to(Promise.all(promises));
    } catch (err) {
      console.log(err)
    }
  }

  checkTitles = async () => {
    return new Promise(async (resolve, reject) => {
      await this.exec(`echo "" > ${this.hymnaryHymnal}-titles`)
      let titles = [],
        titles_ = {};
      let self = this;
      let lineReader = require('readline').createInterface({
        input: require('fs').createReadStream(`${self.hymnaryHymnal}Header`)
      });

      lineReader.on('line', (input) => {
        // console.log(input)
        try {
          let line = JSON.parse(input)
          let {
            Title,
            hymnNumber
          } = line
          if (hymnNumber.toString().length == 1) hymnNumber = '00' + hymnNumber
          if (hymnNumber.toString().length == 2) hymnNumber = '0' + hymnNumber
          // console.log(typeof hymnNumber)
          titles_[`${hymnNumber} ${Title}`] = true;
          // titles.push(`${hymnNumber} ${Title}`)

        } catch (err) {}
      }).on('close', function (line) {
        for (let i in titles_) {
          if (i.trim().length > 0 && i.trim() !== 'undefined')
            titles.push(i)
        }
        fs.appendFileSync(`${self.hymnaryHymnal}-titles`, titles.sort().join('\n'));

        let titles_firstLines_ = []
        lineReader = require('readline').createInterface({
          input: require('fs').createReadStream(`${self.hymnaryHymnal}Title&FirstLines`)
        });
        titles_ = {};
        lineReader.on('line', (input) => {
          // console.log(input)
          try {
            let line_ = input
            titles_[input] = true;
            // titles.push(`${hymnNumber} ${Title}`)

          } catch (err) {}
        }).on('close', function (line) {
          for (let i in titles_) {
            if (i.trim().length > 0 && i.trim() !== 'undefined')
              titles_firstLines_.push(i)
          }
          titles_firstLines_ = titles_firstLines_.sort();
          for (let i in titles_firstLines_) {
            // console.log(i)
            if (titles_firstLines_[i].toLowerCase().trim() !== titles[i].toLowerCase().trim()) {
              console.log(titles_firstLines_[i] + '<-->' + titles[i])
            }
          }
          resolve(true)
        })

      });
    })
  }
  checkTitlesAgain = async () => {
    let getTitles = async (files) => {
      return new Promise(async (resolve, reject) => {
        // await this.exec(`echo "" > ${this.hymnaryHymnal}-titles`)
        let titles = [],
          titles_ = {};
        let self = this;
        let lineReader = require('readline').createInterface({
          input: require('fs').createReadStream(files)
        });

        lineReader.on('line', (input) => {
          // console.log(input)
          try {
            titles_[input] = true;

          } catch (err) {}
        }).on('close', function (line) {
          for (let i in titles_) {
            if (i.trim().length > 0 && i.trim() !== 'undefined')
              titles.push(i.replace(/\n/g, ''))
          }
          resolve(titles)
        })
      })
    }

    return new Promise(async (resolve, reject) => {
      // await this.exec(`echo "" > ${this.hymnaryHymnal}-titles`)
      let self = this;
      let titles = await getTitles(`${self.hymnaryHymnal}-titles`)
      let titles_firstLines_ = await getTitles(`${self.hymnaryHymnal}Title&FirstLines`)
      // console.log(titles_firstLines_)
      let titles_i = []
      let titles_ii = []
      while (titles_firstLines_.length) {
        let i = titles_firstLines_.shift();
        let ii = titles.shift();
        titles_i.push(i)
        titles_ii.push(ii)

        if (i.toLowerCase().trim() !== ii.toLowerCase().trim()) {
          let response = await prompts({
            type: 'text',
            name: 'ans',
            message: `${i}<-->${ii}`,
            initial: 'y'
          });
          if(response.ans==='l'){
            titles_i.pop()
            titles_i.push(ii)
          } else {
            if(response.ans==='r'){
              titles_ii.pop()
              titles_ii.push(i)
            } else{
              if(response.ans==='d'){
                let tmp_i = titles_ii.pop()
                titles_ii.push(i)
                titles_ii.push(tmp_i)
              } 
            }
          }
          while (titles_firstLines_.length) {
            titles_i.push(titles_firstLines_.shift())
          }
          while (titles.length) {
            titles_ii.push(titles.shift())
          }
          fs.writeFileSync(`${self.hymnaryHymnal}Title&FirstLines`, titles_i.join('\n'))
          fs.writeFileSync(`${self.hymnaryHymnal}-titles`, titles_ii.join('\n'))
          titles_i = []
          titles_ii = []
          if(response.ans !== 'y' && response.ans !== 'l' && response.ans !== 'r' && response.ans !== 'd')process.exit();
          titles = await getTitles(`${self.hymnaryHymnal}-titles`)
          titles_firstLines_ = await getTitles(`${self.hymnaryHymnal}Title&FirstLines`)

        }
        // console.log(i)
        // if(titles_firstLines_[i].toLowerCase().trim() !== titles[i].toLowerCase().trim()){
        //   console.log(titles_firstLines_[i] +'<-->'+titles[i].replace())

        // }else {
        //   // console.log(titles_firstLines_[i] +'=============================='+titles[i])
        // }
      }
    })
    //   let lineReader = require('readline').createInterface({
    //     input: require('fs').createReadStream(`${self.hymnaryHymnal}Title&FirstLines`)
    //   });

    //   lineReader.on('line', (input) => {
    //     // console.log(input)
    //     try {
    //       titles_[input] = true;

    //     } catch (err) {}
    //   }).on('close', function (line) {
    //     for (let i in titles_) {
    //       if (i.trim().length > 0 && i.trim() !== 'undefined')
    //         titles.push(i.replace(/\n/g, ''))
    //     }

    //     let titles_firstLines_ = []
    //     lineReader = require('readline').createInterface({
    //       input: require('fs').createReadStream(`${self.hymnaryHymnal}Title&FirstLines`)
    //     });
    //     titles_ = {};
    //     lineReader.on('line', (input) => {
    //       // console.log(input)
    //       try {
    //         let line_ = input
    //         titles_[input] = true;
    //         // titles.push(`${hymnNumber} ${Title}`)

    //       } catch (err) {}
    //     }).on('close', function (line) {
    //       for (let i in titles_) {
    //         if (i.trim().length > 0 && i.trim() !== 'undefined')
    //           titles_firstLines_.push(i.replace('\n', ''))
    //       }
    //       titles_firstLines_ = titles_firstLines_.sort();
    //       // for(let i in titles_firstLines_){
    //       while (titles_firstLines_.length) {
    //         let i = titles_firstLines_.pop();
    //         let ii = titles.pop();
    //         // console.log(i)
    //         if (i.toLowerCase().trim() !== ii.toLowerCase().trim()) {
    //           console.log(i + '<-->' + ii.replace())
    //         }
    //         // if(titles_firstLines_[i].toLowerCase().trim() !== titles[i].toLowerCase().trim()){
    //         //   console.log(titles_firstLines_[i] +'<-->'+titles[i].replace())

    //         // }else {
    //         //   // console.log(titles_firstLines_[i] +'=============================='+titles[i])
    //         // }
    //       }
    //       resolve(true)
    //     })

    //   });
    // })
  }

}

module.exports = {
  hymnalHeaderfromHymnarydotorg
}
