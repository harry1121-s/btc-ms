// import * as assert from 'assert';
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import { describe, it } from 'mocha';
import * as bitcoin from 'bitcoinjs-lib';
// import { randomBytes } from 'crypto-js';

const ECPair = ECPairFactory(ecc);
const TESTNET = bitcoin.networks.testnet;

// Function to generate a key pair
function generateKeyPair() {
    return ECPair.makeRandom({ network: TESTNET });
}

// Function to generate a P2WSH Multisig Address
function createMultisigAddress(pubkeys: Buffer[], m: number): string {
    const witnessScript = bitcoin.payments.p2ms({ m, pubkeys, network: TESTNET }).output;
    if (!witnessScript) throw new Error('Failed to generate witness script');

    const p2wsh = bitcoin.payments.p2wsh({ redeem: { output: witnessScript }, network: TESTNET });

    return p2wsh.address!;
}

describe('Address generation', () => {
    it('Create 3-of-4 P2WSH Multisig Address', () => {
        // Generate 4 key pairs
        const keys = [generateKeyPair(), generateKeyPair(), generateKeyPair(), generateKeyPair()];
        const pubkeys = keys.map(key => key.publicKey);

        // console.log("Generated Public Keys:", pubkeys.map(pk => pk.toString('hex')));
        console.log("Keys 0", keys[0]);
        console.log("Keys 0", pubkeys[0]);

        // Generate a 3-of-4 multisig P2WSH address
        // const multisigAddress = createMultisigAddress(pubkeys, 3);

        // console.log("Generated 3-of-4 P2WSH Address:", multisigAddress);

        // // Ensure address is valid
        // assert.ok(multisigAddress, "Address generation failed");
    });
});