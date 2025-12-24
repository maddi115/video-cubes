import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

const db = await open({
    filename: './video-cubes.db',
    driver: sqlite3.Database
});

// Create table if it doesn't exist
await db.exec(`
  CREATE TABLE IF NOT EXISTS blocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    x REAL,
    y REAL,
    z REAL,
    width REAL,
    height REAL
  )
`);

// GET all blocks
app.get('/blocks', async (req, res) => {
    const blocks = await db.all('SELECT * FROM blocks');
    res.json(blocks);
});

// POST a block
app.post('/blocks', async (req, res) => {
    const { type, x, y, z, width, height } = req.body;
    await db.run(
        'INSERT INTO blocks (type,x,y,z,width,height) VALUES (?,?,?,?,?,?)',
        [type, x, y, z, width, height]
    );
    res.json({ ok: true });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Video Cubes backend running on http://localhost:${PORT}`));
