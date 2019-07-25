/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';
const StateList = require('./../ledger-api/statelist.js');
const Order = require('./order.js');

class OrderList extends StateList {

    static toBuffer(json) {
        const buffer = Buffer.from(JSON.stringify(json));
        return buffer;
    }

    static fromBuffer(buffer) {
        const content = Buffer.from(JSON.parse(buffer));
        return JSON.parse(content.toString());;
    }

    constructor(ctx) {
        super(ctx, 'org.prototype.orderlist');
        this.use(Order);
    }

    async addOrder(order) {
        return this.addState(order);
    }

    async getOrder(orderKey) {
        return this.getState(orderKey);
    }

    async getOrders(customerKey) {
        return this.getGlobalState(customerKey)
    }

    async updateOrder(order) {
        return this.updateState(order);
    }

    async getOrderHistory(key) {
        return this.getHistory(key);
    }

}

module.exports = OrderList;
