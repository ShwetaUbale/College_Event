const path = require('path');
const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = Number(process.env.PORT || 3000);
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
const databaseName = process.env.MONGO_DB || 'college_event';
const client = new MongoClient(mongoUrl);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', async (_request, response) => {
  try {
    await connectToDatabase();
    await client.db(databaseName).command({ ping: 1 });
    response.json({ status: 'ok', database: 'connected' });
  } catch (_error) {
    response.status(503).json({ status: 'degraded', database: 'disconnected' });
  }
});

app.get('/api/registrations', async (_request, response) => {
  try {
    const registrations = await getRegistrations();
    response.json(registrations);
  } catch (error) {
    console.error('Unable to read registrations:', error.message);
    response.status(500).json({ error: 'Unable to read registrations.' });
  }
});

app.post('/api/registrations', async (request, response) => {
  const { fullName, email, phone, department, year, attendance } = request.body;
  const registration = {
    fullName: String(fullName || '').trim(),
    email: String(email || '').trim().toLowerCase(),
    phone: String(phone || '').trim(),
    department: String(department || '').trim(),
    year: String(year || '').trim(),
    attendance: String(attendance || '').trim(),
    createdAt: new Date()
  };

  if (!registration.fullName || !registration.email || !registration.department || !registration.year || !registration.attendance) {
    return response.status(400).json({ error: 'Please complete all required fields.' });
  }

  if (!/^\S+@\S+\.\S+$/.test(registration.email)) {
    return response.status(400).json({ error: 'Please enter a valid email address.' });
  }

  try {
    const collection = await getCollection();
    const existing = await collection.findOne({ email: registration.email });
    if (existing) {
      return response.status(409).json({ error: 'This email is already registered.' });
    }

    const result = await collection.insertOne(registration);
    response.status(201).json({ id: result.insertedId, message: 'Registration confirmed.' });
  } catch (error) {
    console.error('Unable to save registration:', error.message);
    response.status(500).json({ error: 'Unable to save registration right now.' });
  }
});

async function getCollection() {
  await connectToDatabase();
  const collection = client.db(databaseName).collection('registrations');
  await collection.createIndex({ email: 1 }, { unique: true });
  return collection;
}

async function connectToDatabase() {
  if (!client.topology) {
    await client.connect();
  }
}

async function getRegistrations() {
  const collection = await getCollection();
  return collection.find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
}

app.listen(port, () => {
  console.log(`College event registration app listening on port ${port}`);
});

process.on('SIGTERM', async () => {
  await client.close();
  process.exit(0);
});
