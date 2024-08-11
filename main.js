const { Worker } = require('worker_threads');
const path = require('path');

// Function to run the middleware worker
function runMiddleware() {
    const middlewareWorker = new Worker(path.resolve(__dirname, 'src/middleware.js'));

    middlewareWorker.on('message', message => {
        if (message.type === 'updatedBlock') {
            const block = message.data;
            console.log('Updated Block:', block);
        }
    });

    middlewareWorker.on('error', error => console.error('Middleware worker error:', error));
    middlewareWorker.on('exit', code => {
        if (code !== 0) {
            console.error(`Middleware worker stopped with exit code ${code}. Restarting...`);
            runMiddleware(); // Restart middleware worker if it stops unexpectedly
        }
    });
}

runMiddleware();
