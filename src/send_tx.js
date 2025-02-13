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
    const keyPair = ECPair.fromWIF(process.env.privateKeyWIF, NETWORK);
    const { address: senderAddress, output: senderScript } = bitcoin.payments.p2wpkh({ pubkey: Buffer.from(keyPair.publicKey), network: NETWORK, });
    console.log("Address: ", senderAddress);
    console.log("senderScript: ", senderScript);

    const utxo = await fetchUTXO(senderAddress);
    
    const receiverAddress = 'tb1qa5y6kx2rmy7jhhddp5cp92mvkxl0mj5lwegner';
    fee = 150;
    const sendAmount = 820;

    psbt = createTransaction(senderScript, utxo, fee, receiverAddress, sendAmount);

    console.log(psbt);
    return
    psbt.signInput(0, {
        publicKey: Buffer.from(keyPair.publicKey),
        sign: (hash) => {
            const signature = keyPair.sign(hash);
            return Buffer.from(signature); 
        },
    });
    psbt.finalizeAllInputs();

    console.log(psbt);


    const rawTxHex = psbt.extractTransaction().toHex();
    console.log('Raw Transaction Hex:', rawTxHex);

    // //broadcasting now 
    broadcastTransaction(rawTxHex);

};

function createTransaction(senderScript, utxo, fee, recipientAddress, sendAmount) {
    psbt = new bitcoin.Psbt({ NETWORK });
    psbt.setVersion(2);
    psbt.setLocktime(0);
    console.log(utxo)
    psbt.addInput({
        hash: utxo.txId,
        index: utxo.vout,
        witnessUtxo: {
            script: Buffer.from(senderScript, 'hex'),
            value: utxo.value,
        }
    });
    

    psbt.addOutput({
        script: getScriptPubKey(recipientAddress, NETWORK),
        value: sendAmount,
    });

    psbt.addOutput({
        script: Buffer.from(senderScript, 'hex'),
        value: utxo.value - sendAmount - fee,
    })
    return psbt;
}

async function fetchUTXO(address) {
    try {
        const response = await axios.get(`https://blockstream.info/testnet/api/address/${address}/utxo`);
        if (!response.data.length) throw new Error("No UTXOs found for this address.");

        // ✅ Select the first available UTXO
        const utxo = response.data[0];  

        return {
            txId: utxo.txid,
            vout: utxo.vout,
            value: utxo.value
        };
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

// function fromBech32(address) {
//   let result;
//   let version;
//   try {
//     result = bech32_1.bech32.decode(address);
//   } catch (e) {}
//   if (result) {
//     version = result.words[0];
//     if (version !== 0) throw new TypeError(address + ' uses wrong encoding');
//   } else {
//     result = bech32_1.bech32m.decode(address);
//     version = result.words[0];
//     if (version === 0) throw new TypeError(address + ' uses wrong encoding');
//   }
//   const data = bech32_1.bech32.fromWords(result.words.slice(1));
//   return {
//     version,
//     prefix: result.prefix,
//     data: Buffer.from(data),
//   };
// }

function getScriptPubKey(address, network) {
    const { data } = bitcoin.address.fromBech32(address); // Decode Bech32
    const scriptPubKey = bitcoin.script.compile([bitcoin.opcodes.OP_0, data]); // OP_0 <HASH>

    console.log('🚀 scriptPubKey (Hex):', scriptPubKey.toString('hex'));
    return scriptPubKey;
}

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
};

test_send();