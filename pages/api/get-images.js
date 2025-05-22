import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    const { brand, gadgetName } = req.query;
    const baseDir = path.join(process.cwd(), 'public', brand.toLowerCase(), gadgetName.toLowerCase());

    try {
        if (fs.existsSync(baseDir)) {
            const files = fs.readdirSync(baseDir);
            const coverFile = files.find(file => file.includes('cover'));
            const allImages = files.filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'));

            if (coverFile) {
                res.status(200).json({
                    coverImage: `/${brand.toLowerCase()}/${gadgetName.toLowerCase()}/${coverFile}`,
                    allImages: allImages.map(file => `/${brand.toLowerCase()}/${gadgetName.toLowerCase()}/${file}`)
                });
            } else {
                res.status(200).json({
                    coverImage: '/placeholder-image.jpg',
                    allImages: allImages.length > 0 ? allImages.map(file => `/${brand.toLowerCase()}/${gadgetName.toLowerCase()}/${file}`) : ['/placeholder-image.jpg']
                });
            }
        } else {
            res.status(200).json({
                coverImage: '/placeholder-image.jpg',
                allImages: ['/placeholder-image.jpg']
            });
        }
    } catch (error) {
        console.error(`Error finding images for ${brand}/${gadgetName}:`, error);
        res.status(500).json({ error: 'An error occurred while fetching images.' });
    }
}
