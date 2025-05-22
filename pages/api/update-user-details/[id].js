import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db = null;

export default async function handler(req, res) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        if (!db) {
            db = await open({
                filename: './phelcone.db',
                driver: sqlite3.Database,
            });
        }

        const { id } = req.query;
        const user = await db.get('SELECT email, username FROM users WHERE id = ?', [id]);
        if (!user) {
            return res.status(404).json({ error: 'User not found', details: `No user found with ID ${id}` });
        }
        const { name, phone, address, avatar, birthday, is_pwd } = req.body;

        const existingDetails = await db.get('SELECT * FROM user_details WHERE user_id = ?', [id]);
        if (existingDetails) {
            await db.run(
                'UPDATE user_details SET name = ?, phone = ?, address = ?, avatar = ?, birthday = ?, is_pwd = ? WHERE user_id = ?',
                [name, phone, address, avatar, birthday, is_pwd ? 1 : 0, id]
            );
        } else {
            await db.run(
                'INSERT INTO user_details (user_id, email, username, name, phone, address, avatar, birthday, is_pwd) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [id, user.email, user.username, name, phone, address, avatar, birthday, is_pwd ? 1 : 0]
            );
        }

        return res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating user details:', error.message);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
