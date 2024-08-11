const { WebSocket } = require('ws');
const { parentPort, workerData } = require('worker_threads');
const { nodeUrl } = require('.././credentials.json');
const fs = require('fs');
const path = require('path');

if (!nodeUrl) {
    throw new Error("Node URL is not defined in credentials.json");
}

class Stream {
    constructor(nodeUrl, type) {
        this.nodeUrl = nodeUrl;
        this.type = type;
        this.ws = new WebSocket(nodeUrl);
        this.latestBlock = null;

        this.initialize();
    }

    initialize() {
        if (this.type === 'blocks') {
            this.ws.on('open', this.subscribeToNewBlocks.bind(this));
            this.ws.on('message', this.handleNewBlockMessage.bind(this));
        } else if (this.type === 'mempool') {
            this.ws.on('open', this.subscribeToNewPendingTransactions.bind(this));
            this.ws.on('message', this.handleNewMempoolMessage.bind(this));
        }
        this.ws.on('error', this.handleError.bind(this));
        this.ws.on('close', this.handleClose.bind(this));
    }

    subscribeToNewBlocks() {
        console.log("[+] Sync done !");
        console.log('[+] Connected to node via WebSocket for blocks');
        this.ws.send(JSON.stringify({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "eth_subscribe",
            "params": ["newHeads"]
        }));
    }

    subscribeToNewPendingTransactions() {
        console.log('[+] Connected to node via WebSocket for mempool');
        console.log("[+] Wating for sync ...");
        this.ws.send(JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_subscribe',
            params: ['newPendingTransactions'],
            id: 1,
        }));
    }

    handleError(error) {
        console.error('WebSocket error:', error);
    }

    handleClose() {
        console.error('WebSocket connection closed. Reconnecting...');
        setTimeout(() => this.initialize(), 1000);  // Reconnect after 1 second
    }

    async handleNewBlockMessage(data) {
        const jsonData = JSON.parse(data);
        if (jsonData.params && jsonData.params.result) {
            const blockHash = jsonData.params.result.hash;
            try {
                const blockDetails = await this.getBlockDetails(blockHash);
                if (blockDetails && blockDetails.transactions) {
                    this.latestBlock = {
                        number: parseInt(blockDetails.number, 16),
                        hash: blockHash,
                        transactions: blockDetails.transactions.map(tx => tx.hash)
                    };
                    parentPort.postMessage({ type: 'block', data: this.latestBlock });
                }
            } catch (error) {
                console.error(error);
            }
        }
    }

    handleNewMempoolMessage(data) {
        const message = JSON.parse(data);
        if (message.method === 'eth_subscription' && message.params.subscription) {
            const txHash = message.params.result;

            // Append transaction to a text file
            const filePath = path.resolve(__dirname, '../result/mempool_transactions.txt');
            fs.appendFile(filePath, txHash + '\n', (err) => {
                if (err) {
                    console.error('Error writing to file:', err);
                }
            });

            parentPort.postMessage({ type: 'mempool', data: txHash });
        }
    }

    async getBlockDetails(blockHash) {
        return new Promise((resolve, reject) => {
            this.ws.send(JSON.stringify({
                "jsonrpc": "2.0",
                "id": 1,
                "method": "eth_getBlockByHash",
                "params": [blockHash, true]
            }), err => {
                if (err) {
                    return reject(err);
                }
            });

            const timeout = setTimeout(() => {
                reject('Timeout while waiting for block details.');
            }, 5000);

            this.ws.once('message', data => {
                clearTimeout(timeout);
                try {
                    const jsonData = JSON.parse(data);
                    if (jsonData.result) {
                        resolve(jsonData.result);
                    } else {
                        reject('Error: Block details not found (Skipping Block)');
                    }
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    getLatestBlock() {
        return this.latestBlock;
    }
}

const stream = new Stream(nodeUrl, workerData.type);
