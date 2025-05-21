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
            console.log('Database connection opened for edit-product');
        }

        const { id } = req.query;
        const { brand, name, price, os, colors, storage, ram, battery, display, processor, camera } = req.body;

        if (!brand || !name || !price) {
            return res.status(400).json({ error: 'Brand, name, and price are required' });
        }

        await db.run('BEGIN TRANSACTION');

        await db.run(
            'UPDATE gadgets SET brand = ?, name = ?, price = ? WHERE id = ?',
            [brand, name, price, id]
        );

        const detailExists = await db.get('SELECT gadget_id FROM gadget_details WHERE gadget_id = ?', [id]);
        const colorsJson = JSON.stringify(colors || []);
        if (detailExists) {
            await db.run(
                'UPDATE gadget_details SET os = ?, colors = ?, storage = ?, ram = ?, battery = ?, display = ?, processor = ?, camera = ? WHERE gadget_id = ?',
                [os || '', colorsJson, storage || '', ram || '', battery || '', display || '', processor || '', camera || '', id]
            );
        } else {
            await db.run(
                'INSERT INTO gadget_details (gadget_id, os, colors, storage, ram, battery, display, processor, camera) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [id, os || '', colorsJson, storage || '', ram || '', battery || '', display || '', processor || '', camera || '']
            );
        }
        await db.run('COMMIT');

        console.log(`Product updated successfully with ID: ${id}`);
        return res.status(200).json({ id, message: 'Product updated successfully' });
    } catch (error) {
        if (db) {
            await db.run('ROLLBACK');
        }
        console.error('Error updating product:', error.message);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
