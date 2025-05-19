import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db = null;

export default async function handler(req, res) {
    try {
        console.log('API request received for gadget-details');
        if (!db) {
            console.log('Opening database connection to ./phelcone.db');
            db = await open({
                filename: './phelcone.db',
                driver: sqlite3.Database,
            });
            console.log('Database connection successfully opened');
        }

        const { id } = req.query;

        if (!id) {
            console.error('No ID provided in request query parameters');
            return res.status(400).json({ error: 'Gadget ID is required' });
        }

        console.log(`Fetching gadget details for ID: ${id}`);
        const gadget = await db.get(
            `SELECT g.*, gd.os, gd.color, gd.storage, gd.ram, gd.battery, gd.display, gd.processor, gd.camera
             FROM gadgets g
             LEFT JOIN gadget_details gd ON g.id = gd.gadget_id
             WHERE g.id = ?`,
            [id]
        );

        if (!gadget) {
            console.error(`Gadget not found for ID: ${id}`);
            return res.status(404).json({ error: 'Gadget not found' });
        }

        console.log(`Successfully fetched gadget details for ID: ${id}`);
        res.status(200).json(gadget);
    } catch (error) {
        console.error('Error fetching gadget details:', error.message);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
