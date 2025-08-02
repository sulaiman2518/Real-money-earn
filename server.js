const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

const BOT_TOKEN = '8319073440:AAGn4Im_GFL9KSiqoIizV9kPPbXInU5JeIA';
const ADMIN_ID = '7348601727';

app.use(cors());
app.use(express.json());

let db = {};
const dbPath = './db.json';

if (fs.existsSync(dbPath)) {
  db = JSON.parse(fs.readFileSync(dbPath));
}

function saveDb() {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

app.post('/earn', (req, res) => {
  const { telegram_id } = req.body;
  if (!telegram_id) return res.status(400).json({ message: "No telegram_id" });

  if (!db[telegram_id]) db[telegram_id] = { balance: 0 };
  db[telegram_id].balance += 1;
  saveDb();

  res.json({ message: "✅ 1 BDT added to your balance!" });
});

app.get('/balance', (req, res) => {
  const telegram_id = req.query.telegram_id;
  if (!telegram_id || !db[telegram_id]) return res.json({ balance: 0 });

  res.json({ balance: db[telegram_id].balance });
});

app.post('/withdraw', async (req, res) => {
  const { telegram_id, username, name, method } = req.body;

  if (!telegram_id || !db[telegram_id]) return res.status(400).json({ message: "User not found!" });

  const message = `💸 *Withdraw Request*\n\n👤 Name: ${name}\n🔗 Username: @${username || 'N/A'}\n🆔 ID: ${telegram_id}\n💰 Balance: ${db[telegram_id].balance} BDT\n📱 Payment Method: ${method}`;

  try {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: ADMIN_ID,
      text: message,
      parse_mode: 'Markdown'
    });
  } catch (error) {
    console.error('Telegram message error:', error.message);
  }

  db[telegram_id].balance = 0;
  saveDb();

  res.json({ message: "✅ Withdraw request sent to admin!" });
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
