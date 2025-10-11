import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../api';

interface Staff {
    id: string;
    name: string;
    surname: string;
    email: string;
    gender: string;
    phone_number: string;
    license_plate: string;
    role: string;
    status: string;
}

export const StaffDashboard: React.FC = () => {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newStaff, setNewStaff] = useState<Omit<Staff, 'id' | 'status'>>({
        name: '',
        surname: '',
        email: '',
        gender: '',
        phone_number: '',
        license_plate: '',
        role: 'staff'
    });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: 'all',
        role: 'all',
        search: ''
    });

    // Fetch staff data from API
    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const response = await fetch(`${BASE_URL}/users/staff`, {
                    headers: {
                        'accept': 'application/json'
                    }
                });
                const data = await response.json();
                setStaff(data);
                setFilteredStaff(data);
            } catch (error) {
                console.error('Error fetching staff:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStaff();
    }, []);

    // Apply filters
    useEffect(() => {
        let result = [...staff];

        if (filters.status !== 'all') {
            result = result.filter(member => member.status === filters.status);
        }

        if (filters.role !== 'all') {
            result = result.filter(member => member.role === filters.role);
        }

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            result = result.filter(member =>
                member.name.toLowerCase().includes(searchTerm) ||
                member.surname.toLowerCase().includes(searchTerm) ||
                member.email.toLowerCase().includes(searchTerm) ||
                member.license_plate.toLowerCase().includes(searchTerm)
            );
        }

        setFilteredStaff(result);
    }, [filters, staff]);

    const updateStaffStatus = async (id: string, status: string) => {
        try {
            // Here you would typically call an API to update the status
            // For now, we'll just update the local state
            setStaff(prev =>
                prev.map(staff =>
                    staff.id === id ? { ...staff, status } : staff
                )
            );
            setSelectedStaff(null);
        } catch (error) {
            console.error('Error updating staff status:', error);
        }
    };

    const handleCreateStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`${BASE_URL}/users/`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newStaff)
            });

            if (response.ok) {
                const createdStaff = await response.json();
                setStaff([...staff, createdStaff]);
                setShowCreateModal(false);
                setNewStaff({
                    name: '',
                    surname: '',
                    email: '',
                    gender: '',
                    phone_number: '',
                    license_plate: '',
                    role: 'staff'
                });
            } else {
                console.error('Failed to create staff:', await response.json());
            }
        } catch (error) {
            console.error('Error creating staff:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewStaff(prev => ({ ...prev, [name]: value }));
    };

    const roles = [...new Set(staff.map(member => member.role))];
    const statuses = [...new Set(staff.map(member => member.status))];

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option value="all">All Statuses</option>
                            {statuses.map(status => (
                                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={filters.role}
                            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                        >
                            <option value="all">All Roles</option>
                            {roles.map(role => (
                                <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <input
                            type="text"
                            placeholder="Search by name, email, or license plate"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Total Staff</h3>
                        <span className="text-2xl font-bold text-blue-600">{staff.length}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {filteredStaff.length} match filters
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Active Staff</h3>
                        <span className="text-2xl font-bold text-green-600">
                            {staff.filter(s => s.status === 'active').length}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {staff.filter(s => s.status !== 'active').length} inactive
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Roles</h3>
                        <span className="text-2xl font-bold text-purple-600">
                            {roles.length}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {staff.filter(s => s.role === 'staff').length} regular staff
                    </p>
                </div>
            </div>

            {/* Staff Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Staff Records ({filteredStaff.length})
                        </h3>
                        {/* <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            onClick={() => setShowCreateModal(true)}
                        >
                            + Add New Staff
                        </button> */}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Plate</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredStaff.slice(0, 10).map(member => (
                                <tr key={member.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{member.name} {member.surname}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {member.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {member.phone_number}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                        {member.license_plate}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                                        {member.role}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {member.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                            onClick={() => setSelectedStaff(member)}
                                        >
                                            View
                                        </button>
                                        <button className="text-gray-600 hover:text-gray-900">
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredStaff.length > 10 && (
                    <div className="p-4 border-t border-gray-200 text-center text-sm text-gray-500">
                        Showing 10 of {filteredStaff.length} staff members. Use filters to refine your search.
                    </div>
                )}
            </div>

            {/* Staff Detail Modal */}
            {selectedStaff && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {selectedStaff.name} {selectedStaff.surname}
                                </h3>
                                <button
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={() => setSelectedStaff(null)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Personal Information</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Name:</span>
                                        <span className="font-medium">{selectedStaff.name} {selectedStaff.surname}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Email:</span>
                                        <span className="font-medium">{selectedStaff.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Phone:</span>
                                        <span className="font-medium">{selectedStaff.phone_number}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Gender:</span>
                                        <span className="font-medium capitalize">{selectedStaff.gender}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Employment Details</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Role:</span>
                                        <span className="font-medium capitalize">{selectedStaff.role}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${selectedStaff.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {selectedStaff.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Parking Information</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">License Plate:</span>
                                        <span className="font-mono font-medium">{selectedStaff.license_plate}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-3">Actions</h4>
                            <div className="flex flex-wrap gap-3">
                                {selectedStaff.status !== 'active' && (
                                    <button
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                        onClick={() => updateStaffStatus(selectedStaff.id, 'active')}
                                    >
                                        Activate Staff
                                    </button>
                                )}
                                {selectedStaff.status === 'active' && (
                                    <button
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                        onClick={() => updateStaffStatus(selectedStaff.id, 'inactive')}
                                    >
                                        Deactivate Staff
                                    </button>
                                )}
                                <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                                    Edit Staff Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Staff Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Create New Staff Member
                                </h3>
                                <button
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleCreateStaff}>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={newStaff.name}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        name="surname"
                                        value={newStaff.surname}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={newStaff.email}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone_number"
                                        value={newStaff.phone_number}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                    <select
                                        name="gender"
                                        value={newStaff.gender}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
                                    <input
                                        type="text"
                                        name="license_plate"
                                        value={newStaff.license_plate}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select
                                        name="role"
                                        value={newStaff.role}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                        <option value="security">Security</option>
                                    </select>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Create Staff
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};