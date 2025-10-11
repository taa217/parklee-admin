import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../api';

interface Student {
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

export const StudentsDashboard: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newStudent, setNewStudent] = useState<Omit<Student, 'id' | 'status'>>({
        name: '',
        surname: '',
        email: '',
        gender: 'male',
        phone_number: '',
        license_plate: '',
        role: 'student'
    });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: 'all',
        search: ''
    });

    // Fetch students from API
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch(`${BASE_URL}/users/students`, {
                    headers: {
                        'accept': 'application/json'
                    }
                });
                const data = await response.json();
                setStudents(data);
                setFilteredStudents(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching students:', error);
                setLoading(false);
            }
        };

        fetchStudents();
    }, []);

    // Apply filters
    useEffect(() => {
        let result = [...students];

        if (filters.status !== 'all') {
            result = result.filter(student => student.status === filters.status);
        }

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            result = result.filter(student =>
                student.name.toLowerCase().includes(searchTerm) ||
                student.surname.toLowerCase().includes(searchTerm) ||
                student.email.toLowerCase().includes(searchTerm) ||
                student.license_plate.toLowerCase().includes(searchTerm)
            );
        }

        setFilteredStudents(result);
    }, [filters, students, newStudent]);

    const updateStudentStatus = async (id: string, status: string) => {
        try {
            // Here you would typically call an API to update the status
            // For now, we'll just update the local state
            setStudents(prev =>
                prev.map(student =>
                    student.id === id ? { ...student, status } : student
                )
            );
            setSelectedStudent(null);
        } catch (error) {
            console.error('Error updating student status:', error);
        }
    };

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`${BASE_URL}/users/`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newStudent)
            });

            if (response.ok) {
                const createdStudent = await response.json();
                setStudents([...students, createdStudent]);
                setShowAddModal(false);
                alert('Student created successfully');
                setNewStudent({
                    name: '',
                    surname: '',
                    email: '',
                    gender: 'male',
                    phone_number: '',
                    license_plate: '',
                    role: 'student'
                });
            } else {
                console.error('Failed to create student');
            }
        } catch (error) {
            console.error('Error creating student:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewStudent(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
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
                        <h3 className="text-lg font-semibold text-gray-800">Total Students</h3>
                        <span className="text-2xl font-bold text-blue-600">{students.length}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {filteredStudents.length} match filters
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Active Students</h3>
                        <span className="text-2xl font-bold text-green-600">
                            {students.filter(s => s.status === 'active').length}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {students.filter(s => s.status === 'pending').length} pending
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Suspended Students</h3>
                        <span className="text-2xl font-bold text-red-600">
                            {students.filter(s => s.status === 'suspended').length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Student Records ({filteredStudents.length})
                        </h3>
                        {/* <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            onClick={() => setShowAddModal(true)}
                        >
                            + Add New Student
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredStudents.slice(0, 10).map(student => (
                                <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{student.name} {student.surname}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {student.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {student.phone_number}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                        {student.license_plate}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${student.status === 'active' ? 'bg-green-100 text-green-800' :
                                                student.status === 'suspended' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                            onClick={() => setSelectedStudent(student)}
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredStudents.length > 10 && (
                    <div className="p-4 border-t border-gray-200 text-center text-sm text-gray-500">
                        Showing 10 of {filteredStudents.length} students. Use filters to refine your search.
                    </div>
                )}
            </div>

            {/* Add Student Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Add New Student
                                </h3>
                                <button
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleAddStudent} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={newStudent.name}
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
                                        value={newStudent.surname}
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
                                        value={newStudent.email}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                    <select
                                        name="gender"
                                        value={newStudent.gender}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone_number"
                                        value={newStudent.phone_number}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
                                    <input
                                        type="text"
                                        name="license_plate"
                                        value={newStudent.license_plate}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Add Student
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Student Detail Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {selectedStudent.name} {selectedStudent.surname}
                                </h3>
                                <button
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={() => setSelectedStudent(null)}
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Student Information</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Name:</span>
                                        <span className="font-medium">{selectedStudent.name} {selectedStudent.surname}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Email:</span>
                                        <span className="font-medium">{selectedStudent.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Phone:</span>
                                        <span className="font-medium">{selectedStudent.phone_number}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Gender:</span>
                                        <span className="font-medium capitalize">{selectedStudent.gender}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Parking Information</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">License Plate:</span>
                                        <span className="font-mono font-medium">{selectedStudent.license_plate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${selectedStudent.status === 'active' ? 'bg-green-100 text-green-800' :
                                                selectedStudent.status === 'suspended' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {selectedStudent.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-3">Actions</h4>
                            <div className="flex flex-wrap gap-3">
                                {selectedStudent.status !== 'active' && (
                                    <button
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                        onClick={() => updateStudentStatus(selectedStudent.id, 'active')}
                                    >
                                        Activate Account
                                    </button>
                                )}
                                {selectedStudent.status !== 'suspended' && (
                                    <button
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                        onClick={() => updateStudentStatus(selectedStudent.id, 'suspended')}
                                    >
                                        Suspend Account
                                    </button>
                                )}
                                {selectedStudent.status !== 'pending' && (
                                    <button
                                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                                        onClick={() => updateStudentStatus(selectedStudent.id, 'pending')}
                                    >
                                        Set to Pending
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};