/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';
const State = require('./../ledger-api/state.js');

/**
 * Extend State class to define Order asset
 * Class will be used by application and smart contract to define an order
 */
class Order extends State {

    constructor(obj) {
        super(Order.getClass(), [obj.customer, obj.orderNumber]);
        Object.assign(this, obj);
    }

    static fromBuffer(buffer) {
        return Order.deserialize(Buffer.from(JSON.parse(buffer)));
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    static deserialize(data) {
        return State.deserializeClass(data, Order);
    }

    static createInstance(customer, orderNumber, productId, orderCreateDate, quantity, payload) {
        return new Order({customer, orderNumber, productId, orderCreateDate, quantity, payload});
    }

    setInQueue() {
        this.currentState = Order.STATE.IN_QUEUE;
    }

    setInProduction() {
        this.currentState = Order.STATE.IN_PRODUCTION;
    }

    setInQualityCheck() {
        this.currentState = Order.STATE.IN_QUALITY_CHECK;
    }

    setInDelivery() {
        this.currentState = Order.STATE.IN_DELIVERY;
    }

    setDelivered() {
        this.currentState = Order.STATE.DELIVERED;
    }

    static getClass() {
        return 'org.prototype.order';
    }
}

/*
 * Enum of the different order states
 */
Order.STATE = {
    IN_QUEUE: "IN_QUEUE", // Order was placed, not yet started to produce
    IN_PRODUCTION: "IN_PRODUCTION", // Order is in production
    IN_QUALITY_CHECK: "IN_QUALITY_CHECK", // Product made to order is in quality check
    IN_DELIVERY: "IN_DELIVERY", // Product is in delivery, passed quality check
    DELIVERED: "DELIVERED" // Product is delivered, end of application
};

module.exports = Order;
