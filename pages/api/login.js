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
            console.log('Database connection opened for login');
        }

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const user = await db.get('SELECT * FROM users WHERE email = ?', email);

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const token = `token-${user.id}-${Date.now()}`;
        return res.status(200).json({
            message: 'Login successful',
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ error: 'An error occurred during login. Please try again.' });
    }
}
