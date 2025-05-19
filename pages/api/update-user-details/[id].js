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
            console.log('Database connection opened for update-user-details');
        }

        const { id } = req.query;
        console.log('Attempting to update user with ID:', id);

        const user = await db.get('SELECT email, username FROM users WHERE id = ?', [id]);
        if (!user) {
            console.log('User not found in database for ID:', id);
            return res.status(404).json({ error: 'User not found', details: `No user found with ID ${id}` });
        }
        console.log('User found with email:', user.email, 'and username:', user.username);

        const { name, phone, address, avatar, birthday, is_pwd } = req.body;

        const existingDetails = await db.get('SELECT * FROM user_details WHERE user_id = ?', [id]);
        console.log('Existing details for user:', existingDetails ? 'Found' : 'Not found');

        if (existingDetails) {
            await db.run(
                'UPDATE user_details SET name = ?, phone = ?, address = ?, avatar = ?, birthday = ?, is_pwd = ? WHERE user_id = ?',
                [name, phone, address, avatar, birthday, is_pwd ? 1 : 0, id]
            );
            console.log('Updated user details for ID:', id);
        } else {
            await db.run(
                'INSERT INTO user_details (user_id, email, username, name, phone, address, avatar, birthday, is_pwd) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [id, user.email, user.username, name, phone, address, avatar, birthday, is_pwd ? 1 : 0]
            );
            console.log('Inserted new user details for ID:', id);
        }

        return res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating user details:', error.message);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
