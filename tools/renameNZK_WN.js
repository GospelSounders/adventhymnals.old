let axios = require('axios'),
    to = require('await-to-js').to,
    util = require('util'),
    exec = util.promisify(require('child_process').exec);
const fs = require('fs-extra');
const path = require('path');

let allTitles = []
let missing = []
const main = async () => {
    return new Promise(async resolve => {
        // let filesList = (await exec(`du -a NZK_own`)).stdout.split(/\n/).filter(item => item.match(/\.txt$/)).map(item => item.replace(/.*\t/, ''));
        // filesList.map(fileName => {
        //     let num = fileName.match(/([0-9]{3})/)[1]
        //     exec(`mv "${fileName}" "./${num}.txt"`)
        //     console.log( `mv "${fileName}" "NZK_own/${num}.txt"`)
        //     // console.log(num)
        // })

        // let filesList = (await exec(`du -a WN_own`)).stdout.split(/\n/).filter(item => item.match(/\.txt$/)).map(item => item.replace(/.*\t/, ''));
        // filesList.map(fileName => {
        //     let num = fileName.match(/([0-9]+)\./)[1]
        //     while (num.length < 3) num = `0${num}`
        //     exec(`mv "${fileName}" "./WN_own\\${num}.txt"`)
        //     console.log(`mv "${fileName}" "WN_own/${num}.txt"`)
        //     // console.log(num)
        // })

        let filesList = (await exec(`du -a ./`)).stdout.split(/\n/).filter(item => item.match(/\.txt$/) && item.match(/WN_own/)).map(item => item.replace(/.*\t/, ''));
        filesList.map(fileName => {
           
            let num = fileName.match(/([0-9]{3}\.txt)/)[1]
            // console.log(fileName, num)
            // let num = fileName.match(/([0-9]+)\./)[1]
            // while (num.length < 3) num = `0${num}`
            exec(`cp "${fileName}" "./WN_own/${num}"`)
            console.log(`cp "${fileName}" "./WN_own/${num}"`)
            // console.log(num)
        })
    })
}

main()
