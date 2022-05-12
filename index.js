// Standard encoding of `1024` bits, and `65537` exponent
const keyPair = require('node-forge').pki.rsa.generateKeyPair({
    bits: 1024, e: 0x10001
});

const RSA = {
    scrambleMod: () => {
        let modulus = Buffer.from(keyPair.publicKey.n.toByteArray());
        let i, scrambled = modulus.slice(1); // Skip the `0x00` at the start

        // A standard method as to how the L2 Clients decode the RSA Modulus on their end
        for (i = 0; i < 4; i++) {
            [scrambled[i], scrambled[0x4d + i]] = [scrambled[0x4d + i], scrambled[i]];
        }

        for (i = 0; i < 0x40; i++) { scrambled[0x00 + i] ^= scrambled[0x40 + i]; }
        for (i = 0; i < 0x04; i++) { scrambled[0x0d + i] ^= scrambled[0x34 + i]; }
        for (i = 0; i < 0x40; i++) { scrambled[0x40 + i] ^= scrambled[0x00 + i]; }

        return scrambled;
    },

    decipher: (data) => { // L2 Clients **do not** use `SPKI`, `PKCS1` or `PKCS8`
        return keyPair.privateKey.decrypt(data, 'RAW');
    }
};

module.exports = RSA;
