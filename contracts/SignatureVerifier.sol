// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract BitcoinSignatureVerifier {
    // Prefix for Bitcoin message signing
    // bytes constant PREFIX = "\x18Bitcoin Signed Message:\n32";
    
    /**
     * @dev Verifies a Bitcoin-style ECDSA signature
     * @param messageHash The 32-byte hash of the original message
     * @param signature The signature in compact format (65 bytes: r[32] || s[32] || v[1])
     * @param expectedSigner The expected Bitcoin public key that signed the message
     * @return bool True if the signature is valid, false otherwise
     */
    function verifyBitcoinSignature(
        bytes32 messageHash,
        bytes memory signature,
        bytes memory expectedSigner
    ) public pure returns (bool) {
        console.logBytes32(messageHash);
        console.logBytes(signature);
        console.logBytes(expectedSigner);
        
        require(signature.length == 65, "Invalid signature length");
        require(expectedSigner.length == 33 || expectedSigner.length == 65, "Invalid public key length");

        // Split the signature into r, s, v components
        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }

        console.logBytes32(r);
        console.logBytes32(s);
        console.log("v value:", v);

        // Adjust v for Ethereum's ecrecover
        // Bitcoin uses 27/28 as v values, Ethereum uses 0/1
        if (v < 27) {
            v += 27;
        }
        console.log("adjusted v value:", v);

        // Prefix the message hash as per Bitcoin's standard
        bytes32 prefixedHash = keccak256(abi.encodePacked(messageHash));
        console.logBytes32(prefixedHash);
        
        // Recover the signer's address
        address recovered = ecrecover(prefixedHash, v, r, s);
        console.log("recovered address:", recovered);
        
        // Convert the recovered address to a public key
        bytes memory recoveredPubKey = abi.encodePacked(recovered);
        console.logBytes(recoveredPubKey);
        
        // Compare the recovered public key with the expected signer
        bool isValid = keccak256(recoveredPubKey) == keccak256(expectedSigner);
        console.log("signature valid:", isValid);
        
        return isValid;
    }

    /**
     * @dev Helper function to verify multiple signatures at once
     * @param messageHash The 32-byte hash of the original message
     * @param signatures Array of signatures
     * @param expectedSigners Array of expected Bitcoin public keys
     * @return bool True if all signatures are valid, false otherwise
     */
    function verifyMultipleSignatures(
        bytes32 messageHash,
        bytes[] memory signatures,
        bytes[] memory expectedSigners
    ) public pure returns (bool) {
        require(signatures.length == expectedSigners.length, "Array lengths must match");
        
        for (uint i = 0; i < signatures.length; i++) {
            if (!verifyBitcoinSignature(messageHash, signatures[i], expectedSigners[i])) {
                return false;
            }
        }
        return true;
    }
} 