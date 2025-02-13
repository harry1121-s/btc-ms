const bitcoin = require('bitcoinjs-lib');
const { test } = require('mocha');
const ECPairFactory = require('ecpair').default;
const ecc = require('tiny-secp256k1');
const axios = require('axios');
const dotenv = require('dotenv');

const ECPair = ECPairFactory(ecc);
const NETWORK = bitcoin.networks.testnet;

function generateKeyPair() {
    return ECPair.makeRandom({ network: NETWORK })
}

function createMultisigAddress(pubkeys, m) {
    const witnessScript = bitcoin.payments.p2ms({ m, pubkeys, network: NETWORK }).output;
    if (!witnessScript) throw new Error('Failed to generate witness script');

    const p2wsh = bitcoin.payments.p2wsh({ redeem: { output: witnessScript }, network: NETWORK });
    return p2wsh.address;
}

function multisig() {
    keyPairs = [generateKeyPair(), generateKeyPair(), generateKeyPair(), generateKeyPair()];
    const pubKeys = keyPairs.map(keyPair =>Buffer.from( keyPair.publicKey), 'hex');
    console.log(pubKeys);
    multisigAddress = createMultisigAddress(pubKeys, 3);
    console.log("MultiSig Address: ", multisigAddress);
}

multisig();

