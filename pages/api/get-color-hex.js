import { colornames } from 'color-name-list';

export default function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { name } = req.query;

    if (!name) {
        return res.status(400).json({ error: 'Color name is required', hex: '#808080' });
    }

    try {
        const normalizedName = name.toLowerCase();
        const match = colornames.find(
            (c) => c.name.toLowerCase() === normalizedName
        );
        const hex = match ? match.hex : '#808080';
        return res.status(200).json({ hex });
    } catch (error) {
        console.error('Error processing color name:', error);
        return res.status(500).json({ error: 'Internal Server Error', hex: '#808080' });
    }
}
