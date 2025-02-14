const bitcoin = require('bitcoinjs-lib');
const ECPairFactory = require('ecpair').default;
const ecc = require('tiny-secp256k1');
const crypto = require('crypto');

const ECPair = ECPairFactory(ecc);
const NETWORK = bitcoin.networks.testnet;

// Generate a random message hash
function generateMessageHash() {
    const message = crypto.randomBytes(32);
    return bitcoin.crypto.sha256(message);
}

// Create a P2WPKH address from a public key
function createP2WPKHAddress(publicKey) {
    const p2wpkh = bitcoin.payments.p2wpkh({
        pubkey: Buffer.from(publicKey),
        network: NETWORK
    });
    return p2wpkh.address;
}

// Sign a message hash with a key pair
function signMessage(messageHash, keyPair) {
    // Sign the message hash
    const signature = keyPair.sign(messageHash);
    
    // Convert to r, s, v format
    const r = Buffer.from(signature.slice(0, 32));
    const s = Buffer.from(signature.slice(32, 64));
    const v = signature[64] + 27; // Convert recovery param to Ethereum format
    
    // Concatenate r, s, v
    const ethSignature = Buffer.concat([r, s, Buffer.from([v])]);
    
    return {
        signature: ethSignature,
        publicKey: keyPair.publicKey,
        address: createP2WPKHAddress(keyPair.publicKey)
    };
}

// Verify a signature against a message hash and address
function verifySignature(messageHash, derSignature, publicKey, address) {
    try {
        // Decode the DER signature
        const signature = bitcoin.script.signature.decode(derSignature);
        
        // Create ECPair from public key for verification
        const verifyingKey = ECPair.fromPublicKey(publicKey);
        
        // Verify the signature
        const isValid = verifyingKey.verify(messageHash, signature.signature);
        
        // Verify the address matches the public key
        const generatedAddress = createP2WPKHAddress(publicKey);
        const addressMatches = address === generatedAddress;
        
        return isValid && addressMatches;
    } catch (error) {
        console.error('Verification error:', error);
        return false;
    }
}

// Example usage
function demonstrateSignatureVerification() {
    // Generate a random key pair
    const keyPair = ECPair.makeRandom({ network: NETWORK });
    
    // Generate a random message hash
    const messageHash = generateMessageHash();
    
    // Sign the message
    const { signature, publicKey, address } = signMessage(messageHash, keyPair);
    
    // Verify the signature
    const isValid = verifySignature(messageHash, signature, publicKey, address);
    
    console.log('Message Hash:', messageHash.toString('hex'));
    console.log('Address:', address);
    console.log('Signature valid:', isValid);
    
    // Test with wrong message hash
    const wrongHash = generateMessageHash();
    const isInvalid = verifySignature(wrongHash, signature, publicKey, address);
    console.log('Verification with wrong hash:', isInvalid);
}

// Run the demonstration
demonstrateSignatureVerification();

module.exports = {
    generateMessageHash,
    signMessage,
    verifySignature,
    createP2WPKHAddress
};
