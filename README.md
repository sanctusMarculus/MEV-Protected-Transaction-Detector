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
            <h2>Installation</h2>
            <p>To install the project, follow these steps:</p>
            <ol>
                <li><strong>Clone the Repository</strong>:
                    <pre><code>git clone https://github.com/sanctusMarculus/MEV-Protected-Transaction-Detector.git
cd MEV-Protected-Transaction-Detector</code></pre>
                </li>
                <li><strong>Install Dependencies</strong>: Ensure you have Node.js installed. Then run:
                    <pre><code>npm install</code></pre>
                </li>
                <li><strong>Add Your Node URL</strong>: Update <code>credentials.json</code> with your blockchain node URL.</li>
            </ol>
        </section>
        <section>
            <h2>Usage</h2>
            <p>To run the project, use the following command:</p>
            <pre><code>node main.js</code></pre>
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
