const { Worker, parentPort } = require('worker_threads');
const path = require('path');
const fs = require('fs');
const { nodeUrl } = require('.././credentials.json');

if (!nodeUrl) {
    throw new Error("Node URL is not defined in credentials.json");
}

let mempoolData = [];
let latestBlock = null;
let updatedBlock = null;

// Function to update the latest block with private transactions
function updateLatestBlockWithPrivateTransactions(latestBlock, mempoolData) {
    // Extract transactions from the latest block
    const latestBlockTransactions = latestBlock.transactions || [];

    // Filter out transactions that are present in the mempool and call them privateTransactions
    const privateTransactions = latestBlockTransactions.filter(tx => !mempoolData.includes(tx));

    // Remaining transactions in the latestBlock are public transactions
    const publicTransactions = latestBlockTransactions.filter(tx => mempoolData.includes(tx));

    // Update the latestBlock object in place
    latestBlock.transactions = publicTransactions;
    latestBlock.private_transactions = privateTransactions;

    // Add lengths
    latestBlock.publicTransactionsNumber = publicTransactions.length;
    latestBlock.privateTransactionsNumber = privateTransactions.length;

    // Append private transactions to a text file
    const filePath = path.resolve(__dirname, '../result/private_transactions.txt');
    privateTransactions.forEach(tx => {
        fs.appendFile(filePath, tx + '\n', (err) => {
            if (err) {
                console.error('Error writing to file:', err);
            }
        });
    });

    return latestBlock; // Returning latestBlock for convenience
}

// Function to run a worker thread
function runWorker(workerData) {
    const worker = new Worker(path.resolve(__dirname, 'stream.js'), { workerData });

    worker.on('message', message => {
        if (message.type === 'block') {
            latestBlock = message.data;
            // Trigger the compute process whenever a new block is received
            if (latestBlock && mempoolData.length > 0) {
                updatedBlock = updateLatestBlockWithPrivateTransactions(latestBlock, mempoolData);
                parentPort.postMessage({ type: 'updatedBlock', data: updatedBlock }); // Send updated block to main.js
            }
        } else if (message.type === 'mempool') {
            mempoolData.push(message.data);
        }
    });

    worker.on('error', error => console.error('Worker error:', error));
    worker.on('exit', code => {
        if (code !== 0) {
            console.error(`Worker stopped with exit code ${code}. Restarting...`);
            runWorker(workerData); // Restart worker if it stops unexpectedly
        }
    });

    return worker;
}

async function main() {
    // Initialize worker for mempool
    runWorker({ type: 'mempool' });
    
    // Delay to ensure mempool worker is initialized before starting block worker
    await new Promise(resolve => setTimeout(resolve, 13500));

    // Initialize worker for blocks
    runWorker({ type: 'blocks' });

}

main();
