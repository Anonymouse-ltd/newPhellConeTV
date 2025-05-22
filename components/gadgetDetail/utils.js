import fs from 'fs';
import path from 'path';

export function findCoverImage(brand, gadgetName) {
    const baseDir = path.join(process.cwd(), 'public', brand.toLowerCase(), gadgetName.toLowerCase());
    try {
        if (fs.existsSync(baseDir)) {
            const files = fs.readdirSync(baseDir);
            const coverFile = files.find(file => file.includes('cover'));
            if (coverFile) {
                return `/${brand.toLowerCase()}/${gadgetName.toLowerCase()}/${coverFile}`;
            }
        }
    } catch (error) {
        console.error(`Error finding cover image for ${brand}/${gadgetName}:`, error);
    }
    return '/placeholder-image.jpg';
}

export function findAllImages(brand, gadgetName) {
    const baseDir = path.join(process.cwd(), 'public', brand.toLowerCase(), gadgetName.toLowerCase());
    const images = [];
    try {
        if (fs.existsSync(baseDir)) {
            const files = fs.readdirSync(baseDir);
            files.forEach(file => {
                if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
                    images.push(`/${brand.toLowerCase()}/${gadgetName.toLowerCase()}/${file}`);
                }
            });
        }
    } catch (error) {
        console.error(`Error finding images for ${brand}/${gadgetName}:`, error);
    }
    return images.length > 0 ? images : ['/placeholder-image.jpg'];
}
