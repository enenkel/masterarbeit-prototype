'use strict';

const OrderList = require('../../contract/lib/orderlist');
const Connector = require('../../gateway/hyperledger-connector');

async function main() {
    const connector = new Connector();
    const contract = await connector.getContractInstance('../identity/user/hans/wallet', 'User1@producer.com');
    try {
        console.log('Submit getOrder transaction history.');
        const issueResponse = await contract.submitTransaction('getTransactionHistory', 'Peter', '1');
        // process response
        let orderHistory = OrderList.fromBuffer(issueResponse);
        console.log(`Order has history: ${JSON.stringify(orderHistory)}`);
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
    console.log('get orderHistory complete.');
}).catch((e) => {
    console.log('get orderHistory exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);
});