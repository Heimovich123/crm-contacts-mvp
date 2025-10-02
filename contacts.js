const fs = require('fs').promises;
const path = require('path');

const DB_PATH = path.join(__dirname, 'contacts.json');

async function loadDB() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.writeFile(DB_PATH, '[]', 'utf8');
      return [];
    }
    throw err;
  }
}

async function saveDB(arr) {
  await fs.writeFile(DB_PATH, JSON.stringify(arr, null, 2), 'utf8');
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeStatus(status) {
  const s = (status || 'активный').toLowerCase();
  if (s === 'активный' || s === 'неактивный') return s;
  throw new Error('Invalid status: use "активный" or "неактивный"');
}

async function getAllContacts() {
  return loadDB();
}

async function addContact(contactData) {
  const { name, email, phone } = contactData;
  if (!name || !email || !phone) {
    throw new Error('Missing required fields: name, email, phone');
  }
  if (!validateEmail(email)) throw new Error('Invalid email format');
  if (typeof phone !== 'string' || !phone.trim()) throw new Error('Invalid phone');

  const db = await loadDB();
  const nextId = db.length ? Math.max(...db.map(c => c.id)) + 1 : 1;

  const newContact = {
    id: nextId,
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    status: normalizeStatus(contactData.status)
  };

  db.push(newContact);
  await saveDB(db);
  return newContact;
}

async function findActiveContacts() {
  const db = await loadDB();
  return db.filter(c => c.status === 'активный');
}

module.exports = {
  getAllContacts,
  addContact,
  findActiveContacts
};