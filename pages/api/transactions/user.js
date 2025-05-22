import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

let db = null;

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        if (!db) {
            db = await open({
                filename: path.join(process.cwd(), 'phelcone.db'),
                driver: sqlite3.Database,
            });
        }

        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const transactions = await db.all(
            `SELECT * FROM transactions WHERE user_id = ? ORDER BY order_date DESC`,
            [userId]
        );

        const processedTransactions = transactions.map(tx => {
            try {
                if (typeof tx.receipts === 'string') {
                    tx.receipts = JSON.parse(tx.receipts);
                    if (tx.receipts.items && typeof tx.receipts.items === 'string') {
                        tx.receipts.items = JSON.parse(tx.receipts.items);
                    }
                }
            } catch (error) {
                console.error(`Error parsing receipts for transaction ID ${tx.id}:`, error);
                tx.receipts = {
                    buyerName: 'Unknown',
                    address: 'Unknown',
                    timestamp: 'Unknown',
                    discountApplied: false,
                    discountType: 'None',
                    discountAmount: '0.00',
                    taxAmount: '0.00',
                    subtotal: '0.00',
                    discountedTotal: '0.00',
                    finalTotal: tx.total_amount ? tx.total_amount.toFixed(2) : '0.00',
                    items: []
                };
            }
            return tx;
        });

        return res.status(200).json(processedTransactions);
    } catch (error) {
        console.error('Error fetching user transactions:', error.message);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
