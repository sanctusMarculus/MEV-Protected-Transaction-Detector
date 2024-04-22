import WebSocket from 'ws';

const nodeurl = 'wss://wiser-ultra-pool.bsc.discover.quiknode.pro/79609b59a09dce2f1515396c0620f38bbdb64e64/';
const wsMempool = new WebSocket(nodeurl);
const wsBlocks = new WebSocket(nodeurl);
const blocks = [];
const mempoolTx = [];
const filteredTxArray = []
let lastMempoolSize = 0;
let lastProcessedBlockIndex = -1; 


function cleanupMempool(publicTxs, blockNumber) {
    let deletedCount = 0;

    publicTxs.forEach(tx => {
        const index = mempoolTx.indexOf(tx);
        if (index !== -1) {
            mempoolTx.splice(index, 1); // Remove the transaction from mempoolTx
            deletedCount++;
        }
    });


}

function displayBlockInfo(block){

    console.log("\n\nBlock Number:", block.number);
    console.log("Block Hash:", block.hash);
    console.log("Private:", block.privateTxNumber,"\t","Public:", block.publicTxNumber,"\t","Total:", block.privateTxNumber + block.publicTxNumber);


}

async function removePublicTxs() {
    if (blocks.length === 0)
        return;

    for (let i = lastProcessedBlockIndex + 1; i < blocks.length; i++) {
        const block = blocks[i];
        
        // Create a new array to store filtered transactions
        const privateTxs = block.txs.filter(tx => !mempoolTx.includes(tx));
        const publicTxs = block.txs.filter(tx => !privateTxs.includes(tx));

        block.privateTxNumber = privateTxs.length;
        block.publicTxNumber = publicTxs.length;
        block.txs = privateTxs;
       
        displayBlockInfo(block)
        cleanupMempool(publicTxs, block.number); // Pass block number to cleanupMempool
    }

    lastProcessedBlockIndex = blocks.length - 1; // Update the index of the last processed block
}


// Function to handle block updates
async function handleBlocks(newblock,blockNo,blockHash) {
    const block = {
        number: null,
        hash: null,
        txs: [],
        privateTxNumber: 0,
        publicTxNumber: 0,
    };

    newblock.forEach(tx => {
    	block.number = blockNo
    	block.hash = blockHash
        block.txs.push(tx.hash);
        block.publicTxNumber++;
    });

    await removePublicTxs();
    blocks.push(block);
}

// Function to get block details
async function getBlockDetails(blockHash) {
    return new Promise((resolve, reject) => {
        wsBlocks.send(JSON.stringify({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "eth_getBlockByHash",
            "params": [blockHash, true]
        }), (err) => {
            if (err) {
                reject(err);
            }
        });

        const timeout = setTimeout(() => {
            reject('Timeout while waiting for block details.');
        }, 5000);

        wsBlocks.once('message', function blockDetails(data) {
            clearTimeout(timeout);
            try {
                const jsonData = JSON.parse(data);
                if (jsonData.result) {
                    resolve(jsonData.result);
                } else {
                    reject('Err: Block details not found (Skipping Block)\n');
                }
            } catch (error) {
                reject(error);
            }
        });
    });
}

// Subscribe to new blocks
wsBlocks.on('open', function open() {
    console.log('Connected to node via WebSocket for blocks');

    wsBlocks.send(JSON.stringify({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "eth_subscribe",
        "params": ["newHeads"]
    }));
});

// Subscribe to new mempool transactions
wsMempool.on('open', () => {
    console.log('Connected to node via WebSocket for mempool');

    const subscriptionRequest = {
        jsonrpc: '2.0',
        method: 'eth_subscribe',
        params: ['newPendingTransactions'],
        id: 1,
    };
    wsMempool.send(JSON.stringify(subscriptionRequest));
});

// Handle new blocks
wsBlocks.on('message', async function incoming(data) {
    const jsonData = JSON.parse(data);
    if (jsonData.params && jsonData.params.result) {
        const blockHash = jsonData.params.result.hash;
        try {
            const blockDetails = await getBlockDetails(blockHash);
            if (blockDetails && blockDetails.transactions) {
                await handleBlocks(blockDetails.transactions,parseInt(blockDetails.transactions[0].blockNumber, 16),blockDetails.transactions[0].blockHash);
            }
        } catch (error) {
            console.log(error);
        }
    }
});

// Handle new mempool transactions
wsMempool.on('message', (data) => {
    const message = JSON.parse(data);
    if (message.method === 'eth_subscription' && message.params.subscription) {
        const txHash = message.params.result;
        mempoolTx.push(txHash);

    }
});

