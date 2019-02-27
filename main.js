const minimist = require('minimist');
const args = minimist(process.argv.slice(2));
const fs = require('fs');
const _ = require('./rsa');

const main = (args) => {
    if (args['help']) {
        const consoleMessages = {
            '--generate': 'Сгенерировать открытый и закрытый ключ',
            '--in': 'Путь к входному файлу',
            '--e': 'зашифровать',
            '--d': 'Расшифровать',
            '--help': 'Справочная информация',
        };
        Object.keys(consoleMessages).forEach((el) => {
            console.log(`${el}: `, `${consoleMessages[el]}`, '\n');
        });
        process.exit();
    }
    if (args['generate']) {
        _.saveOpenKey();
        _.savePrivateKey();
    }

    let fileIn = null;
    if (args['in']) {
        fileIn = args['in'];
    }

    if (args['e']) {
        const openKey = JSON.parse(fs.readFileSync(__dirname + '/_open.json', { encoding: 'utf-8' }));
        const e = _.hexToDec(openKey['e']);
        const n = _.hexToDec(openKey['n']);
        const privateKey = JSON.parse(fs.readFileSync(__dirname + '/_private.json', { encoding: 'utf-8' }));
        const d = _.hexToDec(privateKey['d']);
        fs.readFile(fileIn, { encoding: 'utf-8' }, (err, message) => {
            if (err) {
                console.log(err);
                process.exit(1);
            }
            message = _.encMessage(message)(e, n, d);
            fs.writeFile(__dirname + '/enc.txt', message, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('OK file enc.txt has generated');
                }
            });
        });
    }

    if (args['d']) {
        const privateKey = JSON.parse(fs.readFileSync(__dirname + '/_private.json', { encoding: 'utf-8' }));
        const d = _.hexToDec(privateKey['d']);
        const n = _.hexToDec(privateKey['n']);
        fs.readFile(fileIn, { encoding: 'utf-8' }, (err, message) => {
            if (err) {
                console.log(err);
                process.exit(1);
            }
            message = _.decMessage(message)(d, n);
            fs.writeFile(__dirname + '/dec.txt', message, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('OK file dec.txt has generated');
                }
            });
        });
    }
};

main(args);