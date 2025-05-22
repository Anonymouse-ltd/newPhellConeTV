import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db = null;

export default async function handler(req, res) {
    try {
        if (!db) {
            db = await open({
                filename: './phelcone.db',
                driver: sqlite3.Database,
            });
        }

        const { id } = req.query;

        if (!id) {
            console.error('No ID provided in request query parameters');
            return res.status(400).json({ error: 'Gadget ID is required' });
        }
        const gadget = await db.get(
            `SELECT g.*, gd.os, gd.colors, gd.storage, gd.ram, gd.battery, gd.display, gd.processor, gd.camera
             FROM gadgets g
             LEFT JOIN gadget_details gd ON g.id = gd.gadget_id
             WHERE g.id = ?`,
            [id]
        );

        if (!gadget) {
            console.error(`Gadget not found for ID: ${id}`);
            return res.status(404).json({ error: 'Gadget not found' });
        }

        if (gadget.colors && typeof gadget.colors === 'string') {
            try {
                gadget.colors = JSON.parse(gadget.colors) || [];
            } catch (e) {
                console.error(`Error parsing colors JSON for gadget ID ${id}:`, e);
                gadget.colors = [];
            }
        } else if (!gadget.colors) {
            gadget.colors = [];
        }

        res.status(200).json(gadget);
    } catch (error) {
        console.error('Error fetching gadget details:', error.message);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
