const express = require('express');
const fs = require('fs').promises;
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Загружаем контакты
async function loadContacts() {
  const data = await fs.readFile('./contacts.json', 'utf-8');
  return JSON.parse(data);
}

// Сохраняем контакты
async function saveContacts(contacts) {
  await fs.writeFile('./contacts.json', JSON.stringify(contacts, null, 2));
}

// Получение всех контактов
app.get('/contacts', async (req, res) => {
  const contacts = await loadContacts();
  res.json(contacts);
});

// Добавление контакта
app.post('/add-contact', async (req, res) => {
  const contacts = await loadContacts();
  const newContact = {
    id: contacts.length ? contacts[contacts.length - 1].id + 1 : 1,
    ...req.body
  };
  contacts.push(newContact);
  await saveContacts(contacts);
  res.json(newContact);
});

// 🗑 Удаление контакта
app.delete('/delete-contact/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  let contacts = await loadContacts();
  const newContacts = contacts.filter(c => c.id !== id);
  if (newContacts.length === contacts.length) {
    return res.status(404).json({error: 'Контакт не найден'});
  }
  await saveContacts(newContacts);
  res.json({success: true});
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
