const Crypto = require('crypto');
const bigInt = require('big-integer');
const fs = require('fs');

const saveKey = (mode) => (num, n) => {
    [num, n] = [num.toString(16), n.toString(16)];
    if (mode === 'open') {
        const json = JSON.stringify({
            'n': n,
            'e': num
        });
        fs.writeFile('_open.json', json, (err) => {
            console.log(err);
        });
    } else if (mode === 'private') {
        const json = JSON.stringify({
            'n': n,
            'd': num
        });
        fs.writeFile('_private.json', json, (err) => {
            console.log(err);
        });
    }
    return;
};

const enc = (e, n) => (code) => bigInt(code).modPow(e, n);

const dec = (d, n) => (code) => bigInt(code).modPow(d, n);

const p = bigInt(Crypto.createDiffieHellman(16).getPrime('hex'), 16);
const q = bigInt(Crypto.createDiffieHellman(16).getPrime('hex'), 16);
const n = p.multiply(q);
const f = p.minus(1).multiply(q.minus(1));
const e = bigInt(Crypto.createDiffieHellman(512).getPrime('hex'), 16);
const d = bigInt(e).modInv(f);

const messageToDigit = (message) => message.split('').map(e => e.charCodeAt()).join('');

const messageToBlocks = (message, sep = n.bitLength().toString()) => {
    const digitMsg = messageToDigit(message);
    const blocks = [];
    let state = '';
    for (let i = 0; i < digitMsg.length; i++) {
        if (digitMsg[i + 1] === undefined) {
            state += digitMsg[i];
            blocks.push(state);
            break;
        }
        if (parseInt(state.concat(digitMsg[i + 1])) > sep) {
            blocks.push(state);
            state = '';
        }
        state += digitMsg[i];
    }
    return blocks;
};

const blocksToMessage = (digitMsg, sep = n.bitLength().toString()) => {
    digitMsg = digitMsg.join('');
    const blocks = [];
    let state = '';
    for (let i = 0; i < digitMsg.length; i++) {
        if (digitMsg[i+1] === undefined) {
            state += digitMsg[i];
            blocks.push(state);
            break;
        }
        if (parseInt(state) >= sep) {
            blocks.push(state);
            state = '';
        }
        state += digitMsg[i];
    }
    return blocks;
};


module.exports = {
    'e' : e,
    'd' : d,
    'n' : n,
    'enc': enc(e,n),
    'dec' : dec(d,n),
    'savePrivateKey': saveKey('private'),
    'saveOpenKey': saveKey('open'),
    'messageToBlocks': messageToBlocks,
    'blocksToMessage': blocksToMessage
};