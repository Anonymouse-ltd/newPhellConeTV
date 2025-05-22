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

        if (req.method === 'GET') {
            const transactions = await db.all(
                `SELECT t.*, u.username
                 FROM transactions t
                 LEFT JOIN users u ON t.user_id = u.id`
            );
            return res.status(200).json(transactions);
        } else if (req.method === 'POST') {
            const { transactionId, status } = req.body;

            if (!transactionId || !status) {
                return res.status(400).json({ error: 'Transaction ID and status are required' });
            }

            const validStatuses = ['Shipped', 'In-Transit', 'Completed'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: 'Invalid status value' });
            }

            const result = await db.run(
                `UPDATE transactions SET status = ? WHERE id = ?`,
                [status, transactionId]
            );

            if (result.changes === 0) {
                return res.status(404).json({ error: 'Transaction not found' });
            }


            return res.status(200).json({ success: true, message: 'Status updated successfully' });
        } else {
            return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Error handling transactions:', error.message);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
