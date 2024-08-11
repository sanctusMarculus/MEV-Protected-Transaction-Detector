<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MEV-Korumalı-İşlem-Detektörü</title>
</head>
<body>
    <header>
        <h1>MEV-Korumalı-İşlem-Detektörü</h1>
    </header>
    <main>
        <section>
            <h2>Açıklama</h2>
            <p>MEV-Korumalı-İşlem-Detektörü projesi, blockchain işlemlerini izlemek ve işlemek için tasarlanmıştır. WebSocket bağlantılarını kullanarak yeni bloklar ve mempool işlemleri (bir bloğa dahil edilmeyi bekleyen işlemler) hakkında gerçek zamanlı veriler alır. Proje, bu işlemleri filtreleyerek özel işlemleri kamu işlemlerinden ayırır ve bunları metin dosyalarına kaydeder.</p>
        </section>
        <section>
            <h2>Proje Yapısı</h2>
            <p>Proje aşağıdaki dosyalardan oluşur:</p>
            <ul>
                <li><code>main.js</code>: Uygulamanın giriş noktası.</li>
                <li><code>src/middleware.js</code>: Mempool ve blok verilerinin toplanması ve işlenmesini sağlar.</li>
                <li><code>src/stream.js</code>: Yeni bloklar ve mempool işlemleri hakkında gerçek zamanlı veri almak için WebSocket bağlantılarını yönetir.</li>
                <li><code>result/mempool_transactions.txt</code>: Mempool'dan alınan işlemleri depolar.</li>
                <li><code>result/private_transactions.txt</code>: En son bloktan filtrelenen özel işlemleri depolar.</li>
                <li><code>test/compare_transactions.cpp</code>: Mempool ve özel işlemleri karşılaştırır ve ortak işlemleri sayılarıyla birlikte yazdırır.</li>
                <li><code>credentials.json</code>: Blockchain'e bağlanmak için gerekli kimlik bilgilerini ve yapılandırmaları içerir.</li>
            </ul>
        </section>
        <section>
            <h2>Ana Betikler</h2>
            <h3><code>main.js</code></h3>
            <p>Bu betik, <code>middleware.js</code>'i bir işçi olarak çalıştırır ve güncellenmiş blok bilgilerini aldığında görüntüler.</p>
            <h3>Açıklama:</h3>
            <ol>
                <li><code>const { Worker } = require('worker_threads');</code>: Worker sınıfını worker_threads modülünden içe aktarır, bu sınıf işçi iş parçacıkları oluşturmak için kullanılır.</li>
                <li><code>const path = require('path');</code>: Dosya ve dizin yolları ile çalışmak için kullanılan path modülünü içe aktarır.</li>
                <li><code>function runMiddleware() { ... }</code>: <code>src/middleware.js</code> betiğini çalıştıran ve yöneten bir işçi iş parçacığı oluşturan ve yöneten bir fonksiyon tanımlar.</li>
                <li><code>const middlewareWorker = new Worker(path.resolve(__dirname, 'src/middleware.js'));</code>: Middleware betiğinin yolunu belirterek yeni bir Worker örneği oluşturur.</li>
                <li><code>middlewareWorker.on('message', message => { ... });</code>: İşçiden gelen mesajlar için bir olay dinleyicisi kurar. 'updatedBlock' türünde bir mesaj alındığında, güncellenmiş blok verilerini konsola yazdırır.</li>
                <li><code>middlewareWorker.on('error', error => console.error('Middleware işçi hatası:', error));</code>: İşçiden gelen hatalar için bir olay dinleyicisi kurar ve bunları konsola yazdırır.</li>
                <li><code>middlewareWorker.on('exit', code => { ... });</code>: İşçinin çıkış olayı için bir olay dinleyicisi kurar. Çıkış kodu 0 değilse, bir hata kaydeder ve runMiddleware fonksiyonunu çağırarak işçiyi yeniden başlatır.</li>
                <li><code>runMiddleware();</code>: İşçiyi başlatmak için runMiddleware fonksiyonunu çağırır.</li>
            </ol>
        </section>
        <section>
            <h3><code>src/middleware.js</code></h3>
            <p>Bu betik, mempool verilerinin ve en son blok verilerinin toplanması ve işlenmesini sağlar. En son bloğu özel işlemlerle günceller ve güncellenmiş bloğu <code>main.js</code>'e gönderir.</p>
            <h3>Açıklama:</h3>
            <ol>
                <li><code>const { Worker, parentPort } = require('worker_threads');</code>: Worker ve parentPort sınıflarını worker_threads modülünden içe aktarır.</li>
                <li><code>const path = require('path');</code>: Path modülünü içe aktarır.</li>
                <li><code>const fs = require('fs');</code>: Dosya sistemi ile etkileşim için bir API sağlayan fs (dosya sistemi) modülünü içe aktarır.</li>
                <li><code>const { nodeUrl } = require('../credentials.json');</code>: credentials.json dosyasından nodeUrl'yi içe aktarır.</li>
                <li><code>if (!nodeUrl) { throw new Error("Node URL is not defined in credentials.json"); }</code>: nodeUrl'nin tanımlı olup olmadığını kontrol eder ve tanımlı değilse bir hata fırlatır.</li>
                <li><code>let mempoolData = []; let latestBlock = null; let updatedBlock = null;</code>: Mempool verilerini, en son bloğu ve güncellenmiş bloğu depolamak için değişkenler tanımlar.</li>
                <li><code>function updateLatestBlockWithPrivateTransactions(latestBlock, mempoolData) { ... }</code>: En son bloğu özel işlemlerle güncellemek için bir fonksiyon tanımlar.</li>
                <li><code>const latestBlockTransactions = latestBlock.transactions || [];</code>: En son bloktan işlemleri çıkarır veya hiçbiri yoksa boş bir dizi başlatır.</li>
                <li><code>const privateTransactions = latestBlockTransactions.filter(tx => !mempoolData.includes(tx));</code>: Mempool'da bulunmayan işlemleri filtreler ve bunları özel olarak değerlendirir.</li>
                <li><code>const publicTransactions = latestBlockTransactions.filter(tx => mempoolData.includes(tx));</code>: Mempool'da bulunan işlemleri filtreler ve bunları kamu olarak değerlendirir.</li>
                <li><code>latestBlock.transactions = publicTransactions;</code>: En son bloğu kamu işlemleri ile günceller.</li>
                <li><code>latestBlock.private_transactions = privateTransactions;</code>: En son bloğu özel işlemler ile günceller.</li>
                <li><code>latestBlock.publicTransactionsNumber = publicTransactions.length;</code>: En son bloğa kamu işlemlerinin sayısını ekler.</li>
                <li><code>latestBlock.privateTransactionsNumber = privateTransactions.length;</code>: En son bloğa özel işlemlerinin sayısını ekler.</li>
                <li><code>const filePath = path.resolve(__dirname, '../result/private_transactions.txt');</code>: private_transactions.txt dosyasının yolunu çözer.</li>
                <li><code>privateTransactions.forEach(tx => { fs.appendFile(filePath, tx + '\n', (err) => { if (err) { console.error('Dosyaya yazma hatası:', err); } }); });</code>: Her özel işlemi private_transactions.txt dosyasına ekler.</li>
                <li><code>return latestBlock;</code>: Güncellenmiş en son bloğu döndürür.</li>
                <li><code>function runWorker(workerData) { ... }</code>: Bir işçi iş parçacığını çalıştırmak için bir fonksiyon tanımlar.</li>
                <li><code>const worker = new Worker(path.resolve(__dirname, 'stream.js'), { workerData });</code>: Sağlanan işçi verileri ile stream.js betiği için yeni bir Worker örneği oluşturur.</li>
                <li><code>worker.on('message', message => { ... });</code>: İşçiden gelen mesajlar için bir olay dinleyicisi kurar. Bir blok mesajı alınırsa, en son bloğu günceller ve güncellenmiş blok mesajını ana porta gönderir. Bir mempool mesajı alınırsa, mempool verilerine ekler.</li>
                <li><code>worker.on('error', error => console.error('İşçi hatası:', error));</code>: İşçiden gelen hatalar için bir olay dinleyicisi kurar ve bunları konsola yazdırır.</li>
                <li><code>worker.on('exit', code => { ... });</code>: İşçinin çıkış olayı için bir olay dinleyicisi kurar. Çıkış kodu 0 değilse, bir hata kaydeder ve runWorker fonksiyonunu çağırarak işçiyi yeniden başlatır.</li>
                <li><code>return worker;</code>: İşçi örneğini döndürür.</li>
                <li><code>async function main() { ... }</code>: İşçileri başlatmak için bir asenkron ana fonksiyon tanımlar.</li>
                <li><code>runWorker({ type: 'mempool' });</code>: Mempool işçisini başlatır.</li>
                <li><code>await new Promise(resolve => setTimeout(resolve, 13500));</code>: Mempool işçisinin blok işçisini başlatmadan önce başlatıldığından emin olmak için 13.5 saniye bekler.</li>
                <li><code>runWorker({ type: 'blocks' });</code>: Blok işçisini başlatır.</li>
                <li><code>main();</code>: İşçileri başlatmak için ana fonksiyonu çağırır.</li>
            </ol>
        </section>
        <section>
            <h3><code>src/stream.js</code></h3>
            <p>Bu betik, yeni bloklar ve mempool işlemleri hakkında gerçek zamanlı veri almak için WebSocket bağlantılarını yönetir. Bu verileri <code>middleware.js</code>'e gönderir.</p>
            <h3>Açıklama:</h3>
            <ol>
                <li><code>const { WebSocket } = require('ws');</code>: WebSocket sınıfını ws modülünden içe aktarır.</li>
                <li><code>const { parentPort, workerData } = require('worker_threads');</code>: Worker_threads modülünden parentPort ve workerData sınıflarını içe aktarır.</li>
                <li><code>const { nodeUrl } = require('../credentials.json');</code>: credentials.json dosyasından nodeUrl'yi içe aktarır.</li>
                <li><code>const fs = require('fs');</code>: Fs (dosya sistemi) modülünü içe aktarır.</li>
                <li><code>const path = require('path');</code>: Path modülünü içe aktarır.</li>
                <li><code>if (!nodeUrl) { throw new Error("Node URL is not defined in credentials.json"); }</code>: NodeUrl'nin tanımlı olup olmadığını kontrol eder ve tanımlı değilse bir hata fırlatır.</li>
                <li><code>class Stream { constructor(nodeUrl, type) { ... } }</code>: NodeUrl ve tür parametrelerini alan bir yapıcıya sahip bir Stream sınıfı tanımlar.</li>
                <li><code>this.nodeUrl = nodeUrl; this.type = type; this.ws = new WebSocket(nodeUrl); this.latestBlock = null;</code>: Sınıf özelliklerini başlatır.</li>
                <li><code>this.initialize();</code>: WebSocket bağlantısını ve olay dinleyicilerini kurmak için initialize yöntemini çağırır.</li>
                <li><code>initialize() { ... }</code>: WebSocket bağlantısını ve olay dinleyicilerini kurmak için initialize yöntemini tanımlar.</li>
                <li><code>if (this.type === 'blocks') { ... } else if (this.type === 'mempool') { ... }</code>: Türüne (bloklar veya mempool) bağlı olarak WebSocket bağlantısını ve olay dinleyicilerini kurar.</li>
                <li><code>subscribeToNewBlocks() { ... }</code>: WebSocket üzerinden yeni bloklara abone olmak için bir yöntem tanımlar.</li>
                <li><code>subscribeToNewPendingTransactions() { ... }</code>: WebSocket üzerinden yeni bekleyen işlemlere abone olmak için bir yöntem tanımlar.</li>
                <li><code>handleError(error) { ... }</code>: WebSocket bağlantısı için bir hata işleyici yöntemi tanımlar.</li>
                <li><code>handleClose() { ... }</code>: WebSocket bağlantısı için bir kapatma işleyici yöntemi tanımlar.</li>
                <li><code>async handleNewBlockMessage(data) { ... }</code>: WebSocket bağlantısından yeni blok mesajlarını işlemek için bir yöntem tanımlar.</li>
                <li><code>const jsonData = JSON.parse(data);</code>: Alınan verileri JSON olarak ayrıştırır.</li>
                <li><code>if (jsonData.params && jsonData.params.result) { ... }</code>: Alınan verilerin blok bilgilerini içerip içermediğini kontrol eder.</li>
                <li><code>const blockHash = jsonData.params.result.hash;</code>: Alınan verilerden blok hash'ini çıkarır.</li>
                <li><code>const blockDetails = await this.getBlockDetails(blockHash);</code>: Blok hash'ini kullanarak bloğun detaylarını alır.</li>
                <li><code>this.latestBlock = { number: parseInt(blockDetails.number, 16), hash: blockHash, transactions: blockDetails.transactions.map(tx => tx.hash) };</code>: Blok detaylarını latestBlock özelliğinde depolar.</li>
                <li><code>parentPort.postMessage({ type: 'block', data: this.latestBlock });</code>: Blok detaylarını ana porta gönderir.</li>
                <li><code>handleNewMempoolMessage(data) { ... }</code>: WebSocket bağlantısından yeni mempool mesajlarını işlemek için bir yöntem tanımlar.</li>
                <li><code>const message = JSON.parse(data);</code>: Alınan verileri JSON olarak ayrıştırır.</li>
                <li><code>if (message.method === 'eth_subscription' && message.params.subscription) { ... }</code>: Alınan verilerin mempool işlem bilgilerini içerip içermediğini kontrol eder.</li>
                <li><code>const txHash = message.params.result;</code>: Alınan verilerden işlem hash'ini çıkarır.</li>
                <li><code>const filePath = path.resolve(__dirname, '../result/mempool_transactions.txt');</code>: mempool_transactions.txt dosyasının yolunu çözer.</li>
                <li><code>fs.appendFile(filePath, txHash + '\n', (err) => { if (err) { console.error('Dosyaya yazma hatası:', err); } });</code>: İşlem hash'ini mempool_transactions.txt dosyasına ekler.</li>
                <li><code>parentPort.postMessage({ type: 'mempool', data: txHash });</code>: İşlem hash'ini ana porta gönderir.</li>
                <li><code>async getBlockDetails(blockHash) { ... }</code>: Blok hash'ini kullanarak bloğun detaylarını almak için bir yöntem tanımlar.</li>
                <li><code>return new Promise((resolve, reject) => { ... }</code>: Blok detayları ile çözülen veya bir hata ile reddedilen bir vaat döndürür.</li>
                <li><code>this.ws.send(JSON.stringify({ "jsonrpc": "2.0", "id": 1, "method": "eth_getBlockByHash", "params": [blockHash, true] }), err => { if (err) { return reject(err); } });</code>: Blok hash'ini kullanarak blok detaylarını almak için bir istek gönderir.</li>
                <li><code>const timeout = setTimeout(() => { reject('Blok detaylarını beklerken zaman aşımı.'); }, 5000);</code>: Blok detayları 5 saniye içinde alınmazsa vaat'i reddetmek için bir zaman aşımı ayarlar.</li>
                <li><code>this.ws.once('message', data => { ... }</code>: Blok detaylarını almak için message olayı için bir olay dinleyicisi kurar.</li>
                <li><code>clearTimeout(timeout);</code>: Blok detayları alındığında zaman aşımını temizler.</li>
                <li><code>const jsonData = JSON.parse(data);</code>: Alınan verileri JSON olarak ayrıştırır.</li>
                <li><code>if (jsonData.result) { resolve(jsonData.result); } else { reject('Hata: Blok detayları bulunamadı (Blok atlanıyor)'); }</code>: Blok detayları bulunursa vaat'i blok detayları ile çözer, aksi takdirde vaat'i bir hata mesajı ile reddeder.</li>
                <li><code>this.latestBlock;</code>: En son bloğu döndürür.</li>
                <li><code>const stream = new Stream(nodeUrl, workerData.type);</code>: Sağlanan node URL'si ve işçi veri türü ile yeni bir Stream örneği oluşturur.</li>
            </ol>
        </section>
        <section>
            <h2>Ek Dosyalar</h2>
            <h3><code>credentials.json</code></h3>
            <p>Bu dosya, blockchain'e bağlanmak için gerekli kimlik bilgilerini ve yapılandırmaları içerir.</p>
            <h3>İçerik:</h3>
            <pre><code>
{
    "nodeUrl": "YOUR_NODE_URL_HERE"
}
            </code></pre>
            <h3><code>result/mempool_transactions.txt</code></h3>
            <p>Bu dosya, mempool'dan alınan işlemleri depolar.</p>
            <h3><code>result/private_transactions.txt</code></h3>
            <p>Bu dosya, en son bloktan filtrelenen özel işlemleri depolar.</p>
            <h3><code>test/compare_transactions.cpp</code></h3>
            <p>Bu betik, <code>mempool_transactions.txt</code> ve <code>private_transactions.txt</code> dosyalarını karşılaştırır ve ortak işlemleri sayılarıyla birlikte yazdırır.</p>
            <h3>Açıklama:</h3>
            <ol>
                <li><code>#include &lt;iostream&gt; #include &lt;fstream&gt; #include &lt;unordered_set&gt; #include &lt;string&gt;</code>: Giriş/çıkış, dosya işleme ve veri yapıları için gerekli kütüphaneleri içe aktarır.</li>
                <li><code>std::unordered_set&lt;std::string&gt; readTransactions(const std::string&amp; filePath) { ... }</code>: Bir dosyadan işlemleri bir unordered_set'e okumak için bir fonksiyon tanımlar.</li>
                <li><code>std::ifstream file(filePath);</code>: Dosyayı okumak için açar.</li>
                <li><code>std::string line;</code>: Dosyadan her satırı saklamak için bir dize tanımlar.</li>
                <li><code>if (file.is_open()) { while (std::getline(file, line)) { transactions.insert(line); } file.close(); } else { std::cerr << "Dosya açılamadı: " << filePath << std::endl; }</code>: Dosyadan her satırı okur ve işlemler kümesine ekler. İşlem tamamlandığında dosyayı kapatır ve dosya açılamadıysa bir hata mesajı yazdırır.</li>
                <li><code>return transactions;</code>: İşlemler kümesini döndürür.</li>
                <li><code>void findCommonTransactions(const std::string&amp; mempoolFile, const std::string&amp; privateFile) { ... }</code>: İki dosya arasında ortak işlemleri bulmak ve yazdırmak için bir fonksiyon tanımlar.</li>
                <li><code>std::unordered_set&lt;std::string&gt; mempoolTransactions = readTransactions(mempoolFile);</code>: İşlemleri bir küme içinde okumak için mempool dosyasını okur.</li>
                <li><code>std::unordered_set&lt;std::string&gt; privateTransactions = readTransactions(privateFile);</code>: İşlemleri bir küme içinde okumak için özel dosyayı okur.</li>
                <li><code>std::unordered_set&lt;std::string&gt; commonTransactions;</code>: Ortak işlemleri saklamak için bir küme tanımlar.</li>
                <li><code>for (const auto&amp; tx : mempoolTransactions) { if (privateTransactions.find(tx) != privateTransactions.end()) { commonTransactions.insert(tx); } }</code>: Mempool işlemleri arasında dolaşır ve her işlemin özel işlemler kümesinde olup olmadığını kontrol eder. Eğer öyleyse, ortak işlemler kümesine ekler.</li>
                <li><code>std::cout << "Ortak işlem sayısı: " << commonTransactions.size() << std::endl;</code>: Ortak işlemlerin sayısını yazdırır.</li>
                <li><code>for (const auto&amp; tx : commonTransactions) { std::cout << tx << std::endl; }</code>: Her ortak işlemi yazdırır.</li>
                <li><code>int main() { const std::string mempoolFile = "result/mempool_transactions.txt"; const std::string privateFile = "result/private_transactions.txt"; findCommonTransactions(mempoolFile, privateFile); return 0; }</code>: Mempool ve özel dosyalar arasında ortak işlemleri bulmak ve yazdırmak için ana fonksiyonu tanımlar.</li>
            </ol>
        </section>
        <section>
            <h2>Projeyi Çalıştırma</h2>
            <p>Projeyi çalıştırmak için aşağıdaki adımları izleyin:</p>
            <ol>
                <li><strong>Depoyu Klonlayın</strong>:
                    <pre><code>git clone https://github.com/sanctusMarculus/MEV-Protected-Transaction-Detector.git
cd MEV-Protected-Transaction-Detector</code></pre>
                </li>
                <li><strong>Bağımlılıkları Yükleyin</strong>: Node.js'in yüklü olduğundan emin olun. Daha sonra şu komutu çalıştırın:
                    <pre><code>npm install</code></pre>
                </li>
                <li><strong>Node URL'nizi Ekleyin</strong>: <code>credentials.json</code> dosyasını blockchain node URL'niz ile güncelleyin.</li>
                <li><strong>Projeyi Çalıştırın</strong>:
                    <pre><code>node main.js</code></pre>
                </li>
            </ol>
        </section>
        <section class="faq">
            <h2>Sıkça Sorulan Sorular</h2>
            <p><strong>S: Bu projenin amacı nedir?</strong><br>
            C: Bu proje, blockchain işlemlerini izler ve işler, özel işlemleri kamu işlemlerinden ayırır.</p>
            <p><strong>S: Bu projede hangi teknolojiler kullanılıyor?</strong><br>
            C: Bu proje, ana uygulama ve WebSocket bağlantıları için Node.js ve karşılaştırma betiği için C++ kullanır.</p>
            <p><strong>S: Özel işlemler nasıl belirlenir?</strong><br>
            C: Özel işlemler, en son bloktaki işlemler ile mempool'daki işlemler karşılaştırılarak belirlenir. Mempool'da olmayan işlemler özel olarak kabul edilir.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2024 MEV-Korumalı-İşlem-Detektörü</p>
    </footer>
</body>
</html>
