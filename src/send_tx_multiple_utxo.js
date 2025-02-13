const bitcoin = require('bitcoinjs-lib');
const { test } = require('mocha');
const ECPairFactory = require('ecpair').default;
const ecc = require('tiny-secp256k1');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const bech32_1 = require('bech32');

const ECPair = ECPairFactory(ecc);
const NETWORK = bitcoin.networks.testnet;


async function test_send() {
    const keyPair = ECPair.fromWIF(process.env.privateKeyWIF2, NETWORK);
    const { address: senderAddress, output: senderScript } = bitcoin.payments.p2wpkh({ pubkey: Buffer.from(keyPair.publicKey), network: NETWORK });
    console.log("Address: ", senderAddress);
    console.log("senderScript: ", senderScript);

    const rawUTXOs = await fetchUTXOs(senderAddress);
    console.log(rawUTXOs[0].txid)
    let utxos = []
    for(let i in rawUTXOs){
        utxos[i] = {
            txid: rawUTXOs[i].txid, 
            vout: rawUTXOs[i].vout, 
            value: rawUTXOs[i].value
        }
    };
    console.log(utxos)

    let totalAmount = 0;
    utxos.forEach(utxo => {
        totalAmount += utxo.value
        console.log(utxo.txid, utxo.vout);

    })
    
    const receiverAddress = 'tb1qgcca8z853glnmreum0rkqqj68gh8jzcxf508gy';
    fee = 200;
  
    psbt = createTransaction(senderScript, utxos, fee, receiverAddress, totalAmount-fee);

    console.log(psbt);
    utxos.forEach((_, index) => {
        psbt.signInput(index, {
            publicKey: Buffer.from(keyPair.publicKey),
            sign: (hash) => {
                const signature = keyPair.sign(hash);
                return Buffer.from(signature); 
            },
        });
    });
   
    psbt.finalizeAllInputs();

    console.log(psbt);


    const rawTxHex = psbt.extractTransaction().toHex();
    console.log('Raw Transaction Hex:', rawTxHex);

    // //broadcasting now 
    broadcastTransaction(rawTxHex);

};

function createTransaction(senderScript, utxos, fee, recipientAddress, sendAmount) {
    console.log('utxosss')
    psbt = new bitcoin.Psbt({ NETWORK });
    
    utxos.forEach(utxo => {
        psbt.addInput({
            hash: utxo.txid,
            index: utxo.vout,
            witnessUtxo: {
                script: Buffer.from(senderScript, 'hex'), // Proper script
                value: utxo.value,
            }
        });
    });
    let totalAmount = 0;
    utxos.forEach(utxo => {
        totalAmount += utxo.value
    })
    

    psbt.addOutput({
        script: getScriptPubKey(recipientAddress, NETWORK),
        value: sendAmount,
    });
    if(totalAmount-sendAmount-fee > 0){
        psbt.addOutput({
            script: Buffer.from(senderScript, 'hex'),
            value: totalAmount - sendAmount - fee,
        })
    }
    console.log(totalAmount, sendAmount, fee)
    return psbt;
}

async function fetchUTXOs(address) {
    try {
        const response = await axios.get(`https://blockstream.info/testnet/api/address/${address}/utxo`);
        if (!response.data.length) throw new Error("No UTXOs found for this address.");

        // ✅ Select all available UTXO
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching UTXO:', error.message);
        process.exit(1);
    }
}

async function broadcastTransaction(rawTxHex) {
    try {
        const response = await axios.post('https://blockstream.info/testnet/api/tx', rawTxHex, {
            headers: { 'Content-Type': 'text/plain' }
        });
        console.log('Transaction broadcasted successfully!', response.data);
    } catch (error) {
        console.error('Error broadcasting transaction:', error.response ? error.response.data : error.message);
    }
}

function getScriptPubKey(address, network) {
    const { data } = bitcoin.address.fromBech32(address); // Decode Bech32
    const scriptPubKey = bitcoin.script.compile([bitcoin.opcodes.OP_0, data]); // OP_0 <HASH>

    console.log('🚀 scriptPubKey (Hex):', scriptPubKey.toString('hex'));
    return scriptPubKey;
}

test_send();