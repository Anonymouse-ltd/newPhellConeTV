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
            console.log('Database connection opened for user-details');
        }

        const { id } = req.query;

        const userDetails = await db.get('SELECT * FROM user_details WHERE user_id = ?', [id]);

        if (!userDetails) {
            return res.status(200).json(null);
        }

        return res.status(200).json(userDetails);
    } catch (error) {
        console.error('Error fetching user details:', error.message);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
