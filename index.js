//початок програми
const { Command } = require('commander');
const http = require('http');
const fs = require('fs');
const path = require('path');

const program = new Command();

program
  .requiredOption('-h, --host <host>', 'Server host')
  .requiredOption('-p, --port <port>', 'Server port')
  .requiredOption('-c, --cache <path>', 'Cache directory');

program.parse(process.argv);

const { host, port, cache } = program.opts();

// створення директорії кешу, якщо не існує
if (!fs.existsSync(cache)) {
  fs.mkdirSync(cache, { recursive: true });
}

const app = require('./server'); // Express app

http.createServer(app).listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
});