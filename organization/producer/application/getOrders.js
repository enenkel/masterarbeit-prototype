'use strict';

const Orders = require('../../contract/lib/orderlist');
const Connector = require('../../gateway/hyperledger-connector');

async function main() {
    const connector = new Connector();
    const contract = await connector.getContractInstance('../identity/user/hans/wallet', 'User1@producer.com');
    try {
        const startTime = Date.now();
        console.log('Submit getOrder transaction.');
        const issueResponse = await contract.submitTransaction('getOrders', 'Peter');
        // process response
        console.log("issue Response", issueResponse);
        const parsed = Orders.fromBuffer(issueResponse);
        const endTime = Date.now();
        console.log(`All orders ${JSON.stringify(parsed)}`);
        console.log(`Transaction complete to retrieve ${parsed.length} orders in ${endTime - startTime} ms.`);
    } catch (error) {
        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);
    } finally {
        // Disconnect from the gateway
        console.log('Disconnect from Fabric gateway.');
        await connector.disconnect();
    }
}

main().then(() => {
    console.log('Get orders program complete.');
}).catch((e) => {
    console.log('Get orders program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);
});