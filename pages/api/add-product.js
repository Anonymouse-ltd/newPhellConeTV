import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

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
            console.log('Database connection opened for add-product');
        }

        const { brand, name, price, os, color, storage, ram, battery, display, processor, camera } = req.body;

        if (!brand || !name || !price) {
            return res.status(400).json({ error: 'Brand, name, and price are required' });
        }

        // Start a transaction to ensure data consistency across tables
        await db.run('BEGIN TRANSACTION');

        // Insert into gadgets table
        const gadgetResult = await db.run(
            'INSERT INTO gadgets (brand, name, price) VALUES (?, ?, ?)',
            [brand, name, price]
        );

        const gadgetId = gadgetResult.lastID;

        // Insert into gadget_details table
        await db.run(
            'INSERT INTO gadget_details (gadget_id, os, color, storage, ram, battery, display, processor, camera) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [gadgetId, os || null, color || null, storage || null, ram || null, battery || null, display || null, processor || null, camera || null]
        );

        // Commit the transaction
        await db.run('COMMIT');

        console.log(`Product added successfully with ID: ${gadgetId}`);
        return res.status(201).json({ id: gadgetId, message: 'Product added successfully' });
    } catch (error) {
        // Rollback the transaction in case of error
        if (db) {
            await db.run('ROLLBACK');
        }
        console.error('Error adding product:', error.message);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
