import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';

let db = null;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, username, email, birthdate, password } = req.body;

    if (!name || !username || !email || !birthdate || !password) {
        return res.status(400).json({ error: 'Name, username, email, birthdate, and password are required.' });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ error: 'Invalid email format.' });
    }

    const passwordValidation = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    if (!passwordValidation.test(password)) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long and include an uppercase letter, a digit, and a special character.' });
    }

    try {
        if (!db) {
            db = await open({
                filename: './phelcone.db',
                driver: sqlite3.Database,
            });
            console.log('Database connection opened for signup');
        }

        const existingUsername = await db.get('SELECT id FROM users WHERE username = ?', username);
        if (existingUsername) {
            return res.status(409).json({ error: 'Username already exists. Please choose another.' });
        }

        const existingEmail = await db.get('SELECT id FROM users WHERE email = ?', email);
        if (existingEmail) {
            return res.status(409).json({ error: 'Email already registered. Please use another email.' });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const userResult = await db.run(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            username,
            email,
            passwordHash
        );

        if (userResult.changes !== 1) {
            throw new Error('Failed to create user in users table.');
        }

        const userId = userResult.lastID;

        await db.run(
            'INSERT INTO user_details (user_id, email, username, name, birthday, is_pwd) VALUES (?, ?, ?, ?, ?, ?)',
            userId,
            email,
            username,
            name,
            birthdate,
            0
        );

        return res.status(201).json({
            message: 'Sign up successful',
            user: {
                id: userId,
                username,
                email,
            },
        });
    } catch (error) {
        console.error('Error during signup:', error);
        return res.status(500).json({ error: 'An error occurred during sign up. Please try again.' });
    }
}
