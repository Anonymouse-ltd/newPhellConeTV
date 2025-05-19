import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import Banner from '../components/Banner';
import ProductGrid from '../components/ProductGrid';

export default function Home() {
    const [gadgets, setGadgets] = useState([]);
    const [filteredGadgets, setFilteredGadgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBrand, setSelectedBrand] = useState('All');

    useEffect(() => {
        fetch('/api/gadgets')
            .then(res => res.json())
            .then(data => {
                setGadgets(data);
                setFilteredGadgets(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching gadgets:', error);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        let filtered = gadgets;
        if (selectedBrand !== 'All') {
            filtered = filtered.filter(gadget => gadget.brand.toLowerCase() === selectedBrand.toLowerCase());
        }
        setFilteredGadgets(filtered);
    }, [selectedBrand, gadgets]);

    const handleBrandChange = (brand) => setSelectedBrand(brand);
    const handleSearchSelect = (gadget) => { };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:bg-gradient-to-br dark:from-green-900 dark:via-gray-800 dark:to-blue-900">
            <Header gadgets={gadgets} onSearchSelect={handleSearchSelect} />
            <Navigation selectedBrand={selectedBrand} onBrandChange={handleBrandChange} />
            <Banner />
            <ProductGrid gadgets={filteredGadgets} loading={loading} />
            <footer className="p-6 text-center text-sm text-gray-400 dark:text-gray-500 bg-gray-900 dark:bg-gray-800 mt-12">
                © 2025 Phellcone TV. All rights reserved.
            </footer>
        </div>
    );
}
