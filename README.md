<!DOCTYPE html>
<html>
<head>
</head>
<body>

<h1>
MEV-Protected-Transaction-Detector
</h1>

<h2>Description</h2>

<p>This program is a JavaScript application designed to capture private transactions in real-time as the newest block generated. It utilizes WebSocket connections to subscribe to new block headers and mempool transactions, enabling the extraction of private transaction frequency information in the last block.</p>

<h2>Features</h2>

<ul>
    <li>Real-time monitoring enables timely detection of private transactions.</li>
    <li>Asynchronous handling ensures lightweight and fast operation.</li>
    <li>WebSocket connections provide efficient communication with the blockchain node.</li>
    <li>Flexible and customizable for integration into various research and analysis projects.</li>

</ul>

<h2>How It Works</h2>

<p>The application operates by:</p>

<ol>
    <li>Establishing WebSocket connections to the blockchain node for both blocks and the mempool.</li>
    <li>Subscribing to new block headers and mempool transactions.</li>
    <li>Upon receiving new block headers, fetching block details to extract transaction information.</li>
    <li>Comparing transactions in the mempool with those in the newly generated blocks to identify private transactions.</li>
    <li>Storing relevant information about private transactions, including transaction hashes, block numbers, and block hashes.</li>
</ol>

<h2>Usage</h2>

<p>Before running the application, ensure you have Node.js installed on your system.</p>

<h3>Installation</h3>

<ol>
    <li>Clone the repository to your local machine.</li>
    <li>Install dependencies using npm:</li>
</ol>

<pre><code>npm install ws</code></pre>

<h3>Configuration</h3>

<p>Update the <code>NODE-URL</code> variable in the script with the URL of your blockchain node.</p>

<h3>Running the Application</h3>

<p>Start the application by running:</p>

<pre><code>node private_transaction_monitor.js</code></pre>


<h2>Example Output</h2>

<p>Below is an example output demonstrating the information captured by the script:</p>

<pre><code>
Block Number: 38067524
Block Hash: 0x1628d670f5b557d46c2bf18ada40ad23035fa07e624fbbb77592851435af0bb2
Private: 9      Public: 54      Total: 63
</code></pre>


<h2>Usage in Research</h2>

<p>The Real-Time Private Transaction Monitor can be utilized in various research and analysis projects, including:</p>

<ul>
  <li>Studying the prevalence and patterns of private transactions on the blockchain.</li>
  <li>Investigating the privacy features and implications of blockchain technologies.</li>
  <li>Analyzing the impact of privacy-preserving protocols on transaction visibility.</li>
  <li>Monitoring and detecting potentially illicit activities involving private transactions.</li>

  <li>Consider adding functionality to save the transaction hashes of private transactions to a database, enabling further analysis and tracking.</li>
  <li>Explore implementing additional features to provide more detailed information about each transaction, offering users deeper insights.</li>
  <li>Think about enhancing plotting capabilities to visualize transaction data in more complex and informative ways, aiding in data interpretation.</li>
  
  

</ul>

<h2>Disclaimer</h2>

<p>This application is intended for research and informational purposes only. Users are advised to use it responsibly and in compliance with all applicable laws and regulations. The authors of this application are not liable for any misuse or consequences arising from its use.</p>

</body>
</html>
