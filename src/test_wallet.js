const bitcoin = require('bitcoinjs-lib');
const { test } = require('mocha');
const ECPairFactory = require('ecpair').default;
const ecc = require('tiny-secp256k1');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const ECPair = ECPairFactory(ecc);
const NETWORK = bitcoin.networks.testnet;

async function test_user() {
    const keyPair = ECPair.fromWIF(process.env.privateKeyWIF, NETWORK);
    console.log(keyPair);
    const { address } = bitcoin.payments.p2wpkh({ pubkey: Buffer.from(keyPair.publicKey), network: NETWORK, });
    console.log("Address: ", address);

    userInfo = await fetch_user_info(address);
    // console.log(userInfo);
    // console.log(userInfo.txrefs[0].tx_hash);
    // const tx_ref = userInfo.txrefs
    txInfo = await fetch_tx_info(userInfo.txrefs[0].tx_hash);
    console.log(txInfo);
};

async function fetch_user_info(address) {
    try {
        const url = `https://api.blockcypher.com/v1/btc/test3/addrs/${address}?unspentOnly=true?includeScript=true`;
        const response = await axios.get(url);
        
        if (response.data) {
            return response.data; // Balance in satoshis
        }
    } catch (error) {
        console.error("Error fetching information:", error.response ? error.response.data : error.message);
    }
}

async function fetch_tx_info(tx_hash) {
    try {
        const url = `https://api.blockcypher.com/v1/btc/test3/txs/${tx_hash}?includeHex=true`;
        const response = await axios.get(url);
        
        if (response.data) {
            return response.data; // Balance in satoshis
        }
    } catch (error) {
        console.error("Error fetching information:", error.response ? error.response.data : error.message);
    }
}


test_user();
// describe('Testing BTC', () => {
//     it('Can read users balance', () =>{
//         const keyPair = ECPair.fromWIF(process.env.privateKeyWIF, network);
//         const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
//         console.log("Address: ", address);
//     })
// })

// async function createTransaction(
//     privateKeyWIF, 
//     previousTxid, 
//     receiverAddress, 
//     previousHex
//     ) {
    
//     //  take the WIF-encoded private key (privateKeyWIF) and network information 
//     // and create a keyPair that we'll use for signing the transaction
//         const keyPair = ECPair.fromWIF(privateKeyWIF, network);
    
//     // create a transaction builder and pass the network. The bitcoin-js 
//     // Psbt class is used to do this. 
//         const txb = new bitcoin.Psbt({ network });
        
//     // while these are default version and locktime values, you can set 
//     // custom values depending on your transaction
//         txb.setVersion(2);
//         txb.setLocktime(0);
    
//     // add inputs: previous transaction Id, output index of the funding transaction
//     // and, since this is a non segwit input, we must also pass the full previous 
//     // transaction hex as a buffer 
//         txb.addInput({
//             hash: previousTxid,
//             index: 0,
//             nonWitnessUtxo: Buffer.from(previousHex, 'hex'),
//         });
    
//     // add outputs as the buffer of receiver's address and the value with amount
//     // of satoshis you're sending.
//         txb.addOutput({
//             script: Buffer.from(receiverAddress, 'hex'),
//             value: 20000,
//         }); // Sending 0.0002 BTC
    
//     // sign with the generate keyPair and finalize the transansction 
//         txb.signInput(0, keyPair);
//         txb.finalizeAllInputs();
    
//     //  extract the transaction and get the raw hex serialization
//         const tx = txb.extractTransaction();
//         return tx.toHex();
//     }
    
//     // this calls and executes the function above and then prints 
//     // the transaction hex
//     createTransaction(privateKeyWIF, previousTxid, previousHex, myAddress)
//         .then((transactionHex) => {
//             console.log('Transaction Hex:', transactionHex);
//         })
//         .catch((error) => {
//             console.error('Error:', error.message);
//         });