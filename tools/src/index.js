const program = require('commander');

// require = require('esm')(module /*, options*/);
// const functions = new( require('./adventhymnaltools'))();
import functions from './adventhymnaltools'
import lyricsFunctions from './lyricsFunctions'
functions = new functions();
lyricsFunctions = new lyricsFunctions();

export function run() {
    program
        .version('0.0.1')
        .description('Tools for developing Advent Hymnals');

    program
        .option('-i, --input <file>', 'input file')
        .option('-o, --output <file>', 'output file')
        .option('-r, --root <dir>', 'input files name root')
        .option('-s, --start <integer>', 'input files start number')
        .option('-e, --stop <integer>', 'input files start number')
        .option('-x, --extension <string>', 'input files extension')

    program
        .command('extractvoices')
        .alias('e')
        .description('Extract voices from midi file')
        .action(() => { functions.extractvoices(program)});

    program
        .command('populatelyrics')
        .alias('pl')
        .description('Populate lyrics')
        .action(() => { lyricsFunctions.populatelyrics(program)});


    program
        .command('addContact') // No need of specifying arguments here
        .alias('a')
        .description('Add a contact')
        .action(() => {
            prompt(questions).then(answers =>
                addContact(answers));
        });

    program.parse(process.argv);
}

/*
 node bin/app.js e -i "CiS/2"
 node bin/app.js pl -i "CiS1908" -o 02.christ-in-song -s 2 -e 100
 */