import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db = null;

export default async function handler(req, res) {
    if (req.method !== 'DELETE') {
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
        await db.run('BEGIN TRANSACTION');
        await db.run('DELETE FROM gadget_details WHERE gadget_id = ?', [id]);
        const result = await db.run('DELETE FROM gadgets WHERE id = ?', [id]);

        if (result.changes === 0) {
            await db.run('ROLLBACK');
            return res.status(404).json({ error: 'Product not found' });
        }

        await db.run('COMMIT');
        return res.status(200).json({ id, message: 'Product removed successfully' });
    } catch (error) {
        if (db) {
            await db.run('ROLLBACK');
        }
        console.error('Error removing product:', error.message);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
