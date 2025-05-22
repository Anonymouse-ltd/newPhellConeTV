import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

let db = null;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId, wishlist } = req.body; // Extract userId and wishlist from body for simplicity

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    if (!Array.isArray(wishlist)) {
        return res.status(400).json({ error: 'Wishlist must be an array of gadget IDs' });
    }

    try {
        if (!db) {

            db = await open({
                filename: path.join(process.cwd(), 'phelcone.db'),
                driver: sqlite3.Database,
            });

        }

        // Ensure user exists
        const user = await db.get('SELECT * FROM user_details WHERE user_id = ?', [userId]);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update wishlist
        await db.run(
            `UPDATE user_details SET wishlist = ? WHERE user_id = ?`,
            [JSON.stringify(wishlist), userId]
        );


        res.status(200).json({ success: true, message: 'Wishlist updated successfully' });
    } catch (error) {
        console.error(`Error updating wishlist for user ID ${userId}:`, error.message);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
