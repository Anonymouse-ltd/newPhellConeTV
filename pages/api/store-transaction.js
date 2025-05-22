import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

let db = null;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        if (!db) {
            db = await open({
                filename: path.join(process.cwd(), 'phelcone.db'),
                driver: sqlite3.Database,
            });
        }

        const { userId, cartItems, totalAmount } = req.body;

        if (!userId || !cartItems || !totalAmount) {
            return res.status(400).json({ error: 'User ID, cart items, and total amount are required' });
        }

        const user = await db.get('SELECT * FROM user_details WHERE user_id = ?', [userId]);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.address || user.address.trim() === '' || user.address === 'No Address Provided') {
            return res.status(400).json({ error: 'No address provided. Please add or edit your address in settings before proceeding with the purchase.' });
        }

        const calculateAge = (birthday) => {
            if (!birthday) return 0;
            const bday = new Date(birthday);
            const today = new Date();
            let age = today.getFullYear() - bday.getFullYear();
            const m = today.getMonth() - bday.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < bday.getDate())) {
                age--;
            }
            return age;
        };

        const age = calculateAge(user.birthday);
        const isSeniorCitizen = age >= 60;
        const isPWD = user.is_pwd == 1;
        const isEligibleForDiscount = isSeniorCitizen || isPWD;

        let vatExemptSale = totalAmount / 1.12;
        let discountAmount = 0;
        let discountedTotal = vatExemptSale;
        let taxAmount = 0;
        let finalTotal = totalAmount;

        if (isEligibleForDiscount) {
            discountAmount = vatExemptSale * 0.20;
            discountedTotal = vatExemptSale - discountAmount;
            taxAmount = 0;
            finalTotal = discountedTotal;
        } else {
            discountAmount = 0;
            discountedTotal = totalAmount;
            taxAmount = totalAmount * 0.12;
            finalTotal = totalAmount + taxAmount;
        }

        const orderDate = new Date().toISOString();
        const status = 'Shipped';
        const receipt = JSON.stringify({
            buyerName: user.name || 'Unknown User',
            address: user.address || 'No Address Provided',
            timestamp: new Date().toLocaleString(),
            discountApplied: isEligibleForDiscount,
            discountType: isSeniorCitizen ? 'Senior Citizen' : isPWD ? 'PWD' : 'None',
            discountAmount: discountAmount.toFixed(2),
            taxAmount: taxAmount.toFixed(2),
            subtotal: totalAmount.toFixed(2),
            discountedTotal: discountedTotal.toFixed(2),
            finalTotal: finalTotal.toFixed(2)
        });
        const orders = JSON.stringify(cartItems.map(item => ({
            id: item.id,
            color: item.selectedColor || 'N/A',
            qty: item.quantity
        })));

        const result = await db.run(
            `INSERT INTO transactions (user_id, order_date, total_amount, status, receipts, orders)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, orderDate, finalTotal, status, receipt, orders]
        );

        if (!result || !result.lastID) {
            throw new Error('Failed to store transaction in database');
        }

        for (const item of cartItems) {
            const gadgetId = item.id;
            const quantityPurchased = item.quantity;
            const selectedColor = item.selectedColor || null;

            const gadget = await db.get('SELECT * FROM gadget_details WHERE id = ?', [gadgetId]);
            if (!gadget) continue;

            let colors = [];
            try {
                colors = JSON.parse(gadget.colors);
            } catch (e) {
                continue;
            }

            const colorObj = colors.find(c => c.color === selectedColor);
            if (colorObj) {
                const currentStock = parseInt(colorObj.stock, 10);
                colorObj.stock = Math.max(0, currentStock - quantityPurchased).toString();
                await db.run('UPDATE gadget_details SET colors = ? WHERE id = ?', [JSON.stringify(colors), gadgetId]);
            }
        }

        res.status(200).json({
            success: true,
            message: 'Transaction stored successfully',
            transactionId: result.lastID,
            receiptData: {
                buyerName: user.name || 'Unknown User',
                address: user.address || 'No Address Provided',
                timestamp: new Date().toLocaleString(),
                discountApplied: isEligibleForDiscount,
                discountType: isSeniorCitizen ? 'Senior Citizen' : isPWD ? 'PWD' : 'None',
                discountAmount: discountAmount.toFixed(2),
                taxAmount: taxAmount.toFixed(2),
                subtotal: totalAmount.toFixed(2),
                discountedTotal: discountedTotal.toFixed(2),
                finalTotal: finalTotal.toFixed(2),
                items: cartItems.map(item => ({
                    name: item.name,
                    brand: item.brand,
                    color: item.selectedColor || 'N/A',
                    quantity: item.quantity,
                    price: typeof item.price === 'string'
                        ? parseFloat(item.price.replace(/[^0-9.]/g, ''))
                        : item.price,
                    total: ((typeof item.price === 'string'
                        ? parseFloat(item.price.replace(/[^0-9.]/g, ''))
                        : item.price) * item.quantity).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                }))
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
