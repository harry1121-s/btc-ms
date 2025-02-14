const { expect } = require("chai");
const { ethers } = require("hardhat");
const btcSig = require("../src/bitcoinSignatureGenETH.js");

describe("BitcoinSignatureVerifier", function () {
    let verifier;
    let owner;

    beforeEach(async function () {
        // Deploy the contract
        const BitcoinSignatureVerifier = await ethers.getContractFactory("BitcoinSignatureVerifier");
        verifier = await BitcoinSignatureVerifier.deploy();
        await verifier.deployed();
        [owner] = await ethers.getSigners();
    });

    describe("Single Signature Verification", function () {
        it("Should verify a valid Bitcoin signature", async function () {
            // Generate signature data
            const sigData = btcSig.demonstrateEthereumSignature();

            // Convert hex strings to proper format if they don't start with '0x'
            const messageHashHex = sigData.messageHashHex.startsWith('0x') ? 
                sigData.messageHashHex : '0x' + sigData.messageHashHex;
            const signatureHex = sigData.signatureHex.startsWith('0x') ? 
                sigData.signatureHex : '0x' + sigData.signatureHex;
            const publicKeyHex = sigData.publicKeyHex;  // Already properly formatted

            console.log('Public key:', publicKeyHex);

            // Verify the signature
            const isValid = await verifier.verifyBitcoinSignature(
                messageHashHex,
                signatureHex,
                publicKeyHex
            );
            console.log('isValid:', isValid);
            expect(isValid).to.be.true;
        });

        /*
        it("Should reject an invalid signature", async function () {
            const sigData = btcSig.demonstrateEthereumSignature();
            
            const messageHashHex = ethers.utils.hexlify(sigData.messageHashHex);
            const publicKeyHex = ethers.utils.hexlify(sigData.publicKeyHex);
            
            // Create invalid signature by modifying the last byte
            const signatureHex = ethers.utils.hexlify(sigData.signatureHex.slice(0, -2) + '00');
            
            const isValid = await verifier.verifyBitcoinSignature(
                messageHashHex,
                signatureHex,
                publicKeyHex
            );

            expect(isValid).to.be.false;
        });

        it("Should reject if message hash doesn't match", async function () {
            const sigData1 = btcSig.demonstrateEthereumSignature();
            const sigData2 = btcSig.demonstrateEthereumSignature();

            const messageHashHex = ethers.utils.hexlify(sigData2.messageHashHex);
            const signatureHex = ethers.utils.hexlify(sigData1.signatureHex);
            const publicKeyHex = ethers.utils.hexlify(sigData1.publicKeyHex);

            const isValid = await verifier.verifyBitcoinSignature(
                messageHashHex,
                signatureHex,
                publicKeyHex
            );

            expect(isValid).to.be.false;
        });

        it("Should verify multiple valid signatures", async function () {
            const sigData1 = btcSig.demonstrateEthereumSignature();
            const sigData2 = btcSig.demonstrateEthereumSignature();
            const sigData3 = btcSig.demonstrateEthereumSignature();

            const messageHash = ethers.utils.hexlify(sigData1.messageHashHex);
            
            const signatures = [
                ethers.utils.hexlify(sigData1.signatureHex),
                ethers.utils.hexlify(sigData2.signatureHex),
                ethers.utils.hexlify(sigData3.signatureHex)
            ];
            
            const publicKeys = [
                ethers.utils.hexlify(sigData1.publicKeyHex),
                ethers.utils.hexlify(sigData2.publicKeyHex),
                ethers.utils.hexlify(sigData3.publicKeyHex)
            ];

            const areValid = await verifier.verifyMultipleSignatures(
                messageHash,
                signatures,
                publicKeys
            );

            expect(areValid).to.be.true;
        });

        it("Should reject if any signature is invalid", async function () {
            const sigData1 = btcSig.demonstrateEthereumSignature();
            const sigData2 = btcSig.demonstrateEthereumSignature();
            
            const messageHash = ethers.utils.hexlify(sigData1.messageHashHex);
            const invalidSig = ethers.utils.hexlify(sigData1.signatureHex.slice(0, -2) + '00');
            
            const signatures = [
                ethers.utils.hexlify(sigData1.signatureHex),
                invalidSig
            ];
            const publicKeys = [
                ethers.utils.hexlify(sigData1.publicKeyHex),
                ethers.utils.hexlify(sigData2.publicKeyHex)
            ];

            const areValid = await verifier.verifyMultipleSignatures(
                messageHash,
                signatures,
                publicKeys
            );

            expect(areValid).to.be.false;
        });

        it("Should revert with mismatched array lengths", async function () {
            const sigData = btcSig.demonstrateEthereumSignature();
            
            const messageHash = ethers.utils.hexlify(sigData.messageHashHex);
            const signature = ethers.utils.hexlify(sigData.signatureHex);
            const publicKey = ethers.utils.hexlify(sigData.publicKeyHex);

            await expect(
                verifier.verifyMultipleSignatures(
                    messageHash,
                    [signature, signature], // 2 signatures
                    [publicKey] // 1 public key
                )
            ).to.be.revertedWith("Array lengths must match");
        });
        */
    });

    // describe("Error Handling", function () {
    //     it("Should revert with invalid signature length", async function () {
    //         const sigData = btcSig.demonstrateEthereumSignature();
            
    //         const messageHash = ethers.utils.hexlify(sigData.messageHashHex);
    //         const invalidSig = ethers.utils.hexlify(sigData.signatureHex.slice(0, -8)); // Make signature too short
    //         const publicKey = ethers.utils.hexlify(sigData.publicKeyHex);

    //         await expect(
    //             verifier.verifyBitcoinSignature(
    //                 messageHash,
    //                 invalidSig,
    //                 publicKey
    //             )
    //         ).to.be.revertedWith("Invalid signature length");
    //     });
    // });
});
