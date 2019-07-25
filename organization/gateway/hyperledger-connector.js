const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const {FileSystemWallet, Gateway} = require('fabric-network');

class HyperledgerConnector {

    async getContractInstance(walletPath, userName) {
        // A wallet stores a collection of identities for use
        const wallet = new FileSystemWallet(walletPath);

        // A gateway defines the peers used to access Fabric networks
        this.gateway = new Gateway();
        try {
            let connectionProfile = yaml.safeLoad(fs.readFileSync(path.join(__dirname, './connectionProfile.yaml'), 'utf8'));

            // Set connection options; identity and wallet
            let connectionOptions = {
                identity: userName,
                wallet: wallet,
                discovery: {enabled: false, asLocalhost: true}
            };

            // Connect to gateway using application specified parameters
            console.log('Connect to Fabric gateway.');

            await this.gateway.connect(connectionProfile, connectionOptions);

            // Access PaperNet network
            console.log('Use network channel: mainchannel.');

            const network = await this.gateway.getNetwork('mainchannel');

            // Get addressability to commercial paper contract
            console.log('Use org.prototype.simulationcontract smart contract.');

            const contract = await network.getContract('simulationcontract', 'org.prototype.simulationcontract');

            console.log('Received contract instance ...');
            return contract;
        } catch (error) {
            console.log(`Error getting contract. ${error}`);
            console.log(error.stack);
        }
    }

    async disconnect() {
        if (this.gateway) {
            this.gateway.disconnect();
        }
    }
}

module.exports = HyperledgerConnector;