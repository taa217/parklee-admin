// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.

import React, { useState, useEffect } from 'react';
import * as echarts from 'echarts';

interface User {
  id: string;
  username: string | null;
  role: 'customer' | 'supplier' | 'admin' | 'both';
  name: string;
  surname: string | null;
  phone_number: string | null;
  email: string;
  date_of_birth: string | null;
  gender: string | null;
  created_at: string;
  updated_at: string | null;
  status: 'active' | 'disabled' | 'pending';
  latitude: number | null;
  longitude: number | null;
  business_phone_number: string | null;
  business_email: string | null;
  business_name: string | null;
  business_category: string | null;
  business_description: string | null;
  business_type: string | null;
  personal_image_path: string | null;
  business_image_path: string | null;
}

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userModalMode, setUserModalMode] = useState<'add' | 'edit'>('add');

  useEffect(() => {
    const initializeCharts = () => {
      // User Growth Chart
      const userGrowthChart = echarts.init(document.getElementById('userGrowthChart'));
      const userRolesChart = echarts.init(document.getElementById('userRolesChart'));
      const userStatusChart = echarts.init(document.getElementById('userStatusChart'));
      const userRegistrationsChart = echarts.init(document.getElementById('userRegistrationsChart'));

      const userGrowthOption = {
        animation: false,
        title: {
          text: 'User Growth',
          textStyle: { fontSize: 14, fontWeight: 'normal' }
        },
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          left: '5%',
          right: '5%',
          bottom: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
          axisLine: { lineStyle: { color: '#E5E7EB' } }
        },
        yAxis: {
          type: 'value',
          name: 'Users',
          splitLine: { lineStyle: { color: '#E5E7EB' } }
        },
        series: [{
          name: 'Total Users',
          type: 'line',
          smooth: true,
          lineStyle: { width: 3 },
          itemStyle: { color: '#3B82F6' },
          data: [800, 900, 1000, 1100, 1200, 1250],
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [{
                offset: 0,
                color: 'rgba(59, 130, 246, 0.2)'
              }, {
                offset: 1,
                color: 'rgba(59, 130, 246, 0.01)'
              }]
            }
          }
        }]
      };

      const userRolesOption = {
        animation: false,
        title: {
          text: 'User Roles Distribution',
          textStyle: { fontSize: 14, fontWeight: 'normal' }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          bottom: '0',
          itemWidth: 12,
          itemHeight: 12,
          textStyle: { fontSize: 12 }
        },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
            borderWidth: 2,
            borderColor: '#fff'
          },
          label: { show: false },
          labelLine: { show: false },
          data: [
            { value: 750, name: 'Customers', itemStyle: { color: '#3B82F6' } },
            { value: 350, name: 'Suppliers', itemStyle: { color: '#60A5FA' } },
            { value: 100, name: 'Admins', itemStyle: { color: '#93C5FD' } },
            { value: 50, name: 'Both', itemStyle: { color: '#BFDBFE' } }
          ]
        }]
      };

      const userStatusOption = {
        animation: false,
        title: {
          text: 'User Status Distribution',
          textStyle: { fontSize: 14, fontWeight: 'normal' }
        },
        tooltip: {
          trigger: 'axis',
          formatter: '{b}: {c}'
        },
        grid: {
          left: '5%',
          right: '5%',
          bottom: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['Active', 'Disabled', 'Pending'],
          axisLine: { lineStyle: { color: '#E5E7EB' } }
        },
        yAxis: {
          type: 'value',
          name: 'Users',
          splitLine: { lineStyle: { color: '#E5E7EB' } }
        },
        series: [{
          name: 'Users',
          type: 'bar',
          barWidth: '40%',
          data: [1050, 120, 80],
          itemStyle: {
            color: function (params: any) {
              const colors = ['#10B981', '#EF4444', '#F59E0B'];
              return colors[params.dataIndex];
            },
            borderRadius: [4, 4, 0, 0]
          }
        }]
      };

      const userRegistrationsOption = {
        animation: false,
        title: {
          text: 'New Registrations',
          textStyle: { fontSize: 14, fontWeight: 'normal' }
        },
        tooltip: {
          trigger: 'axis',
          formatter: '{b}: {c}'
        },
        grid: {
          left: '5%',
          right: '5%',
          bottom: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
          axisLine: { lineStyle: { color: '#E5E7EB' } }
        },
        yAxis: {
          type: 'value',
          name: 'New Users',
          splitLine: { lineStyle: { color: '#E5E7EB' } }
        },
        series: [{
          name: 'Registrations',
          type: 'bar',
          barWidth: '40%',
          data: [180, 210, 240, 190, 220, 250, 230],
          itemStyle: {
            color: '#8B5CF6',
            borderRadius: [4, 4, 0, 0]
          }
        }]
      };

      userGrowthChart.setOption(userGrowthOption);
      userRolesChart.setOption(userRolesOption);
      userStatusChart.setOption(userStatusOption);
      userRegistrationsChart.setOption(userRegistrationsOption);
    };

    setTimeout(initializeCharts, 100);

    return () => {
      const charts = [
        'userGrowthChart',
        'userRolesChart',
        'userStatusChart',
        'userRegistrationsChart'
      ];

      charts.forEach(chartId => {
        const chartElement = document.getElementById(chartId);
        if (chartElement) {
          const chart = echarts.getInstanceByDom(chartElement);
          chart?.dispose();
        }
      });
    };
  }, []);

  const mockUsers: User[] = [
    {
      id: 'USR-001',
      username: 'alexh',
      role: 'admin',
      name: 'Alexander',
      surname: 'Hughes',
      phone_number: '+1234567890',
      email: 'alexander.hughes@example.com',
      date_of_birth: '1985-03-15',
      gender: 'male',
      created_at: '2025-03-26T09:30:00Z',
      updated_at: '2025-03-26T09:30:00Z',
      status: 'active',
      latitude: 40.7128,
      longitude: -74.0060,
      business_phone_number: null,
      business_email: null,
      business_name: null,
      business_category: null,
      business_description: null,
      business_type: null,
      personal_image_path: '/images/users/alex.jpg',
      business_image_path: null
    },
    {
      id: 'USR-002',
      username: 'victoriam',
      role: 'supplier',
      name: 'Victoria',
      surname: 'Martinez',
      phone_number: '+1987654321',
      email: 'victoria.martinez@example.com',
      date_of_birth: '1990-07-22',
      gender: 'female',
      created_at: '2025-03-25T14:15:00Z',
      updated_at: '2025-03-26T08:45:00Z',
      status: 'active',
      latitude: 34.0522,
      longitude: -118.2437,
      business_phone_number: '+1555123456',
      business_email: 'business@example.com',
      business_name: 'SteelWorks Inc.',
      business_category: 'Construction',
      business_description: 'Supplier of industrial materials',
      business_type: 'Manufacturer',
      personal_image_path: '/images/users/victoria.jpg',
      business_image_path: '/images/businesses/steelworks.jpg'
    },
    {
      id: 'USR-003',
      username: null,
      role: 'customer',
      name: 'Benjamin',
      surname: 'Foster',
      phone_number: '+1122334455',
      email: 'benjamin.foster@example.com',
      date_of_birth: '1995-11-30',
      gender: 'male',
      created_at: '2025-03-24T11:20:00Z',
      updated_at: null,
      status: 'pending',
      latitude: 41.8781,
      longitude: -87.6298,
      business_phone_number: null,
      business_email: null,
      business_name: null,
      business_category: null,
      business_description: null,
      business_type: null,
      personal_image_path: null,
      business_image_path: null
    }
  ];

  const filteredUsers = mockUsers.filter(user => {
    // Search term filter
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.surname && user.surname.toLowerCase().includes(searchTerm.toLowerCase())) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.business_name && user.business_name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Role filter
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    // Status filter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleDeleteUser = () => {
    if (selectedUser) {
      // Handle delete logic here
      console.log('Deleting user:', selectedUser.id);
      setShowDeleteConfirm(false);
      setSelectedUser(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* User Analytics Section */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold mb-4">User Analytics</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 mr-4">
                    <i className="fas fa-users text-blue-600"></i>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold">1,250</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 mr-4">
                    <i className="fas fa-user-check text-green-600"></i>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold">1,050</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 mr-4">
                    <i className="fas fa-user-clock text-purple-600"></i>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pending Users</p>
                    <p className="text-2xl font-bold">80</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 mr-4">
                    <i className="fas fa-building text-yellow-600"></i>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Business Accounts</p>
                    <p className="text-2xl font-bold">350</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div id="userGrowthChart" style={{ height: '300px' }}></div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div id="userRolesChart" style={{ height: '300px' }}></div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div id="userStatusChart" style={{ height: '300px' }}></div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div id="userRegistrationsChart" style={{ height: '300px' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* User Management Section */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">User Management</h2>
              <div className="flex gap-4 items-center">
                <div className="text-sm text-gray-600">
                  Total Users: <span className="font-semibold">{filteredUsers.length}</span>
                </div>
                <button
                  onClick={() => {
                    setUserModalMode('add');
                    setSelectedUser(null);
                    setShowUserModal(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <i className="fas fa-user-plus mr-2"></i>
                  Add User
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="customer">Customer</option>
                  <option value="supplier">Supplier</option>
                  <option value="admin">Admin</option>
                  <option value="both">Both (Customer & Supplier)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role & Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {user.personal_image_path ? (
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={user.personal_image_path}
                              alt={user.name}
                            />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <i className="fas fa-user text-gray-500"></i>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name} {user.surname}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{user.username || 'no-username'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.phone_number}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full mb-1 ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'supplier' ? 'bg-yellow-100 text-yellow-800' :
                          user.role === 'customer' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                        }`}>
                        {user.role}
                      </span>
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' :
                        user.status === 'disabled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.business_name ? (
                        <>
                          <div className="text-sm font-medium text-gray-900">{user.business_name}</div>
                          <div className="text-sm text-gray-500">{user.business_category}</div>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">No business</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setUserModalMode('edit');
                          setShowUserModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3 cursor-pointer"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDeleteConfirm(true);
                        }}
                        className="text-red-600 hover:text-red-900 cursor-pointer"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Modal */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">
                  {userModalMode === 'add' ? 'Add New User' : 'Edit User'}
                </h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-4 border-b pb-2">Personal Information</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter first name"
                          value={selectedUser?.name || ''}
                          onChange={(e) => setSelectedUser(prev => prev ? { ...prev, name: e.target.value } : null)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter last name"
                          value={selectedUser?.surname || ''}
                          onChange={(e) => setSelectedUser(prev => prev ? { ...prev, surname: e.target.value } : null)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input
                          type="email"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter email address"
                          value={selectedUser?.email || ''}
                          onChange={(e) => setSelectedUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter phone number"
                          value={selectedUser?.phone_number || ''}
                          onChange={(e) => setSelectedUser(prev => prev ? { ...prev, phone_number: e.target.value } : null)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter username"
                          value={selectedUser?.username || ''}
                          onChange={(e) => setSelectedUser(prev => prev ? { ...prev, username: e.target.value } : null)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={selectedUser?.date_of_birth?.split('T')[0] || ''}
                          onChange={(e) => setSelectedUser(prev => prev ? { ...prev, date_of_birth: e.target.value } : null)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          value={selectedUser?.gender || ''}
                          onChange={(e) => setSelectedUser(prev => prev ? { ...prev, gender: e.target.value } : null)}
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer_not_to_say">Prefer not to say</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          value={selectedUser?.role || 'customer'}
                          onChange={(e) => setSelectedUser(prev => prev ? {
                            ...prev,
                            role: e.target.value as 'customer' | 'supplier' | 'admin' | 'both'
                          } : null)}
                        >
                          <option value="customer">Customer</option>
                          <option value="supplier">Supplier</option>
                          <option value="admin">Admin</option>
                          <option value="both">Both (Customer & Supplier)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          value={selectedUser?.status || 'active'}
                          onChange={(e) => setSelectedUser(prev => prev ? {
                            ...prev,
                            status: e.target.value as 'active' | 'disabled' | 'pending'
                          } : null)}
                        >
                          <option value="active">Active</option>
                          <option value="disabled">Disabled</option>
                          <option value="pending">Pending</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-4 border-b pb-2">Business Information</h4>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter business name"
                          value={selectedUser?.business_name || ''}
                          onChange={(e) => setSelectedUser(prev => prev ? { ...prev, business_name: e.target.value } : null)}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Business Category</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter category"
                            value={selectedUser?.business_category || ''}
                            onChange={(e) => setSelectedUser(prev => prev ? { ...prev, business_category: e.target.value } : null)}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter business type"
                            value={selectedUser?.business_type || ''}
                            onChange={(e) => setSelectedUser(prev => prev ? { ...prev, business_type: e.target.value } : null)}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Business Description</label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter business description"
                          rows={3}
                          value={selectedUser?.business_description || ''}
                          onChange={(e) => setSelectedUser(prev => prev ? { ...prev, business_description: e.target.value } : null)}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Business Email</label>
                          <input
                            type="email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter business email"
                            value={selectedUser?.business_email || ''}
                            onChange={(e) => setSelectedUser(prev => prev ? { ...prev, business_email: e.target.value } : null)}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Business Phone</label>
                          <input
                            type="tel"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter business phone"
                            value={selectedUser?.business_phone_number || ''}
                            onChange={(e) => setSelectedUser(prev => prev ? { ...prev, business_phone_number: e.target.value } : null)}
                          />
                        </div>
                      </div>
                    </div>

                    <h4 className="text-md font-medium text-gray-700 mt-6 mb-4 border-b pb-2">Location</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter latitude"
                          value={selectedUser?.latitude || ''}
                          onChange={(e) => setSelectedUser(prev => prev ? { ...prev, latitude: parseFloat(e.target.value) } : null)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter longitude"
                          value={selectedUser?.longitude || ''}
                          onChange={(e) => setSelectedUser(prev => prev ? { ...prev, longitude: parseFloat(e.target.value) } : null)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle save user logic here
                    setShowUserModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  {userModalMode === 'add' ? 'Add User' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">Confirm Deletion</h3>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete user {selectedUser?.name}? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;