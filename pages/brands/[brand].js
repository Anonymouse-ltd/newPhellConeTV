import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../../components/Header';
import ProductGrid from '../../components/ProductGrid';
import fs from 'fs';
import path from 'path';

export default function BrandPage({ gadgets = [], brand = 'Unknown' }) {
    const router = useRouter();

    if (router.isFallback) {
        return <div className="text-center py-10 text-lg text-gray-700 dark:text-gray-300">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:bg-gradient-to-br dark:from-green-900 dark:via-gray-800 dark:to-blue-900 flex flex-col">
            <Head>
                <title>{brand} - Phellcone TV</title>
            </Head>
            <Header gadgets={gadgets} onSearchSelect={() => { }} />
            <main className="flex-grow max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-extrabold mb-8 text-green-700 dark:text-green-400 tracking-tight capitalize">{brand}</h1>
                <ProductGrid gadgets={gadgets} loading={false} />
            </main>
            <footer className="p-6 text-center text-sm text-gray-400 dark:text-gray-500 bg-gray-900 dark:bg-gray-800 mt-auto">
                © 2025 Phellcone TV. All rights reserved.
            </footer>
        </div>
    );
}

export async function getStaticPaths() {
    try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${apiBaseUrl}/api/gadgets`);
        if (!res.ok) {
            throw new Error(`Failed to fetch gadgets: ${res.status}`);
        }
        const gadgets = await res.json();
        const brands = Array.from(new Set(gadgets.map(g => g.brand.toLowerCase())));

        return {
            paths: brands.map(brand => ({
                params: { brand }
            })),
            fallback: true
        };
    } catch (error) {
        console.error('Error in getStaticPaths:', error);

        return {
            paths: [],
            fallback: true
        };
    }
}

export async function getStaticProps({ params }) {
    try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${apiBaseUrl}/api/gadgets`);
        if (!res.ok) {
            throw new Error(`Failed to fetch gadgets: ${res.status}`);
        }
        const allGadgets = await res.json();
        const brand = params.brand;
        const filteredGadgets = allGadgets.filter(g => g.brand.toLowerCase() === brand.toLowerCase());

        // Add imgSrc to each gadget
        const gadgets = filteredGadgets.map(gadget => {
            const imgSrc = findCoverImage(gadget.brand, gadget.name);
            return { ...gadget, imgSrc };
        });

        return {
            props: {
                gadgets,
                brand
            },
            revalidate: 3600 // Revalidate every hour
        };
    } catch (error) {
        console.error(`Error fetching gadgets for brand ${params.brand}:`, error);
        return {
            props: {
                gadgets: [],
                brand: params.brand
            }
        };
    }
}

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
