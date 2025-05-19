import formidable from 'formidable';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export const config = {
    api: {
        bodyParser: false,
    },
};

const IMGBB_API_KEY = process.env.IMGBB_API_KEY; // Set your ImgBB API key in env

let db = null;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const form = formidable({ multiples: false });

        const [fields, files] = await form.parse(req);

        const userId = fields.userId?.[0];
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const file = files.image?.[0];
        if (!file) {
            return res.status(400).json({ error: 'Image file is required' });
        }

        const imageData = fs.readFileSync(file.filepath, { encoding: 'base64' });

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                image: imageData,
            }),
        });

        const data = await response.json();

        if (!data.success) {
            return res.status(500).json({ error: 'Failed to upload image to ImgBB' });
        }

        const imageUrl = data.data.url;

        if (!db) {
            db = await open({
                filename: './phelcone.db',
                driver: sqlite3.Database,
            });
        }

        const existingDetails = await db.get('SELECT * FROM user_details WHERE user_id = ?', [userId]);

        if (existingDetails) {
            await db.run('UPDATE user_details SET avatar = ? WHERE user_id = ?', [imageUrl, userId]);
        } else {
            await db.run('INSERT INTO user_details (user_id, avatar) VALUES (?, ?)', [userId, imageUrl]);
        }

        return res.status(200).json({ url: imageUrl });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
