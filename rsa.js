const Crypto = require('crypto');
const bigInt = require('big-integer');
const fs = require('fs');

const saveKey = (mode) => (num, n) => () => {
    [num, n] = [num.toString(16), n.toString(16)];
    if (mode === 'open') {
        const json = JSON.stringify({
            'n': n,
            'e': num
        });
        fs.writeFile('_open.json', json, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log('public key has generated');
            }

        });
    } else if (mode === 'private') {
        const json = JSON.stringify({
            'n': n,
            'd': num
        });
        fs.writeFile('_private.json', json, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log('private key has generated');
            }
        });
    }
    return;
};

const p = bigInt(Crypto.createDiffieHellman(128).getPrime('hex'), 16);
const q = bigInt(Crypto.createDiffieHellman(128).getPrime('hex'), 16);
const n = p.multiply(q);
const f = p.minus(1).multiply(q.minus(1));
const d = bigInt(Crypto.createDiffieHellman(2048).getPrime('hex'), 16);
const e = bigInt(d).modInv(f);
const delemiter = 100000;

const messageToDigit = (message) => message.split('').map(e => e.charCodeAt());

const enc = (e, n) => (code) => bigInt(code).modPow(e, n);

const dec = (d, n) => (code) => bigInt(code).modPow(d, n);

const messageToBlocks = (message, sep) => message.map(el => bigInt(el).multiply(sep.divide(delemiter)));

const blocksToMessage = (message, sep) => message.map(el => bigInt(el).multiply(delemiter).divide(sep).plus(1));

const encMessage = (message) => (key, n) => {
    message = messageToDigit(message);
    const blocks = messageToBlocks(message, n);
    const enycrypt = blocks.map((el) => enc(key, n)(el)).join(',');
    return enycrypt;
};

const decMessage = (message) => (key, n) => {
    message = message.split(',').map(el => dec(key, n)(el));
    const blocks = blocksToMessage(message, n).map(el => String.fromCharCode(el)).join('');
    return blocks;
};

const hexToDec = (val) => bigInt(val, 16);

module.exports = {
    'savePrivateKey': saveKey('private')(d, n),
    'saveOpenKey': saveKey('open')(e, n),
    'encMessage': encMessage,
    'decMessage': decMessage,
    'hexToDec': hexToDec
};