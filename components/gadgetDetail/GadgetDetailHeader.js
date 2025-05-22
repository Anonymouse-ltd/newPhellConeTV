import Head from 'next/head';
import Link from 'next/link';
import Header from '../Header';

export default function GadgetDetailHeader({ gadget }) {
    return (
        <>
            <Head>
                <title>{`${gadget.name} - Phellcone TV`}</title>
            </Head>
            <Header gadgets={[]} onSearchSelect={() => { }} />
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                <Link href="/" className="hover:text-green-700 dark:hover:text-green-400">Home</Link>
                <span className="mx-2">›</span>
                <Link href={`/brands/${gadget.brand.toLowerCase()}`} className="hover:text-green-700 dark:hover:text-green-400 capitalize">{gadget.brand}</Link>
                <span className="mx-2">›</span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">{gadget.name}</span>
            </div>
        </>
    );
}
