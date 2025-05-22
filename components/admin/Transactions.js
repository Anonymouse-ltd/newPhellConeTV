import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function Transactions({ transactions, isLoadingData }) {
    const [transactionData, setTransactionData] = useState(transactions);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        setTransactionData(transactions);
    }, [transactions]);

    const handleStatusChange = async (transactionId, newStatus) => {
        setIsUpdating(true);
        try {
            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ transactionId, status: newStatus }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update status');
            }

            // Update local state to reflect the change immediately
            setTransactionData(prevData =>
                prevData.map(transaction =>
                    transaction.id === transactionId
                        ? { ...transaction, status: newStatus }
                        : transaction
                )
            );
            toast.success('Status updated successfully!', {
                position: "top-center",
                toastId: `status-update-success-${transactionId}`
            });
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status. Please try again.', {
                position: "top-center",
                toastId: `status-update-error-${transactionId}`
            });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div>
            <h3 className="text-xl font-semibold text-green-700 mb-4">Transactions</h3>
            {isLoadingData ? (
                <div className="text-center py-4 text-gray-700">Loading transactions...</div>
            ) : transactionData.length === 0 ? (
                <div className="text-center py-4 text-gray-700">No transactions found.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">User</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Order Date</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Total Amount</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactionData.map(transaction => (
                                <tr key={transaction.id} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 px-4 py-2">{transaction.id}</td>
                                    <td className="border border-gray-300 px-4 py-2">{transaction.username || transaction.user_id}</td>
                                    <td className="border border-gray-300 px-4 py-2">{transaction.order_date}</td>
                                    <td className="border border-gray-300 px-4 py-2">₱{transaction.total_amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        <select
                                            value={transaction.status}
                                            onChange={(e) => handleStatusChange(transaction.id, e.target.value)}
                                            disabled={isUpdating}
                                            className="border border-gray-300 rounded p-1 bg-white hover:bg-gray-100"
                                        >
                                            <option value="Shipped">Shipped</option>
                                            <option value="In-Transit">In-Transit</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
