const bitcoin = require('bitcoinjs-lib');
const ECPairFactory = require('ecpair').default;
const ecc = require('tiny-secp256k1');
const crypto = require('crypto');

const ECPair = ECPairFactory(ecc);
const NETWORK = bitcoin.networks.testnet;

/**
 * Generate a random message hash
 * @returns {Buffer} 32-byte message hash
 */
function generateMessageHash() {
    const message = crypto.randomBytes(32);
    return bitcoin.crypto.sha256(message);
}

/**
 * Create a Bitcoin P2WPKH address from a public key
 * @param {Buffer} publicKey - The public key buffer
 * @returns {string} Bitcoin P2WPKH address
 */
function createP2WPKHAddress(publicKey) {
    const p2wpkh = bitcoin.payments.p2wpkh({
        pubkey: Buffer.from(publicKey),
        network: NETWORK
    });
    return p2wpkh.address;
}

/**
 * Sign a message hash and format it for Ethereum verification
 * @param {Buffer} messageHash - 32-byte message hash to sign
 * @param {ECPair} keyPair - Bitcoin key pair to sign with
 * @returns {Object} Signature data formatted for Ethereum verification
 */
function signMessageForEthereum(messageHash, keyPair) {
    // Sign the message hash
    const signature = keyPair.sign(messageHash);
    
    // Convert to r, s, v format for Ethereum
    const r = Buffer.from(signature.slice(0, 32));
    const s = Buffer.from(signature.slice(32, 64));
    const v = signature[64] + 27; // Convert recovery param to Ethereum format
    
    // Concatenate r, s, v into a single 65-byte signature
    const ethSignature = Buffer.concat([r, s, Buffer.from([v])]);
    
    // Convert public key to proper hex format
    const publicKeyArray = Array.from(keyPair.publicKey);
    const cleanPublicKey = publicKeyArray
        .map(num => num.toString(16).padStart(2, '0'))
        .join('');
    
    return {
        signature: ethSignature,
        publicKey: keyPair.publicKey,
        address: createP2WPKHAddress(keyPair.publicKey),
        // Add hex strings for easy use with web3
        signatureHex: '0x' + ethSignature.toString('hex'),
        messageHashHex: '0x' + messageHash.toString('hex'),
        publicKeyHex: '0x' + cleanPublicKey
    };
}

/**
 * Demonstrate the signature generation process
 */
function demonstrateEthereumSignature() {
    // Generate a random key pair
    const keyPair = ECPair.makeRandom({ network: NETWORK });
    
    // Generate a random message hash
    const messageHash = generateMessageHash();
    
    // Sign the message
    const signatureData = signMessageForEthereum(messageHash, keyPair);
    
    console.log('Message Hash (hex):', signatureData.messageHashHex);
    console.log('Bitcoin Address:', signatureData.address);
    console.log('Signature (hex):', signatureData.signatureHex);
    console.log('Public Key (hex):', signatureData.publicKeyHex);
    
    return signatureData;
}

// Example usage
if (require.main === module) {
    console.log('Generating Ethereum-compatible signature from Bitcoin key...\n');
    demonstrateEthereumSignature();
}

module.exports = {
    generateMessageHash,
    signMessageForEthereum,
    createP2WPKHAddress,
    demonstrateEthereumSignature
}; 