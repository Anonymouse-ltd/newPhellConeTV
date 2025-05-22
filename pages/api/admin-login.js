import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';

let db = null;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        if (!db) {
            db = await open({
                filename: './phelcone.db',
                driver: sqlite3.Database,
            });

        }

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }


        const admin = await db.get('SELECT * FROM admin WHERE email = ?', [email]);

        if (!admin) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const passwordMatch = await bcrypt.compare(password, admin.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = `admin-${email}-${Date.now()}`;
        return res.status(200).json({ token });
    } catch (error) {
        console.error('Error during admin login:', error.message);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
