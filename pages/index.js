import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import Banner from '../components/Banner';
import ProductGrid from '../components/ProductGrid';
import fs from 'fs';
import path from 'path';

function findCoverImage(brand, gadgetName) {
    const baseDir = path.join(process.cwd(), 'public', brand.toLowerCase());
    const folderVariations = [
        gadgetName.toLowerCase(),
        gadgetName.toUpperCase(),
        gadgetName
    ];
    for (const folder of folderVariations) {
        const folderPath = path.join(baseDir, folder);
        try {
            if (fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory()) {
                const files = fs.readdirSync(folderPath);
                for (const file of files) {
                    const fileNameWithoutExt = path.basename(file, path.extname(file)).toLowerCase();
                    if (fileNameWithoutExt === 'cover') {
                        return `/${brand.toLowerCase()}/${folder}/${file}`;
                    }
                }
            }
        } catch (err) {
            console.error(`Error checking folder ${folderPath}:`, err);
        }
    }
    return `/${brand.toLowerCase()}/${gadgetName.toLowerCase()}/cover.png`;
}

export default function Home({ gadgetsWithImages }) {
    const [filteredGadgets, setFilteredGadgets] = useState(gadgetsWithImages);
    const [loading, setLoading] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState('All');

    useEffect(() => {
        let filtered = gadgetsWithImages;
        if (selectedBrand !== 'All') {
            filtered = filtered.filter(gadget => gadget.brand.toLowerCase() === selectedBrand.toLowerCase());
        }
        setFilteredGadgets(filtered);
    }, [selectedBrand]);

    const handleBrandChange = (brand) => setSelectedBrand(brand);
    const handleSearchSelect = (gadget) => { };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:bg-gradient-to-br dark:from-green-900 dark:via-gray-800 dark:to-blue-900">
            <Header gadgets={gadgetsWithImages} onSearchSelect={handleSearchSelect} />
            <Navigation selectedBrand={selectedBrand} onBrandChange={handleBrandChange} />
            <Banner />
            <ProductGrid gadgets={filteredGadgets} loading={loading} />
            <footer className="p-6 text-center text-sm text-gray-400 dark:text-gray-500 bg-gray-900 dark:bg-gray-800 mt-12">
                © 2025 Phellcone TV. All rights reserved.
            </footer>
        </div>
    );
}

export async function getStaticProps() {
    try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${apiBaseUrl}/api/gadgets`);
        if (!res.ok) {
            throw new Error(`Failed to fetch gadgets: ${res.status}`);
        }
        const gadgets = await res.json();
        const gadgetsWithImages = gadgets.map(gadget => {
            const imgSrc = findCoverImage(gadget.brand, gadget.name);
            return { ...gadget, imgSrc };
        });
        return {
            props: {
                gadgetsWithImages
            },
            revalidate: 3600
        };
    } catch (error) {
        console.error('Error in getStaticProps:', error);
        return {
            props: {
                gadgetsWithImages: []
            }
        };
    }
}
