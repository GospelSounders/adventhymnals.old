const to = require('await-to-js').to,
  hymnalHeaderfromHymnarydotorg = require('./hymnalHeaderfromHymnarydotorg').hymnalHeaderfromHymnarydotorg

let main = async () => {
  let [err, care] = await to(new hymnalHeaderfromHymnarydotorg('CHSD1941', 703).getHeaders());
  let [err, care] = await to(new hymnalHeaderfromHymnarydotorg('CSR1908', 951).getHeaders());
  if (err) throw err
  console.log(done)
}

// main()