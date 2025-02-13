const bitcoin = require('bitcoinjs-lib');
const { test } = require('mocha');
const ECPairFactory = require('ecpair').default;
const ecc = require('tiny-secp256k1');
const axios = require('axios');
const dotenv = require('dotenv');

const ECPair = ECPairFactory(ecc);
const NETWORK = bitcoin.networks.testnet;

function generateKeyPair() {
    return ECPair.makeRandom({ network: TESTNET })
}

function createMultisigAddress(pubkeys, m) {
    const witnessScript = bitcoin.payments.p2ms({ m, pubkeys, network: TESTNET }).output;
    if (!witnessScript) throw new Error('Failed to generate witness script');

    const p2wsh = bitcoin.payments.p2wsh({ redeem: { output: witnessScript }, network: TESTNET });

    return p2wsh.address;
}

