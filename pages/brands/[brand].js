import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../../components/Header';
import ProductGrid from '../../components/ProductGrid';

export default function BrandPage({ gadgets, brand }) {
    const router = useRouter();

    if (router.isFallback) {
        return <div className="text-center py-10 text-lg text-gray-700">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex flex-col">
            <Head>
                <title>{brand} - Phellcone TV</title>
            </Head>
            <Header gadgets={gadgets} onSearchSelect={() => { }} />
            <main className="flex-grow max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-extrabold mb-8 text-green-700 tracking-tight capitalize">{brand}</h1>
                <ProductGrid gadgets={gadgets} loading={false} />
            </main>
            <footer className="p-6 text-center text-sm text-gray-400 bg-gray-900 mt-auto">
                © 2025 Phellcone TV. All rights reserved.
            </footer>
        </div>
    );
}

export async function getStaticPaths() {
    // Fetch all brands from your API or DB
    const res = await fetch('http://localhost:3000/api/gadgets');
    const gadgets = await res.json();
    const brands = Array.from(new Set(gadgets.map(g => g.brand.toLowerCase())));

    return {
        paths: brands.map(brand => ({
            params: { brand }
        })),
        fallback: true
    };
}

export async function getStaticProps({ params }) {
    const res = await fetch('http://localhost:3000/api/gadgets');
    const allGadgets = await res.json();
    const brand = params.brand;
    const gadgets = allGadgets.filter(g => g.brand.toLowerCase() === brand.toLowerCase());

    return {
        props: {
            gadgets,
            brand
        }
    };
}
