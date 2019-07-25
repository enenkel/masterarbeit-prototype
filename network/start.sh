#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error, print all commands.
set -ev

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1

docker-compose -f docker-compose.yml down

docker-compose -f docker-compose.yml up -d ca.producer.com orderer.producer.com peer0.producer.com couchdb.peer0.producer.com peer1.producer.com couchdb.peer1.producer.com peer0.customer.com couchdb.peer0.customer.com peer1.customer.com couchdb.peer1.customer.com
docker ps -a

# wait for Hyperledger Fabric to start
# incase of errors when running later commands, issue export FABRIC_START_TIMEOUT=<larger number>
export FABRIC_START_TIMEOUT=10
#echo ${FABRIC_START_TIMEOUT}
sleep ${FABRIC_START_TIMEOUT}

echo 'Starting creating channel'
# Create the channel
docker exec -e "CORE_PEER_LOCALMSPID=ProducerMSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@producer.com/msp" peer0.producer.com peer channel create -o orderer.producer.com:7050 -c mainchannel -f /etc/hyperledger/configtx/channel.tx
echo 'Created channel'

echo 'Starting joining channel'
# Join peer0.org1.example.com to the channel.
docker exec -e "CORE_PEER_LOCALMSPID=ProducerMSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@producer.com/msp" peer0.producer.com peer channel join -b mainchannel.block
echo 'Peer 0 Producer joined channel'

echo "Waiting 2 Seconds ..."
docker exec -e "CORE_PEER_LOCALMSPID=ProducerMSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@producer.com/msp" -e "CORE_PEER_ADDRESS=peer1.producer.com:7051" peer0.producer.com peer channel join -b mainchannel.block
echo 'Peer 1 Producer joined channel'

echo "fetching genisis block ...."
docker exec -e "CORE_PEER_LOCALMSPID=CustomerMSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@customer.com/msp" peer0.customer.com peer channel fetch 0 mainchannel.block -o orderer.producer.com:7050 -c mainchannel


echo "Waiting 2 Seconds ..."
docker exec -e "CORE_PEER_LOCALMSPID=CustomerMSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@customer.com/msp" peer0.customer.com peer channel join -b mainchannel.block
echo 'Peer 0 Customer joined channel'

echo "Waiting 2 Seconds ..."
docker exec -e "CORE_PEER_LOCALMSPID=CustomerMSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@customer.com/msp" -e "CORE_PEER_ADDRESS=peer1.customer.com:7051" peer0.customer.com peer channel join -b mainchannel.block
echo 'Peer 1 Customer joined channel'