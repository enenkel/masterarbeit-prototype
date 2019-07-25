/*
 *  SPDX-License-Identifier: Apache-2.0
 */

'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const {FileSystemWallet, X509WalletMixin} = require('fabric-network');
const path = require('path');

const fixtures = path.resolve(__dirname, '../../../network');

// A wallet stores a collection of identities
const wallet = new FileSystemWallet('../identity/user/peter/wallet');

async function main() {
    try {
        // Identity to credentials to be stored in the wallet
        const credPath = path.join(fixtures, '/crypto-config/peerOrganizations/customer.com/users/User1@customer.com');
        const cert = fs.readFileSync(path.join(credPath, '/msp/signcerts/User1@customer.com-cert.pem')).toString();
        const key = fs.readFileSync(path.join(credPath, '/msp/keystore/2b837c07187aeef67ed4ffe21085dcc962d1c2912fcb60e30ccfd1a705c158e8_sk')).toString();

        // Load credentials into wallet
        const identityLabel = 'User1@customer.com';
        const identity = X509WalletMixin.createIdentity('CustomerMSP', cert, key);
        await wallet.import(identityLabel, identity);

    } catch (error) {
        console.log(`Error adding to wallet. ${error}`);
        console.log(error.stack);
    }
}

main().then(() => {
    console.log('done');
}).catch((e) => {
    console.log(e);
    console.log(e.stack);
    process.exit(-1);
});