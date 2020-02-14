let axios = require('axios'),
  to = require('await-to-js').to,
  util = require('util'),
  exec = util.promisify(require('child_process').exec),
  path = require('path');
const fs = require('fs-extra');
const matchAll = require("match-all");

class hymnalHeaderfromHymnarydotorg {
  constructor(hymnaryHymnal, numSongsinHymnal) {
    let self = this;
    self.hymnaryHymnal = hymnaryHymnal
    self.hymnalUrl = `https://hymnary.org/hymn/${hymnaryHymnal}`
    self.numbers = [];

    if (isNaN(numSongsinHymnal)) throw `invalid numSongsinHymnal: ${numSongsinHymnal}`
    let i = 0;
    while (++i <= numSongsinHymnal) {
      self.numbers.push(i)
    }
  }

  fetchHymnHeader = async (url) => {
    let [err, hymnPage] = await to(axios.get(url))
    let title, title_number;
    hymnPage = hymnPage.data
    await this.getFromOnline(hymnPage)
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
      fs.appendFileSync(`${this.hymnaryHymnal}Header`, this.decode(JSON.stringify(tmpDetails)) + '\n');
    } catch (err) {

    }
  }

  decode = function (str) {
    return str.replace(/&#(\d+);/g, function (match, dec) {
      return String.fromCharCode(dec);
    });
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
      let promises = this.numbers.map( (number) => {
        let url = path.join(this.hymnalUrl, number.toString());
        console.log(url)
        return this.fetchHymnHeader(url);
      });
      [err, care] = await to(Promise.all(promises));
    } catch (err) {
      console.log(err)
    }
  }

}

module.exports = {
  hymnalHeaderfromHymnarydotorg
}
