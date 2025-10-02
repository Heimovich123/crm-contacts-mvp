const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const PORT = 3000;

const DATA_FILE = path.join(__dirname, 'contacts.json');

// Подключаем парсер JSON
app.use(express.json());

// Раздаём статические файлы (index.html, css, js)
app.use(express.static(__dirname));

// Вспомогательная функция нормализации статуса
function normalizeStatus(val) {
  const s = String(val || '').trim().toLowerCase();
  if (['active','активный','активен','активна','1','true','yes','да'].includes(s)) return 'active';
  if (['inactive','неактивный','не активный','0','false','no','нет'].includes(s)) return 'inactive';
  return 'inactive';
}

// Загрузка контактов
async function loadContacts() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Сохранение контактов
async function saveContacts(contacts) {
  await fs.writeFile(DATA_FILE, JSON.stringify(contacts, null, 2), 'utf8');
}

// --- API ---

// Получение всех контактов
app.get('/contacts', async (req, res) => {
  const contacts = await loadContacts();
  res.json(contacts);
});

// Добавление контакта
app.post('/add-contact', async (req, res) => {
  const contacts = await loadContacts();
  const newContact = {
    id: contacts.length ? Math.max(...contacts.map(c => Number(c.id) || 0)) + 1 : 1,
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    status: normalizeStatus(req.body.status)
  };
  contacts.push(newContact);
  await saveContacts(contacts);
  res.json(newContact);
});

// Удаление контакта
app.delete('/delete-contact/:id', async (req, res) => {
  const id = Number(req.params.id);
  let contacts = await loadContacts();
  const initialLength = contacts.length;
  contacts = contacts.filter(c => Number(c.id) !== id);
  if (contacts.length === initialLength) {
    return res.status(404).json({ error: 'Contact not found' });
  }
  await saveContacts(contacts);
  res.json({ message: 'Contact deleted', id });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
