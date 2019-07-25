'use strict';

const Order = require('../../contract/lib/order.js');
const Connector = require('../../gateway/hyperledger-connector');

async function main() {
    const connector = new Connector();
    const contract = await connector.getContractInstance('../identity/user/peter/wallet', 'User1@customer.com');
    try {
        console.log('Submit getOrder transaction.');
        const issueResponse = await contract.submitTransaction('getOrder', 'Peter', '3');
        // process response
        let order = Order.fromBuffer(issueResponse);
        console.log(`${order.customer}'s order with id ${order.orderNumber} is in state: ${order.currentState}`);
        console.log('Transaction complete.');
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
    console.log('Create order program complete.');
}).catch((e) => {
    console.log('Create order program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);
});