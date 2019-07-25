/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Fabric smart contract classes
const {Contract, Context} = require('fabric-contract-api');

// Prototype specific imports
const Order = require('./order');
const OrderList = require('./orderlist');
const Utils = require('./utils');

/**
 * A custom context provides easy access to list of all orders
 */
class SimulationContext extends Context {

    constructor() {
        super();
        this.orderList = new OrderList(this);
    }
}

/**
 * Smart Contract prototype
 */
class SimulationContract extends Contract {

    constructor() {
        super('org.prototype.simulationcontract'); // namespace of smart contract
        this.utils = new Utils();
    }

    createContext() {
        return new SimulationContext();
    }

    async instantiate(ctx) {
        // No implementation required with this example
        // It could be where data migration is performed, if necessary
        console.log('Instantiate the contract');
    }

    /**
     * Creates a new order. (invoked by the Customer)
     */
    async createOrder(ctx, customer, orderNumber, productId, orderCreateDate, quantity, payload) {
        console.log(`Creating order for customer: ${customer} with PID ${productId}`);
        const ORG = this.utils.determineOrg(ctx.stub);
        if (ORG !== Utils.ORGS.CUSTOMER) {
            throw new Error(`Only peers from customer org can execute this function`);
        }
        let order = Order.createInstance(customer, orderNumber, productId, orderCreateDate, quantity, payload);
        order.setInQueue();
        await ctx.orderList.addOrder(order);
        console.log(`Added order for customer: ${customer} with PID ${productId}`);
        return order.toBuffer();
    }

    /**
     * Moves an order to production (invoked by the Producer)
     */
    async startProduction(ctx, customer, orderNumber) {
        console.log(`Starting production of order for customer: ${customer} with orderID ${orderNumber}`);
        const ORG = this.utils.determineOrg(ctx.stub);
        if (ORG !== Utils.ORGS.PRODUCER) {
            throw new Error(`Only peers from producer org can execute this function`);
        }
        let buffer = await this.getOrder(ctx, customer, orderNumber);
        let order = Order.deserialize(Buffer.from(buffer));
        order.setInProduction();
        await ctx.orderList.updateOrder(order);
        console.log(`Updated state of order to: ${Order.STATE.IN_PRODUCTION}`);
        return order.toBuffer();
    }

    /**
     * Moves an order to quality check (invoked by the Producer)
     */
    async startQualityCheck(ctx, customer, orderNumber) {
        console.log(`starting quality check for order: ${orderNumber} for customer: ${customer}`);
        const ORG = this.utils.determineOrg(ctx.stub);
        if (ORG !== Utils.ORGS.PRODUCER) {
            throw new Error(`Only peers from producer org can execute this function`);
        }
        let buffer = await this.getOrder(ctx, customer, orderNumber);
        let order = Order.fromBuffer(buffer);
        order.setInQualityCheck();
        await ctx.orderList.updateOrder(order);
        console.log(`Updated state of order to: ${Order.STATE.IN_QUALITY_CHECK}`);
        return order.toBuffer();
    }

    /**
     * Moves an order to delivery (invoked by the Producer)
     */
    async startDelivery(ctx, customer, orderNumber) {
        console.log(`starting delivery for order: ${orderNumber} for customer: ${customer}`);
        const ORG = this.utils.determineOrg(ctx.stub);
        if (ORG !== Utils.ORGS.PRODUCER) {
            throw new Error(`Only peers from producer org can execute this function`);
        }
        let buffer = await this.getOrder(ctx, customer, orderNumber);
        let order = Order.fromBuffer(buffer);
        order.setInDelivery();
        await ctx.orderList.updateOrder(order);
        console.log(`Updated state of order to: ${Order.STATE.IN_DELIVERY}`);
        return order.toBuffer();
    }

    /**
     * Moves an order to delivered (invoked by the Customer)
     */
    async wasDelivered(ctx, customer, orderNumber) {
        console.log(`order: ${orderNumber} for customer: ${customer} was delivered`);
        const ORG = this.utils.determineOrg(ctx.stub);
        if (ORG !== Utils.ORGS.PRODUCER) {
            throw new Error(`Only peers from producer org can execute this function`);
        }
        let buffer = await this.getOrder(ctx, customer, orderNumber);
        let order = Order.fromBuffer(buffer);
        order.setDelivered();
        await ctx.orderList.updateOrder(order);
        console.log(`Updated state of order to: ${Order.STATE.IN_DELIVERY}`);
        return order.toBuffer();
    }

    /**
     * Retrieve a single order with its full key (customer + order number)
     */
    async getOrder(ctx, customer, orderNumber) {
        try {
            let orderKey = Order.makeKey([customer, orderNumber]);
            console.log(`Retrieving Order from state with key ${orderKey}`);
            let order = await ctx.orderList.getOrder(orderKey);
            console.log(`Received order: ${JSON.stringify(order)}`);
            return order.toBuffer();
        } catch (e) {
            console.log("error occurred", e);
            return null;
        }
    }

    /**
     * Retrieve all orders of a customer
     */
    async getOrders(ctx, customer) {
        let orders = await ctx.orderList.getOrders(customer);
        console.log(`Number of received orders: ${(orders || []).length}`);
        return OrderList.toBuffer(orders);
    }

    /**
     * Retrieve the transaction history of a specific order
     */
    async getTransactionHistory(ctx, customer, orderNumber) {
        let orderKey = Order.makeKey([customer, orderNumber]);
        console.log(`Retrieving Order history from blockchain with key ${orderKey}`);
        let orderHistory = await ctx.orderList.getOrderHistory(orderKey);
        console.log("history", JSON.stringify(orderHistory));
        return OrderList.toBuffer(orderHistory);
    }
}

module.exports = SimulationContract;
