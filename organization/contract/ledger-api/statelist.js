/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';
const State = require('./state.js');

/**
 * StateList provides a named virtual container for a set of ledger states.
 * Each state has a unique key which associates it with the container, rather
 * than the container containing a link to the state. This minimizes collisions
 * for parallel transactions on different states.
 */
class StateList {

    /**
     * Store Fabric context for subsequent API access, and name of list
     */
    constructor(ctx, listName) {
        this.ctx = ctx;
        this.name = listName;
        this.supportedClasses = {};
    }

    /**
     * Add a state to the list. Creates a new state in worldstate with
     * appropriate composite key.  Note that state defines its own key.
     * State object is serialized before writing.
     */
    async addState(state) {
        let key = this.ctx.stub.createCompositeKey(this.name, state.getSplitKey());
        let data = State.serialize(state);
        await this.ctx.stub.putState(key, data);
    }

    /**
     * Get a state from the list using supplied keys. Form composite
     * keys to retrieve state from world state. State data is deserialized
     * into JSON object before being returned.
     */
    async getState(key) {
        try {
            let ledgerKey = this.ctx.stub.createCompositeKey(this.name, State.splitKey(key));
            console.log("Query ledger with: ", ledgerKey);
            let data = await this.ctx.stub.getState(ledgerKey);
            let state = State.deserialize(data, this.supportedClasses);
            return state;
        } catch (e) {
            console.log("err during get state key", e);
        }
    }

    async getGlobalState(customerKey) {
        console.log("getting global state with", this.name, customerKey);
        try {
            const queryString = "{\"selector\":{\"customer\":\"" + customerKey + "\"}}";
            console.log("query string is: ", queryString);
            let data2 = await this.ctx.stub.getQueryResult(queryString);
            return await this.getAllResults(data2, false);
        } catch (e) {
            console.log("error", e);
            return [];
        }
    }

    /**
     * Update a state in the list. Puts the new state in world state with
     * appropriate composite key.  Note that state defines its own key.
     * A state is serialized before writing. Logic is very similar to
     * addState() but kept separate becuase it is semantically distinct.
     */
    async updateState(state) {
        let key = this.ctx.stub.createCompositeKey(this.name, state.getSplitKey());
        let data = State.serialize(state);
        await this.ctx.stub.putState(key, data);
    }

    async getHistory(key) {
        let ledgerKey = this.ctx.stub.createCompositeKey(this.name, State.splitKey(key));
        const response = await this.ctx.stub.getHistoryForKey(ledgerKey);
        return await this.getAllResults(response, true);
    }

    /** Stores the class for future deserialization */
    use(stateClass) {
        this.supportedClasses[stateClass.getClass()] = stateClass;
    }

    // from marbles_02 example
    // \fabric-samples\chaincode\marbles02\node\marbles_chaincode.js
    async getAllResults(iterator, isHistory) {
        let allResults = [];
        while (true) {
            let res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
                if (isHistory && isHistory === true) {
                    jsonRes.TxId = res.value.tx_id;
                    jsonRes.Timestamp = res.value.timestamp;
                    jsonRes.IsDelete = res.value.is_delete.toString();
                    try {
                        jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes.Value = res.value.value.toString('utf8');
                    }
                } else {
                    jsonRes.Key = res.value.key;
                    try {
                        jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes.Record = res.value.value.toString('utf8');
                    }
                }
                allResults.push(jsonRes);
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults.length);
                return allResults;
            }
        }
    }
}

module.exports = StateList;
