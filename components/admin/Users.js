import { useState } from 'react';

export default function Users({ users, isLoadingData }) {
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    const openModal = async (user) => {
        setSelectedUser(user);
        setIsLoadingDetails(true);
        try {
            const res = await fetch(`/api/user-details/${user.id}`);
            if (!res.ok) {
                throw new Error('Failed to fetch user details');
            }
            const data = await res.json();
            setUserDetails(data);
        } catch (error) {
            console.error('Error fetching user details:', error);
            setUserDetails(null);
        } finally {
            setIsLoadingDetails(false);
            setIsModalOpen(true);
        }
    };

    const closeModal = () => {
        setSelectedUser(null);
        setUserDetails(null);
        setIsModalOpen(false);
    };

    return (
        <div>
            <h3 className="text-xl font-semibold text-green-700 mb-4">Manage Users</h3>
            {isLoadingData ? (
                <div className="text-center py-4 text-gray-700">Loading users...</div>
            ) : users.length === 0 ? (
                <div className="text-center py-4 text-gray-700">No users found.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Username</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 px-4 py-2">{user.id}</td>
                                    <td className="border border-gray-300 px-4 py-2">{user.username}</td>
                                    <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                                    <td className="border border-gray-300 px-4 py-2 flex gap-2">
                                        <button
                                            onClick={() => openModal(user)}
                                            className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {isModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h4 className="text-lg font-semibold text-green-700 mb-4">User Details</h4>
                        {isLoadingDetails ? (
                            <div className="text-center py-4 text-gray-700">Loading user details...</div>
                        ) : (
                            <div className="space-y-2">
                                <p><strong>ID:</strong> {selectedUser.id}</p>
                                <p><strong>Username:</strong> {selectedUser.username}</p>
                                <p><strong>Email:</strong> {selectedUser.email}</p>
                                <p><strong>Additional Details:</strong></p>
                                {userDetails ? (
                                    <div className="pl-4 space-y-2">
                                        <p><strong>First Name:</strong> {userDetails.first_name || 'Not yet modified by user'}</p>
                                        <p><strong>Last Name:</strong> {userDetails.last_name || 'Not yet modified by user'}</p>
                                        <p><strong>Phone:</strong> {userDetails.phone || 'Not yet modified by user'}</p>
                                        <p><strong>Address:</strong> {userDetails.address || 'Not yet modified by user'}</p>
                                    </div>
                                ) : (
                                    <p className="pl-4 text-gray-500">Not yet modified by user</p>
                                )}
                            </div>
                        )}
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={closeModal}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
