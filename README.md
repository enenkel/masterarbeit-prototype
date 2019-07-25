Configurations and Code derived from https://github.com/hyperledger/fabric-samples examples

# Network commands
- Clean key store: [init.sh](network/init.sh)
- Generating crypto resources and orderer, channel and anchor peer genesis blocks: [generate.sh](network/generate.sh)
- Start network: [start.sh](network/start.sh)
- Stop network: [stop.sh](network/stop.sh)
- Purge network: [teardown.sh](network/teardown.sh)

# Smart Contract
[simulationcontract](organization/contract)

Installation and Instantiation via hyperledger fabric tools:  
[customer](organization/customer/configuration/cli)  
[producer](organization/producer/configuration/cli)  

Examples:  
```peer chaincode install -n simulationcontract -v 1 -p /opt/gopath/src/github.com/contract -l node --peerAddresses peer1.customer.com:7051```

```peer chaincode instantiate -n simulationcontract -v 4 -l node -c '{"Args":["org.prototype.simulationcontract:instantiate"]}' -C mainchannel -P "OR ('CustomerMSP.member', 'ProducerMSP.member')"```

# Customer Application
[apps](organization/customer/application)

# Producer Application
[apps](organization/producer/application)

# Monitoring
**Configs:**
- [Grafana](network/monitoring/docker/grafana)  
- [Prometheus](network/monitoring/docker/prometheus)
- [Alertmanager](network/monitoring/docker/alertmanager)
- [Dashboar config](network/monitoring/docker/dashboards)

**RUN Monitoring:** 
- ```cd network/monitoring/docker```
- ```docker-compose up -d```

**Print logs from all containers with logspout:**
- ```cd network/monitoring/docker```
- Execute [monitordocker.sh](network/monitoring/docker/monitordocker.sh)

_Configurations only tested on windows OS_
