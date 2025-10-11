import React, { useState, useEffect } from 'react';
import * as echarts from 'echarts';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { BASE_URL } from '../api';

const localizer = momentLocalizer(moment);

interface Reservation {
    id: string;
    user_id: string;
    user_name: string;
    user_type: 'student' | 'staff' | 'visitor' | 'admin' | 'vip';
    spot_id: string;
    spot_name: string;
    spot_type: 'student' | 'visitor' | 'staff' | 'disabled';
    start_time: Date;
    end_time: Date;
    status: 'active' | 'pending' | 'completed' | 'cancelled';
    created_at: Date;
    license_plate: string;
    event_id?: string;
    zone_name: string; // New field for zone name
}

interface ReservationStatusCount {
    status: string;
    reservation_count: number;
    distinct_spot_count: number;
}

interface SpotDistribution {
    student: number;
    staff: number;
    visitor: number;
    vip: number;
}

interface DailyReservationCount {
    [status: string]: {
        [date: string]: number;
    };
}

export const ReservationsDashboard: React.FC = () => {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [filter, setFilter] = useState({
        status: 'all',
        userType: 'all',
        spotType: 'all',
        dateRange: 'week'
    });
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newReservation, setNewReservation] = useState({
        user_id: '',
        spot_id: '',
        event_id: '',
        start_time: '',
        end_time: ''
    });
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        totalReservations: 0,
        activeReservations: 0,
        spotDistribution: {
            student: 0,
            staff: 0,
            visitor: 0,
            vip: 0
        },
        reservationStatusCounts: [] as ReservationStatusCount[],
        dailyReservationCounts: {} as DailyReservationCount
    });

    // Fetch all data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch reservations details
                const reservationsResponse = await fetch(`${BASE_URL}/reservations/details`, {
                    headers: {
                        'accept': 'application/json'
                    }
                });
                const reservationsData = await reservationsResponse.json();
                setReservations(reservationsData.map((r: any) => ({
                    ...r,
                    start_time: new Date(r.start_time),
                    end_time: new Date(r.end_time),
                    created_at: new Date(r.created_at || r.start_time),
                    user_name: r.user_full_name, // Mock user name
                    spot_name: r.spot_name,
                    license_plate: r.license_plate,
                    zone_name:r.zone_name,
                    user_type: r.user_role

                })));

                // Fetch statistics
                const totalReservationsResponse = await fetch(`${BASE_URL}/analytics/reservations_count`, {
                    headers: {
                        'accept': 'application/json'
                    }
                });
                const totalReservations = await totalReservationsResponse.json();

                const activeReservationsResponse = await fetch(`${BASE_URL}/analytics/active_reservations_count`, {
                    headers: {
                        'accept': 'application/json'
                    }
                });
                const activeReservations = await activeReservationsResponse.json();

                const spotDistributionResponse = await fetch(`${BASE_URL}/analytics/users/spot_distribution_by_role`, {
                    headers: {
                        'accept': 'application/json'
                    }
                });
                const spotDistribution = await spotDistributionResponse.json();

                const reservationStatusCountResponse = await fetch(`${BASE_URL}/analytics/reservation_status_count`, {
                    headers: {
                        'accept': 'application/json'
                    }
                });
                const reservationStatusCounts = await reservationStatusCountResponse.json();

                const dailyReservationCountResponse = await fetch(`${BASE_URL}/analytics/reservation_status_daily_count`, {
                    headers: {
                        'accept': 'application/json'
                    }
                });
                const dailyReservationCounts = await dailyReservationCountResponse.json();

                setStats({
                    totalReservations,
                    activeReservations,
                    spotDistribution,
                    reservationStatusCounts,
                    dailyReservationCounts
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);

    const filteredReservations = reservations.filter(res => {
        const startTime = res.start_time instanceof Date ? res.start_time : new Date(res.start_time);

        const statusMatch = filter.status === 'all' || res.status === filter.status;
        const userTypeMatch = filter.userType === 'all' || res.user_type === filter.userType;
        const spotTypeMatch = filter.spotType === 'all' || res.spot_type === filter.spotType;

        let dateMatch = false;
        if (filter.dateRange === 'all') {
            dateMatch = true;
        } else if (filter.dateRange === 'week') {
            dateMatch = startTime >= weekAgo && startTime <= now;
        } else if (filter.dateRange === 'today') {
            dateMatch = startTime.toDateString() === now.toDateString();
        }

        return statusMatch && userTypeMatch && spotTypeMatch && dateMatch;
    });


    // Initialize charts
    useEffect(() => {
        if (loading || !stats.reservationStatusCounts.length) return;

        const initCharts = () => {
            // Reservation Status Chart
            const statusChart = echarts.init(document.getElementById('reservationStatusChart'));

            // Daily Reservation Trend Chart
            const trendChart = echarts.init(document.getElementById('reservationTrendChart'));

            // Spot Type Utilization Chart
            const utilizationChart = echarts.init(document.getElementById('spotUtilizationChart'));

            // Status Chart Options
            const statusOptions = {
                title: {
                    text: 'Reservation Status',
                    left: 'center',
                    textStyle: { fontSize: 14 }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}: {c} ({d}%)'
                },
                legend: {
                    orient: 'horizontal',
                    bottom: 0,
                    data: stats.reservationStatusCounts.map(item => item.status)
                },
                series: [
                    {
                        name: 'Status',
                        type: 'pie',
                        radius: ['40%', '70%'],
                        avoidLabelOverlap: false,
                        itemStyle: {
                            borderRadius: 4,
                            borderWidth: 2,
                            borderColor: '#fff'
                        },
                        label: {
                            show: false
                        },
                        emphasis: {
                            label: {
                                show: true,
                                fontSize: '14',
                                fontWeight: 'bold'
                            }
                        },
                        labelLine: {
                            show: false
                        },
                        data: stats.reservationStatusCounts.map(item => ({
                            value: item.reservation_count,
                            name: item.status,
                            itemStyle: {
                                color: item.status === 'active' ? '#3B82F6' :
                                    item.status === 'pending' ? '#F59E0B' :
                                        item.status === 'completed' ? '#10B981' : '#EF4444'
                            }
                        }))
                    }
                ]
            };

            // Trend Chart Options
            const trendOptions = {
                title: {
                    text: 'Daily Reservation Trend',
                    left: 'center',
                    textStyle: { fontSize: 14 }
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: Object.keys(stats.dailyReservationCounts),
                    bottom: 0
                },
                xAxis: {
                    type: 'category',
                    data: Object.keys(stats.dailyReservationCounts[Object.keys(stats.dailyReservationCounts)[0]])
                },
                yAxis: {
                    type: 'value',
                    name: 'Reservations'
                },
                series: Object.entries(stats.dailyReservationCounts).map(([status, data]) => ({
                    name: status,
                    type: 'line',
                    smooth: true,
                    data: Object.values(data),
                    lineStyle: { width: 3 },
                    itemStyle: {
                        color: status === 'active' ? '#3B82F6' :
                            status === 'pending' ? '#F59E0B' :
                                status === 'completed' ? '#10B981' : '#EF4444'
                    }
                }))
            };

            // Utilization Chart Options
            const utilizationOptions = {
                title: {
                    text: 'Spot Type Distribution',
                    left: 'center',
                    textStyle: { fontSize: 14 }
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: {
                    bottom: 0
                },
                xAxis: {
                    type: 'category',
                    data: ['Student', 'Staff', 'Visitor', 'VIP']
                },
                yAxis: {
                    type: 'value',
                    name: 'Reservations'
                },
                series: [
                    {
                        name: 'Reservations',
                        type: 'bar',
                        data: [
                            stats.spotDistribution.student,
                            stats.spotDistribution.staff,
                            stats.spotDistribution.visitor,
                            stats.spotDistribution.vip
                        ],
                        itemStyle: {
                            color: function (params: any) {
                                const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
                                return colors[params.dataIndex];
                            },
                            borderRadius: [4, 4, 0, 0]
                        }
                    }
                ]
            };

            statusChart.setOption(statusOptions);
            trendChart.setOption(trendOptions);
            utilizationChart.setOption(utilizationOptions);

            return () => {
                statusChart.dispose();
                trendChart.dispose();
                utilizationChart.dispose();
            };
        };

        initCharts();
    }, [loading, stats]);

    // Calendar events for react-big-calendar
    const calendarEvents = filteredReservations.map(res => ({
        id: res.id,
        title: `${res.user_name} (${res.spot_name})`,
        start: res.start_time,
        end: res.end_time,
        status: res.status,
        spotType: res.spot_type,
        allDay: false
    }));

    const eventStyleGetter = (event: any) => {
        let backgroundColor = '';
        let borderColor = '';

        switch (event.status) {
            case 'active':
                backgroundColor = '#BFDBFE';
                borderColor = '#3B82F6';
                break;
            case 'pending':
                backgroundColor = '#FDE68A';
                borderColor = '#F59E0B';
                break;
            case 'completed':
                backgroundColor = '#A7F3D0';
                borderColor = '#10B981';
                break;
            case 'cancelled':
                backgroundColor = '#FECACA';
                borderColor = '#EF4444';
                break;
            default:
                backgroundColor = '#E5E7EB';
                borderColor = '#6B7280';
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '4px',
                border: `2px solid ${borderColor}`,
                color: '#1F2937',
                fontSize: '12px'
            }
        };
    };

    const handleSelectEvent = (event: any) => {
        const reservation = reservations.find(r => r.id === event.id);
        if (reservation) setSelectedReservation(reservation);
    };

    const updateReservationStatus = async (id: string, status: string) => {
        try {
            // In a real app, you would call an API to update the status
            // For now, we'll just update the local state
            setReservations(prev =>
                prev.map(res =>
                    res.id === id ? { ...res, status: status as any } : res
                )
            );
            setSelectedReservation(null);
        } catch (error) {
            console.error('Error updating reservation status:', error);
        }
    };

    const handleCreateReservation = async () => {
        try {
            const response = await fetch(`${BASE_URL}/reservations/reserve-spot`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newReservation)
            });

            if (!response.ok) {
                throw new Error('Failed to create reservation');
            }

            const createdReservation = await response.json();

            // Add the new reservation to our local state
            setReservations(prev => [...prev, {
                ...createdReservation,
                start_time: new Date(createdReservation.start_time),
                end_time: new Date(createdReservation.end_time),
                created_at: new Date(),
                user_name: 'User ' + createdReservation.user_id.slice(0, 4),
                spot_name: 'Spot ' + createdReservation.spot_id.slice(0, 4),
                license_plate: 'PLATE' + createdReservation.user_id.slice(0, 4),
                user_type: ['student', 'staff', 'visitor', 'vip'][Math.floor(Math.random() * 4)] as any
            }]);

            setShowCreateModal(false);
            setNewReservation({
                user_id: '',
                spot_id: '',
                event_id: '',
                start_time: '',
                end_time: ''
            });
        } catch (error) {
            console.error('Error creating reservation:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={filter.status}
                            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={filter.userType}
                            onChange={(e) => setFilter({ ...filter, userType: e.target.value })}
                        >
                            <option value="all">All User Types</option>
                            <option value="student">Student</option>
                            <option value="staff">Staff</option>
                            <option value="visitor">Visitor</option>
                            <option value="vip">VIP</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Spot Type</label>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={filter.spotType}
                            onChange={(e) => setFilter({ ...filter, spotType: e.target.value })}
                        >
                            <option value="all">All Spot Types</option>
                            <option value="student">Student</option>
                            <option value="staff">Staff</option>
                            <option value="visitor">Visitor</option>
                            <option value="disabled">Disabled</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={filter.dateRange}
                            onChange={(e) => setFilter({ ...filter, dateRange: e.target.value })}
                        >
                            <option value="week">This Week</option>
                            <option value="today">Today</option>
                            <option value="all">All Dates</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            onClick={() => setFilter({
                                status: 'all',
                                userType: 'all',
                                spotType: 'all',
                                dateRange: 'week'
                            })}
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Total Reservations</h3>
                        <span className="text-2xl font-bold text-blue-600">{stats.totalReservations}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {filteredReservations.length} match filters
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Active Today</h3>
                        <span className="text-2xl font-bold text-green-600">
                            {stats.activeReservations}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {reservations.filter(r =>
                            r.start_time.toDateString() === new Date().toDateString() &&
                            r.status === 'completed'
                        ).length} completed
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Pending Approval</h3>
                        <span className="text-2xl font-bold text-orange-600">
                            {stats.reservationStatusCounts.find(s => s.status === 'pending')?.reservation_count || 0}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {reservations.filter(r =>
                            r.status === 'pending' &&
                            r.start_time.toDateString() === new Date().toDateString()
                        ).length} today
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Cancellation Rate</h3>
                        <span className="text-2xl font-bold text-purple-600">
                            {stats.totalReservations > 0
                                ? Math.round(
                                    ((stats.reservationStatusCounts.find(s => s.status === 'cancelled')?.reservation_count || 0) /
                                        stats.totalReservations) * 100
                                )
                                : 0}%

                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {stats.reservationStatusCounts.find(s => s.status === 'cancelled')?.reservation_count || 0} total cancellations
                    </p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="reservationStatusChart" style={{ height: '300px' }}></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="reservationTrendChart" style={{ height: '300px' }}></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="spotUtilizationChart" style={{ height: '300px' }}></div>
                </div>
            </div>

            {/* Reservations Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Reservation Records ({filteredReservations.length})
                        </h3>
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            onClick={() => setShowCreateModal(true)}
                        >
                            + New Reservation
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spot</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredReservations.slice(0, 10).map(res => (
                                <tr key={res.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                        {res.user_name}
                                        <div className="text-sm text-gray-500 capitalize">{res.user_type}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{res.zone_name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{res.spot_name}</div>
                                        <div className="text-sm text-gray-500 capitalize">{res.spot_type}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {res.start_time.toLocaleDateString()}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {res.start_time.toLocaleTimeString()} - {res.end_time.toLocaleTimeString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${res.status === 'active' ? 'bg-blue-100 text-blue-800' :
                                            res.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                res.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {res.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                            onClick={() => setSelectedReservation(res)}
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
                {filteredReservations.length > 10 && (
                    <div className="p-4 border-t border-gray-200 text-center text-sm text-gray-500">
                        Showing 10 of {filteredReservations.length} reservations. Use filters to refine your search.
                    </div>
                )}
            </div>

            {/* Reservation Detail Modal */}
            {selectedReservation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Reservation Details
                                </h3>
                                <button
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={() => setSelectedReservation(null)}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Reservation Information</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Reservation ID:</span>
                                        <span className="font-mono">{selectedReservation.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${selectedReservation.status === 'active' ? 'bg-blue-100 text-blue-800' :
                                            selectedReservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                selectedReservation.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {selectedReservation.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Created:</span>
                                        <span>{selectedReservation.created_at.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Time Slot:</span>
                                        <span>
                                            {selectedReservation.start_time.toLocaleString()} -<br />
                                            {selectedReservation.end_time.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">User & Spot Details</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">User:</span>
                                        <span className="font-medium">{selectedReservation.user_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">User Type:</span>
                                        <span className="capitalize">{selectedReservation.user_type}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">License Plate:</span>
                                        <span className="font-mono">{selectedReservation.license_plate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Parking Spot:</span>
                                        <span className="font-medium">{selectedReservation.spot_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Spot Type:</span>
                                        <span className="capitalize">{selectedReservation.spot_type}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-3">Actions</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {selectedReservation.status !== 'active' && (
                                    <button
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        onClick={() => updateReservationStatus(selectedReservation.id, 'active')}
                                    >
                                        Confirm
                                    </button>
                                )}
                                {selectedReservation.status !== 'completed' && selectedReservation.status !== 'cancelled' && (
                                    <button
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                        onClick={() => updateReservationStatus(selectedReservation.id, 'completed')}
                                    >
                                        Mark Complete
                                    </button>
                                )}
                                {selectedReservation.status !== 'cancelled' && (
                                    <button
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                        onClick={() => updateReservationStatus(selectedReservation.id, 'cancelled')}
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                    onClick={() => {
                                        // Navigate to edit page or show edit form
                                    }}
                                >
                                    Edit Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Reservation Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Create New Reservation
                                </h3>
                                <button
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                                <input
                                    type="text"
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={newReservation.user_id}
                                    onChange={(e) => setNewReservation({ ...newReservation, user_id: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Spot ID</label>
                                <input
                                    type="text"
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={newReservation.spot_id}
                                    onChange={(e) => setNewReservation({ ...newReservation, spot_id: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Event ID (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={newReservation.event_id}
                                    onChange={(e) => setNewReservation({ ...newReservation, event_id: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                <input
                                    type="datetime-local"
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={newReservation.start_time}
                                    onChange={(e) => setNewReservation({ ...newReservation, start_time: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                <input
                                    type="datetime-local"
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={newReservation.end_time}
                                    onChange={(e) => setNewReservation({ ...newReservation, end_time: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                onClick={() => setShowCreateModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                onClick={handleCreateReservation}
                            >
                                Create Reservation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};