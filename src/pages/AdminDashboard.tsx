import React, { useState, useEffect } from 'react';
import * as echarts from 'echarts';
import { BASE_URL } from '../api';

interface User {
    id: string;
    name: string;
    phone_number: string;
    license_plate: string;
    role: 'student' | 'staff' | 'admin';
}

interface ParkingSpot {
    id: number;
    lot_name: string;
    spot_number: number;
    spot_type: 'student' | 'visitor' | 'staff' | 'disabled';
    latitude: number | null;
    longitude: number | null;
}

interface Reservation {
    id: string;
    user_id: string;
    spot_id: number;
    start_time: string;
    end_time: string;
}

interface ParkingSession {
    id: string;
    user_id: string;
    spot_id: number;
    check_in_time: string;
    check_out_time: string | null;
}

interface Event {
    id: string;
    name: string;
    description: string | null;
    date: string;
    event_location: string;
    latitude: number | null;
    longitude: number | null;
}

export const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [dashboardData, setDashboardData] = useState({
        totalSpaces: 0,
        occupiedSpots: 0,
        activeReservations: 0,
        registeredUsers: 0,
        occupancyRate: { "north slot": 0, "east slot": 0 },
        spotDistribution: { "student": 0, "staff": 0, "visitor": 0, "vip": 0 },
        reservationTrend: { "Sunday": 0, "Monday": 0, "Tuesday": 0, "Wednesday": 0, "Thursday": 0, "Friday": 0, "Saturday": 0 }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all data in parallel
                const [
                    totalSpacesRes,
                    occupiedSpotsRes,
                    activeReservationsRes,
                    registeredUsersRes,
                    occupancyRateRes,
                    spotDistributionRes,
                    reservationTrendRes
                ] = await Promise.all([
                    fetch(`${BASE_URL}/analytics/spots_count`, { headers: { 'accept': 'application/json' } }),
                    fetch(`${BASE_URL}/analytics/occupied_spots_count`, { headers: { 'accept': 'application/json' } }),
                    fetch(`${BASE_URL}/analytics/reservations_count`, { headers: { 'accept': 'application/json' } }),
                    fetch(`${BASE_URL}/analytics/users_count`, { headers: { 'accept': 'application/json' } }),
                    fetch(`${BASE_URL}/analytics/zones/occupancy_rate`, { headers: { 'accept': 'application/json' } }),
                    fetch(`${BASE_URL}/analytics/users/spot_distribution_by_role`, { headers: { 'accept': 'application/json' } }),
                    fetch(`${BASE_URL}/analytics/reservations/by_day_of_week`, { headers: { 'accept': 'application/json' } })
                ]);

                const [
                    totalSpaces,
                    occupiedSpots,
                    activeReservations,
                    registeredUsers,
                    occupancyRate,
                    spotDistribution,
                    reservationTrend
                ] = await Promise.all([
                    totalSpacesRes.json(),
                    occupiedSpotsRes.json(),
                    activeReservationsRes.json(),
                    registeredUsersRes.json(),
                    occupancyRateRes.json(),
                    spotDistributionRes.json(),
                    reservationTrendRes.json()
                ]);

                setDashboardData({
                    totalSpaces,
                    occupiedSpots,
                    activeReservations: activeReservations,
                    registeredUsers,
                    occupancyRate,
                    spotDistribution,
                    reservationTrend
                });
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const initializeCharts = () => {
            // Parking Dashboard Charts
            const occupancyChart = echarts.init(document.getElementById('occupancyChart'));
            const spotTypeDistributionChart = echarts.init(document.getElementById('spotTypeDistributionChart'));
            const reservationTrendChart = echarts.init(document.getElementById('reservationTrendChart'));
            const userTypeChart = echarts.init(document.getElementById('userTypeChart'));

            // Prepare data for charts from API responses
            const occupancyZones = Object.keys(dashboardData.occupancyRate);
            const occupancyValues = Object.values(dashboardData.occupancyRate);

            const spotDistributionTypes = Object.keys(dashboardData.spotDistribution);
            const spotDistributionValues = Object.values(dashboardData.spotDistribution);

            const reservationDays = Object.keys(dashboardData.reservationTrend);
            const reservationValues = Object.values(dashboardData.reservationTrend);

            const occupancyOption = {
                animation: false,
                title: {
                    text: 'Current Parking Occupancy',
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
                    data: occupancyZones,
                    axisLine: { lineStyle: { color: '#E5E7EB' } }
                },
                yAxis: {
                    type: 'value',
                    name: 'Occupancy %',
                    splitLine: { lineStyle: { color: '#E5E7EB' } }
                },
                series: [{
                    name: 'Occupancy Rate',
                    type: 'bar',
                    barWidth: '40%',
                    itemStyle: {
                        color: function (params: any) {
                            const value = params.data;
                            return value > 85 ? '#EF4444' :
                                value > 70 ? '#F59E0B' :
                                    '#10B981';
                        },
                        borderRadius: [4, 4, 0, 0]
                    },
                    data: occupancyValues
                }]
            };

            const spotTypeDistributionOption = {
                animation: false,
                title: {
                    text: 'Spot Type Distribution',
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
                    data: spotDistributionTypes.map((type, index) => ({
                        value: spotDistributionValues[index],
                        name: type.charAt(0).toUpperCase() + type.slice(1),
                        itemStyle: {
                            color: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'][index % 4]
                        }
                    }))
                }]
            };

            const reservationTrendOption = {
                animation: false,
                title: {
                    text: 'Reservation Trend',
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
                    data: reservationDays,
                    axisLine: { lineStyle: { color: '#E5E7EB' } }
                },
                yAxis: {
                    type: 'value',
                    name: 'Reservations',
                    splitLine: { lineStyle: { color: '#E5E7EB' } }
                },
                series: [{
                    name: 'Reservations',
                    type: 'line',
                    smooth: true,
                    lineStyle: { width: 3 },
                    itemStyle: { color: '#8B5CF6' },
                    data: reservationValues,
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0, y: 0, x2: 0, y2: 1,
                            colorStops: [{
                                offset: 0,
                                color: 'rgba(139, 92, 246, 0.2)'
                            }, {
                                offset: 1,
                                color: 'rgba(139, 92, 246, 0.01)'
                            }]
                        }
                    }
                }]
            };

            const userTypeOption = {
                animation: false,
                title: {
                    text: 'User Type Parking Distribution',
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
                    data: ['Students', 'Staff', 'Visitors', 'Admins'],
                    axisLine: { lineStyle: { color: '#E5E7EB' } }
                },
                yAxis: {
                    type: 'value',
                    name: 'Count',
                    splitLine: { lineStyle: { color: '#E5E7EB' } }
                },
                series: [{
                    name: 'Users',
                    type: 'bar',
                    barWidth: '40%',
                    data: [
                        dashboardData.spotDistribution.student || 0,
                        dashboardData.spotDistribution.staff || 0,
                        dashboardData.spotDistribution.visitor || 0,
                        0 // Admins count not available from current APIs
                    ],
                    itemStyle: {
                        color: function (params: any) {
                            const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
                            return colors[params.dataIndex];
                        },
                        borderRadius: [4, 4, 0, 0]
                    }
                }]
            };

            occupancyChart.setOption(occupancyOption);
            spotTypeDistributionChart.setOption(spotTypeDistributionOption);
            reservationTrendChart.setOption(reservationTrendOption);
            userTypeChart.setOption(userTypeOption);
        };

        setTimeout(initializeCharts, 100);

        return () => {
            const charts = [
                'occupancyChart',
                'spotTypeDistributionChart',
                'reservationTrendChart',
                'userTypeChart'
            ];

            charts.forEach(chartId => {
                const chartElement = document.getElementById(chartId);
                if (chartElement) {
                    const chart = echarts.getInstanceByDom(chartElement);
                    chart?.dispose();
                }
            });
        };
    }, [activeTab, dashboardData]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Total Spaces</h3>
                        <span className="text-2xl font-bold text-blue-600">{dashboardData.totalSpaces}</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Occupied Now</h3>
                        <span className="text-2xl font-bold text-green-600">{dashboardData.occupiedSpots}</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Active Reservations</h3>
                        <span className="text-2xl font-bold text-purple-600">{dashboardData.activeReservations}</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Registered Users</h3>
                        <span className="text-2xl font-bold text-indigo-600">{dashboardData.registeredUsers}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="occupancyChart" style={{ height: '300px' }}></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="spotTypeDistributionChart" style={{ height: '300px' }}></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="reservationTrendChart" style={{ height: '300px' }}></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="userTypeChart" style={{ height: '300px' }}></div>
                </div>
            </div>
        </div>
    )
};