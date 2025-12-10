// Початок програми
const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// storage для фото
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

let inventory = [];
let idCounter = 1;

// POST /register
app.post('/register', upload.single('photo'), (req, res) => {
  const { inventory_name, description } = req.body;
  if (!inventory_name) {
    return res.status(400).send('Name is required');
  }
  const item = {
    id: idCounter++,
    name: inventory_name,
    description,
    photo: req.file ? req.file.filename : null
  };
  inventory.push(item);
  res.status(201).json(item);
});

// GET /inventory
app.get('/inventory', (req, res) => {
  res.json(inventory);
});

// GET /inventory/:id
app.get('/inventory/:id', (req, res) => {
  const item = inventory.find(i => i.id == req.params.id);
  if (!item) return res.status(404).send('Not found');
  res.json(item);
});

// PUT /inventory/:id
app.put('/inventory/:id', (req, res) => {
  const item = inventory.find(i => i.id == req.params.id);
  if (!item) return res.status(404).send('Not found');
  if (req.body.name) item.name = req.body.name;
  if (req.body.description) item.description = req.body.description;
  res.json(item);
});

// GET /inventory/:id/photo
app.get('/inventory/:id/photo', (req, res) => {
  const item = inventory.find(i => i.id == req.params.id);
  if (!item || !item.photo) return res.status(404).send('Not found');
  res.sendFile(path.join(__dirname, 'uploads', item.photo));
});

//  PUT /inventory/:id/photo
app.put('/inventory/:id/photo', upload.single('photo'), (req, res) => {
  const item = inventory.find(i => i.id == req.params.id);
  if (!item) return res.status(404).send('Not found');
  if (!req.file) return res.status(400).send('No file uploaded');
  item.photo = req.file.filename;
  res.sendStatus(200);
});

// DELETE /inventory/:id
app.delete('/inventory/:id', (req, res) => {
  const index = inventory.findIndex(i => i.id == req.params.id);
  if (index === -1) return res.status(404).send('Not found');
  inventory.splice(index, 1);
  res.sendStatus(200);
});

// POST /search
app.post('/search', (req, res) => {
  const { id, has_photo } = req.body;
  const item = inventory.find(i => i.id == id);
  if (!item) return res.status(404).send('Not found');

  const result = { ...item };
  if (has_photo === 'true' && item.photo) {
    result.description += ` Фото: /inventory/${item.id}/photo`;
  }
  res.json(result);
});

// HTML форми
app.get('/RegisterForm.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'RegisterForm.html'));
});

app.get('/SearchForm.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'SearchForm.html'));
});

// 405 Method Not Allowed
app.use((req, res) => {
  res.status(405).send('Method Not Allowed');
});

const args = process.argv.slice(2);
let host = 'localhost';
let port = 3000;
let cache = false;

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '-h':
      host = args[i + 1];
      i++;
      break;
    case '-p':
      port = parseInt(args[i + 1], 10);
      i++;
      break;
    case '-c':
      cache = args[i + 1];
      i++;
      break;
  }
}

// -------------------- Запуск сервера --------------------
app.listen(port, host, () => {
  console.log(` Server running on http://${host}:${port}`);
  console.log(`Cache option: ${cache}`);
});
