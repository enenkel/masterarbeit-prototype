const {ClientIdentity} = require('fabric-shim');


class Utils {

    determineOrg(stub) {
        console.log("Determining organization ...");
        let cid = new ClientIdentity(stub);

        const mspId = cid.getMSPID();
        let ORG;
        if (mspId === "CustomerMSP") {
            ORG = Utils.ORGS.CUSTOMER;
        } else if (mspId === "ProducerMSP") {
            ORG = Utils.ORGS.PRODUCER;
        } else {
            console.log("NON IDENTIFIED MSPID!!");
            ORG = Utils.ORGS.PRODUCER
        }
        console.log(`determined org: ${ORG}`);
        return ORG;
    }
}

Utils.ORGS = {
    PRODUCER: "PRODUCER",
    CUSTOMER: "CUSTOMER"
};

module.exports = Utils;
