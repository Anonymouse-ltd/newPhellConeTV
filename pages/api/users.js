import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db = null;

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        if (!db) {
            db = await open({
                filename: './phelcone.db',
                driver: sqlite3.Database,
            });
            console.log('Database connection opened for users');
        }

        const users = await db.all('SELECT id, username, email FROM users');

        return res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error.message);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
