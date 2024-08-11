<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <header>
        <h1>MEV-Protected-Transaction-Detector</h1>
    </header>
    <main>
        <section>
            <h2>Description</h2>
            <p>The MEV-Protected-Transaction-Detector project is designed to monitor and process blockchain transactions. It uses WebSocket connections to receive real-time data about new blocks and mempool transactions (transactions waiting to be included in a block). The project filters these transactions to identify and separate private transactions from public ones and saves these to text files.</p>
        </section>
        <section>
            <h2>Project Structure</h2>
            <p>The project consists of the following files:</p>
            <ul>
                <li><code>main.js</code>: The entry point of the application.</li>
                <li><code>src/middleware.js</code>: Handles the collection and processing of mempool and block data.</li>
                <li><code>src/stream.js</code>: Manages WebSocket connections to receive real-time data about new blocks and mempool transactions.</li>
                <li><code>result/mempool_transactions.txt</code>: Stores the transactions received from the mempool.</li>
                <li><code>result/private_transactions.txt</code>: Stores the private transactions that are filtered out from the latest block.</li>
                <li><code>test/compare_transactions.cpp</code>: Compares mempool and private transactions and prints the common transactions along with their count.</li>
                <li><code>credentials.json</code>: Contains the necessary credentials and configurations, such as the node URL for connecting to the blockchain.</li>
            </ul>
        </section>
        <section>
            <h2>Main Scripts</h2>
            <h3><code>main.js</code></h3>
            <p>This script runs the <code>middleware.js</code> as a worker and displays the updated block information when it is received.</p>
            <h3>Explanation:</h3>
            <ol>
                <li><code>const { Worker } = require('worker_threads');</code>: Import the Worker class from the worker_threads module, which is used to create worker threads.</li>
                <li><code>const path = require('path');</code>: Import the path module, which provides utilities for working with file and directory paths.</li>
                <li><code>function runMiddleware() { ... }</code>: Define a function named runMiddleware that creates and manages a worker thread running the <code>src/middleware.js</code> script.</li>
                <li><code>const middlewareWorker = new Worker(path.resolve(__dirname, 'src/middleware.js'));</code>: Create a new Worker instance, specifying the path to the middleware script.</li>
                <li><code>middlewareWorker.on('message', message => { ... });</code>: Set up an event listener for messages from the worker. When a message with the type 'updatedBlock' is received, it logs the updated block data to the console.</li>
                <li><code>middlewareWorker.on('error', error => console.error('Middleware worker error:', error));</code>: Set up an event listener for errors from the worker and log them to the console.</li>
                <li><code>middlewareWorker.on('exit', code => { ... });</code>: Set up an event listener for the worker's exit event. If the exit code is not 0, log an error and restart the worker by calling runMiddleware again.</li>
                <li><code>runMiddleware();</code>: Call the runMiddleware function to start the worker.</li>
            </ol>
        </section>
        <section>
            <h3><code>src/middleware.js</code></h3>
            <p>This script handles the collection and processing of mempool data and the latest block data. It updates the latest block with private transactions and sends the updated block to <code>main.js</code>.</p>
            <h3>Explanation:</h3>
            <ol>
                <li><code>const { Worker, parentPort } = require('worker_threads');</code>: Import the Worker and parentPort classes from the worker_threads module.</li>
                <li><code>const path = require('path');</code>: Import the path module.</li>
                <li><code>const fs = require('fs');</code>: Import the fs (file system) module, which provides an API for interacting with the file system.</li>
                <li><code>const { nodeUrl } = require('../credentials.json');</code>: Import the nodeUrl from the credentials.json file.</li>
                <li><code>if (!nodeUrl) { throw new Error("Node URL is not defined in credentials.json"); }</code>: Check if nodeUrl is defined, and throw an error if it is not.</li>
                <li><code>let mempoolData = []; let latestBlock = null; let updatedBlock = null;</code>: Initialize variables to store mempool data, the latest block, and the updated block.</li>
                <li><code>function updateLatestBlockWithPrivateTransactions(latestBlock, mempoolData) { ... }</code>: Define a function to update the latest block with private transactions.</li>
                <li><code>const latestBlockTransactions = latestBlock.transactions || [];</code>: Extract transactions from the latest block or initialize an empty array if none exist.</li>
                <li><code>const privateTransactions = latestBlockTransactions.filter(tx => !mempoolData.includes(tx));</code>: Filter out transactions that are not in the mempool and consider them private.</li>
                <li><code>const publicTransactions = latestBlockTransactions.filter(tx => mempoolData includes(tx));</code>: Filter transactions that are in the mempool and consider them public.</li>
                <li><code>latestBlock.transactions = publicTransactions;</code>: Update the latest block with public transactions.</li>
                <li><code>latestBlock.private_transactions = privateTransactions;</code>: Update the latest block with private transactions.</li>
                <li><code>latestBlock.publicTransactionsNumber = publicTransactions.length;</code>: Add the count of public transactions to the latest block.</li>
                <li><code>latestBlock.privateTransactionsNumber = privateTransactions.length;</code>: Add the count of private transactions to the latest block.</li>
                <li><code>const filePath = path.resolve(__dirname, '../result/private_transactions.txt');</code>: Resolve the path to the private_transactions.txt file.</li>
                <li><code>privateTransactions.forEach(tx => { fs.appendFile(filePath, tx + '\n', (err) => { if (err) { console.error('Error writing to file:', err); } }); });</code>: Append each private transaction to the private_transactions.txt file.</li>
                <li><code>return latestBlock;</code>: Return the updated latest block.</li>
                <li><code>function runWorker(workerData) { ... }</code>: Define a function to run a worker thread.</li>
                <li><code>const worker = new Worker(path.resolve(__dirname, 'stream.js'), { workerData });</code>: Create a new Worker instance for the stream.js script with the provided worker data.</li>
                <li><code>worker.on('message', message => { ... });</code>: Set up an event listener for messages from the worker. If a block message is received, update the latest block and post the updated block message to the parent port. If a mempool message is received, add it to the mempool data.</li>
                <li><code>worker.on('error', error => console.error('Worker error:', error));</code>: Set up an event listener for errors from the worker and log them to the console.</li>
                <li><code>worker.on('exit', code => { ... });</code>: Set up an event listener for the worker's exit event. If the exit code is not 0, log an error and restart the worker by calling runWorker again.</li>
                <li><code>return worker;</code>: Return the worker instance.</li>
                <li><code>async function main() { ... }</code>: Define an asynchronous main function to initialize the workers.</li>
                <li><code>runWorker({ type: 'mempool' });</code>: Start the mempool worker.</li>
                <li><code>await new Promise(resolve => setTimeout(resolve, 13500));</code>: Delay for 13.5 seconds to ensure the mempool worker is initialized before starting the block worker.</li>
                <li><code>runWorker({ type: 'blocks' });</code>: Start the block worker.</li>
                <li><code>main();</code>: Call the main function to start the workers.</li>
            </ol>
        </section>
        <section>
            <h3><code>src/stream.js</code></h3>
            <p>This script manages the WebSocket connections to receive real-time data about new blocks and mempool transactions. It sends this data to <code>middleware.js</code>.</p>
            <h3>Explanation:</h3>
            <ol>
                <li><code>const { WebSocket } = require('ws');</code>: Import the WebSocket class from the ws module.</li>
                <li><code>const { parentPort, workerData } = require('worker_threads');</code>: Import the parentPort and workerData classes from the worker_threads module.</li>
                <li><code>const { nodeUrl } = require('../credentials.json');</code>: Import the nodeUrl from the credentials.json file.</li>
                <li><code>const fs = require('fs');</code>: Import the fs (file system) module.</li>
                <li><code>const path = require('path');</code>: Import the path module.</li>
                <li><code>if (!nodeUrl) { throw new Error("Node URL is not defined in credentials.json"); }</code>: Check if nodeUrl is defined, and throw an error if it is not.</li>
                <li><code>class Stream { constructor(nodeUrl, type) { ... } }</code>: Define a class named Stream with a constructor that takes nodeUrl and type as parameters.</li>
                <li><code>this.nodeUrl = nodeUrl; this.type = type; this.ws = new WebSocket(nodeUrl); this.latestBlock = null;</code>: Initialize class properties.</li>
                <li><code>this.initialize();</code>: Call the initialize method to set up the WebSocket connection and event listeners.</li>
                <li><code>initialize() { ... }</code>: Define the initialize method to set up the WebSocket connection and event listeners.</li>
                <li><code>if (this.type === 'blocks') { ... } else if (this.type === 'mempool') { ... }</code>: Set up the WebSocket connection and event listeners based on the type (blocks or mempool).</li>
                <li><code>subscribeToNewBlocks() { ... }</code>: Define a method to subscribe to new blocks via WebSocket.</li>
                <li><code>subscribeToNewPendingTransactions() { ... }</code>: Define a method to subscribe to new pending transactions via WebSocket.</li>
                <li><code>handleError(error) { ... }</code>: Define an error handler method for the WebSocket connection.</li>
                <li><code>handleClose() { ... }</code>: Define a close handler method for the WebSocket connection.</li>
                <li><code>async handleNewBlockMessage(data) { ... }</code>: Define a method to handle new block messages from the WebSocket connection.</li>
                <li><code>const jsonData = JSON.parse(data);</code>: Parse the received data as JSON.</li>
                <li><code>if (jsonData.params && jsonData.params.result) { ... }</code>: Check if the received data contains block information.</li>
                <li><code>const blockHash = jsonData.params.result.hash;</code>: Extract the block hash from the received data.</li>
                <li><code>const blockDetails = await this.getBlockDetails(blockHash);</code>: Get the details of the block using the block hash.</li>
                <li><code>this.latestBlock = { number: parseInt(blockDetails.number, 16), hash: blockHash, transactions: blockDetails.transactions.map(tx => tx.hash) };</code>: Store the block details in the latestBlock property.</li>
                <li><code>parentPort.postMessage({ type: 'block', data: this.latestBlock });</code>: Send the block details to the parent port.</li>
                <li><code>handleNewMempoolMessage(data) { ... }</code>: Define a method to handle new mempool messages from the WebSocket connection.</li>
                <li><code>const message = JSON.parse(data);</code>: Parse the received data as JSON.</li>
                <li><code>if (message.method === 'eth_subscription' && message.params.subscription) { ... }</code>: Check if the received data contains mempool transaction information.</li>
                <li><code>const txHash = message.params.result;</code>: Extract the transaction hash from the received data.</li>
                <li><code>const filePath = path.resolve(__dirname, '../result/mempool_transactions.txt');</code>: Resolve the path to the mempool_transactions.txt file.</li>
                <li><code>fs.appendFile(filePath, txHash + '\n', (err) => { if (err) { console.error('Error writing to file:', err); } });</code>: Append the transaction hash to the mempool_transactions.txt file.</li>
                <li><code>parentPort.postMessage({ type: 'mempool', data: txHash });</code>: Send the transaction hash to the parent port.</li>
                <li><code>async getBlockDetails(blockHash) { ... }</code>: Define a method to get the details of a block using its hash.</li>
                <li><code>return new Promise((resolve, reject) => { ... }</code>: Return a promise that resolves with the block details or rejects with an error.</li>
                <li><code>this.ws.send(JSON.stringify({ "jsonrpc": "2.0", "id": 1, "method": "eth_getBlockByHash", "params": [blockHash, true] }), err => { if (err) { return reject(err); } });</code>: Send a request to get the block details using the block hash.</li>
                <li><code>const timeout = setTimeout(() => { reject('Timeout while waiting for block details.'); }, 5000);</code>: Set a timeout to reject the promise if the block details are not received within 5 seconds.</li>
                <li><code>this.ws.once('message', data => { ... }</code>: Set up an event listener for the message event to receive the block details.</li>
                <li><code>clearTimeout(timeout);</code>: Clear the timeout when the block details are received.</li>
                <li><code>const jsonData = JSON.parse(data);</code>: Parse the received data as JSON.</li>
                <li><code>if (jsonData.result) { resolve(jsonData.result); } else { reject('Error: Block details not found (Skipping Block)'); }</code>: Resolve the promise with the block details if they are found, otherwise reject the promise with an error message.</li>
                <li><code>this.latestBlock;</code>: Return the latest block.</li>
                <li><code>const stream = new Stream(nodeUrl, workerData.type);</code>: Create a new Stream instance with the provided node URL and worker data type.</li>
            </ol>
        </section>
        <section>
            <h2>Additional Files</h2>
            <h3><code>credentials.json</code></h3>
            <p>This file contains the necessary credentials and configurations, such as the node URL for connecting to the blockchain.</p>
            <h3>Content:</h3>
            <pre><code>
{
    "nodeUrl": "YOUR_NODE_URL_HERE"
}
            </code></pre>
            <h3><code>result/mempool_transactions.txt</code></h3>
            <p>This file stores the transactions received from the mempool.</p>
            <h3><code>result/private_transactions.txt</code></h3>
            <p>This file stores the private transactions that are filtered out from the latest block.</p>
            <h3><code>test/compare_transactions.cpp</code></h3>
            <p>This script compares <code>mempool_transactions.txt</code> and <code>private_transactions.txt</code>, and prints the common transactions along with their count.</p>
            <h3>Explanation:</h3>
            <ol>
                <li><code>#include &lt;iostream&gt; #include &lt;fstream&gt; #include &lt;unordered_set&gt; #include &lt;string&gt;</code>: Include necessary libraries for input/output, file handling, and data structures.</li>
                <li><code>std::unordered_set&lt;std::string&gt; readTransactions(const std::string&amp; filePath) { ... }</code>: Define a function to read transactions from a file into an unordered_set.</li>
                <li><code>std::ifstream file(filePath);</code>: Open the file for reading.</li>
                <li><code>std::string line;</code>: Define a string to store each line from the file.</li>
                <li><code>if (file.is_open()) { while (std::getline(file, line)) { transactions.insert(line); } file.close(); } else { std::cerr << "Unable to open file: " << filePath << std::endl; }</code>: Read each line from the file and insert it into the transactions set. Close the file when done, and print an error message if the file could not be opened.</li>
                <li><code>return transactions;</code>: Return the set of transactions.</li>
                <li><code>void findCommonTransactions(const std::string&amp; mempoolFile, const std::string&amp; privateFile) { ... }</code>: Define a function to find and print common transactions between two files.</li>
                <li><code>std::unordered_set&lt;std::string&gt; mempoolTransactions = readTransactions(mempoolFile);</code>: Read transactions from the mempool file into a set.</li>
                <li><code>std::unordered_set&lt;std::string&gt; privateTransactions = readTransactions(privateFile);</code>: Read transactions from the private file into a set.</li>
                <li><code>std::unordered_set&lt;std::string&gt; commonTransactions;</code>: Define a set to store common transactions.</li>
                <li><code>for (const auto&amp; tx : mempoolTransactions) { if (privateTransactions find(tx) != privateTransactions.end()) { commonTransactions.insert(tx); } }</code>: Iterate through the mempool transactions and check if each transaction is also in the private transactions set. If it is, add it to the common transactions set.</li>
                <li><code>std::cout << "Number of common transactions: " << commonTransactions.size() << std::endl;</code>: Print the number of common transactions.</li>
                <li><code>for (const auto&amp; tx : commonTransactions) { std::cout << tx << std::endl; }</code>: Print each common transaction.</li>
                <li><code>int main() { const std::string mempoolFile = "result/mempool_transactions.txt"; const std::string privateFile = "result/private_transactions.txt"; findCommonTransactions(mempoolFile, privateFile); return 0; }</code>: Define the main function to find and print common transactions between the mempool and private files.</li>
            </ol>
        </section>
        <section>
            <h2>How to Run the Project</h2>
            <p>Follow these steps to run the project:</p>
            <ol>
                <li><strong>Clone the Repository</strong>:
                    <pre><code>git clone https://github.com/sanctusMarculus/MEV-Protected-Transaction-Detector.git
cd MEV-Protected-Transaction-Detector</code></pre>
                </li>
                <li><strong>Install Dependencies</strong>: Ensure you have Node.js installed. Then run:
                    <pre><code>npm install</code></pre>
                </li>
                <li><strong>Add Your Node URL</strong>: Update <code>credentials.json</code> with your blockchain node URL.</li>
                <li><strong>Run the Project</strong>:
                    <pre><code>node main.js</code></pre>
                </li>
            </ol>
        </section>
        <section class="faq">
            <h2>FAQs</h2>
            <p><strong>Q: What is the purpose of this project?</strong><br>
            A: This project monitors and processes blockchain transactions, identifying and separating private transactions from public ones.</p>
            <p><strong>Q: What technologies are used in this project?</strong><br>
            A: This project uses Node.js for the main application and WebSocket connections, and C++ for the comparison script.</p>
            <p><strong>Q: How are private transactions identified?</strong><br>
            A: Private transactions are identified by comparing transactions in the latest block with those in the mempool. Transactions not in the mempool are considered private.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2024 MEV-Protected-Transaction-Detector</p>
    </footer>
</body>
</html>
