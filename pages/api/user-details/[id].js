import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

let db = null;

export default async function handler(req, res) {
    try {
        if (!db) {
            db = await open({
                filename: path.join(process.cwd(), 'phelcone.db'),
                driver: sqlite3.Database,
            });
        }

        const { id } = req.query;

        if (!id) {
            console.error('No ID provided in request query parameters');
            return res.status(400).json({ error: 'User ID is required' });
        }
        const user = await db.get(
            `SELECT * FROM user_details WHERE user_id = ?`,
            [id]
        );

        if (!user) {
            console.error(`User not found for ID: ${id}`);
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.wishlist && typeof user.wishlist === 'string') {
            try {
                user.wishlist = JSON.parse(user.wishlist) || [];
            } catch (e) {
                console.error(`Error parsing wishlist JSON for user ID ${id}:`, e);
                user.wishlist = [];
            }
        } else if (!user.wishlist) {
            user.wishlist = [];
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user details:', error.message);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
