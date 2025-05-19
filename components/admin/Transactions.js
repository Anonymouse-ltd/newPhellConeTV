export default function Transactions({ transactions, isLoadingData }) {
    return (
        <div>
            <h3 className="text-xl font-semibold text-green-700 mb-4">Transactions</h3>
            {isLoadingData ? (
                <div className="text-center py-4 text-gray-700">Loading transactions...</div>
            ) : transactions.length === 0 ? (
                <div className="text-center py-4 text-gray-700">No transactions found.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">User ID</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Order Date</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Total Amount</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(transaction => (
                                <tr key={transaction.id} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 px-4 py-2">{transaction.id}</td>
                                    <td className="border border-gray-300 px-4 py-2">{transaction.user_id}</td>
                                    <td className="border border-gray-300 px-4 py-2">{transaction.order_date}</td>
                                    <td className="border border-gray-300 px-4 py-2">{transaction.total_amount}</td>
                                    <td className="border border-gray-300 px-4 py-2">{transaction.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
