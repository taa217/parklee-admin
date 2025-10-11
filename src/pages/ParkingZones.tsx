import React, { useState, useEffect } from 'react';
import * as echarts from 'echarts';
import { BASE_URL } from '../api';

interface ParkingSpot {
    spot_number: string;
    lot_name: string;
    is_vip: boolean;
    parking_zone_id: string;
    id: string;
    status: string;
}

interface ParkingZone {
    id: string;
    name: string;
    zone_type: string;
}

interface ZoneOccupancy {
    [key: string]: number;
}

interface SpotTypeAvailability {
    student: number;
    staff: number;
    visitor: number;
    vip: number;
}

interface HourlyOccupancyTrend {
    [key: string]: {
        [key: string]: number;
    };
}

interface CreateZoneForm {
    name: string;
    zone_type: string;
    latitude: string;
    logitude: string;
}

export const ParkingZonesDashboard: React.FC = () => {
    const [zones, setZones] = useState<ParkingZone[]>([]);
    const [selectedZone, setSelectedZone] = useState<ParkingZone | null>(null);
    const [spots, setSpots] = useState<ParkingSpot[]>([]);
    const [totalSpots, setTotalSpots] = useState<number>(0);
    const [availableSpots, setAvailableSpots] = useState<number>(0);
    const [zoneOccupancy, setZoneOccupancy] = useState<ZoneOccupancy>({});
    const [spotTypeAvailability, setSpotTypeAvailability] = useState<SpotTypeAvailability>({
        student: 0,
        staff: 0,
        visitor: 0,
        vip: 0
    });
    const [hourlyTrend, setHourlyTrend] = useState<HourlyOccupancyTrend>({});
    const [timeFilter, setTimeFilter] = useState<'realtime' | 'today' | 'week' | 'month'>('realtime');
    const [loading, setLoading] = useState<boolean>(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newZone, setNewZone] = useState<CreateZoneForm>({
        name: '',
        zone_type: 'visitor',
        latitude: '',
        logitude: ''
    });
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAllData = async () => {
        try {
            setLoading(true);

            // 1. First fetch zones
            const zonesResponse = await fetch(`${BASE_URL}/spots/zones/`, {
                headers: { 'accept': 'application/json' }
            });
            const zonesData = await zonesResponse.json();
            setZones(zonesData);

            if (zonesData.length > 0) {
                setSelectedZone(zonesData[0]);

                // 2. Then fetch zone-specific spots
                const spotsResponse = await fetch(`${BASE_URL}/spots/zones/${zonesData[0].id}/spots`, {
                    headers: { 'accept': 'application/json' }
                });
                setSpots(await spotsResponse.json());
            }

            // 3. Fetch all analytics data in parallel
            const [
                spotsCountResponse,
                availableSpotsResponse,
                occupancyResponse,
                spotTypeResponse,
                hourlyTrendResponse
            ] = await Promise.all([
                fetch(`${BASE_URL}/analytics/spots_count`, { headers: { 'accept': 'application/json' } }),
                fetch(`${BASE_URL}/analytics/spots/unoccupied_count`, { headers: { 'accept': 'application/json' } }),
                fetch(`${BASE_URL}/analytics/zones/occupancy_rate`, { headers: { 'accept': 'application/json' } }),
                fetch(`${BASE_URL}/analytics/users/spot_distribution_by_role`, { headers: { 'accept': 'application/json' } }),
                fetch(`${BASE_URL}/analytics/hourly_occupancy_trend_by_zone?hours_back=24`, { headers: { 'accept': 'application/json' } })
            ]);

            setTotalSpots(await spotsCountResponse.json());
            setAvailableSpots(await availableSpotsResponse.json());
            setZoneOccupancy(await occupancyResponse.json());
            setSpotTypeAvailability(await spotTypeResponse.json());
            setHourlyTrend(await hourlyTrendResponse.json());

            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchZoneData = async (zoneId: string) => {
        try {
            const response = await fetch(`${BASE_URL}/spots/zones/${zoneId}/spots`, {
                headers: { 'accept': 'application/json' }
            });
            const data = await response.json();
            setSpots(data);
        } catch (error) {
            console.error('Error fetching zone spots:', error);
        }
    };

    const handleCreateZone = async () => {
        if (!newZone.name.trim()) {
            setError('Zone name is required');
            return;
        }

        const lat = parseFloat(newZone.latitude);
        const lng = parseFloat(newZone.logitude);

        if (isNaN(lat)) {
            setError('Please enter a valid latitude');
            return;
        }

        if (isNaN(lng)) {
            setError('Please enter a valid logitude');
            return;
        }

        setIsCreating(true);
        setError(null);

        try {
            const response = await fetch(`${BASE_URL}/spots/zones/`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: newZone.name,
                    zone_type: newZone.zone_type,
                    latitude: lat,
                    logitude: lng
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create zone');
            }

            const createdZone = await response.json();

            // Refresh all data after successful creation
            await fetchAllData();

            // Select the newly created zone
            setSelectedZone(createdZone);
            setShowCreateModal(false);
            setNewZone({
                name: '',
                zone_type: 'visitor',
                latitude: '',
                logitude: ''
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsCreating(false);
        }
    };

    useEffect(() => {
        const initializeCharts = () => {
            // Zone Occupancy Chart
            const zoneOccupancyChart = echarts.init(document.getElementById('zoneOccupancyChart'));
            const zoneOccupancyOption = {
                title: {
                    text: 'Zone Occupancy Rates',
                    left: 'center',
                    textStyle: { fontSize: 14 }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: zones.length > 0 ? '{b}: {c}%' : 'No data available'
                },
                xAxis: {
                    type: 'category',
                    data: zones.length > 0 ? zones.map(zone => zone.name) : ['No zones'],
                    axisLabel: {
                        rotate: 30,
                        interval: 0
                    }
                },
                yAxis: {
                    type: 'value',
                    name: 'Occupancy %',
                    max: 100,
                    axisLabel: {
                        formatter: '{value}%'
                    }
                },
                series: [{
                    data: zones.length > 0 ? zones.map(zone => zoneOccupancy[zone.name] || 0) : [0],
                    type: 'bar',
                    itemStyle: {
                        color: function (params: any) {
                            const value = params.data;
                            return value > 85 ? '#EF4444' :
                                value > 70 ? '#F59E0B' :
                                    '#10B981';
                        },
                        borderRadius: [4, 4, 0, 0]
                    },
                    label: {
                        show: true,
                        position: 'top',
                        formatter: '{c}%'
                    }
                }]
            };

            // Hourly Trend Chart
            const hourlyTrendChart = echarts.init(document.getElementById('hourlyTrendChart'));
            const hourlyData = Object.entries(hourlyTrend)
                .map(([time, data]) => ({
                    time,
                    ...data
                }))
                .map(item => {
                    return {
                        time: item.time,
                        ...Object.fromEntries(
                            Object.entries(item).filter(([key, value]) =>
                                key === "time" || Number(value) <= 100
                            )
                        )
                    };
                });

            // console.log("hourly", hourlyTrend);

            const zoneNames = zones.length > 0 ? zones.map(zone => zone.name) : ['No zones'];
            const seriesData = zoneNames.map(zoneName => ({
                name: zoneName,
                type: 'line',
                smooth: true,
                data: hourlyData.map(item => (item as any)[zoneName] || 0),
                lineStyle: { width: 3 },
                symbol: 'none'
            }));

            const hourlyTrendOption = {
                title: {
                    text: 'Hourly Occupancy Trend',
                    left: 'center',
                    textStyle: { fontSize: 14 }
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: zoneNames,
                    bottom: 0
                },
                xAxis: {
                    type: 'category',
                    data: hourlyData.length > 0
                        ? hourlyData.map(item => {
                            const date = new Date(item.time);
                            return `${date.getHours()}:00`;
                        })
                        : ['No data']
                },
                yAxis: {
                    type: 'value',
                    name: 'Occupancy %',
                    max: 100,
                    axisLabel: {
                        formatter: '{value}%'
                    }
                },
                series: seriesData
            };

            // Spot Type Availability Chart
            const spotTypeAvailabilityChart = echarts.init(document.getElementById('spotTypeAvailabilityChart'));
            const spotTypeAvailabilityOption = {
                title: {
                    text: 'Spot Type Availability',
                    left: 'center',
                    textStyle: { fontSize: 14 }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}: {c} ({d}%)'
                },
                legend: {
                    bottom: '0'
                },
                series: [{
                    name: 'Spot Types',
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
                    data: [
                        {
                            value: spotTypeAvailability.student,
                            name: 'Student',
                            itemStyle: { color: '#3B82F6' }
                        },
                        {
                            value: spotTypeAvailability.staff,
                            name: 'Staff',
                            itemStyle: { color: '#10B981' }
                        },
                        {
                            value: spotTypeAvailability.visitor,
                            name: 'Visitor',
                            itemStyle: { color: '#F59E0B' }
                        },
                        {
                            value: spotTypeAvailability.vip,
                            name: 'VIP',
                            itemStyle: { color: '#EF4444' }
                        }
                    ]
                }]
            };

            zoneOccupancyChart.setOption(zoneOccupancyOption);
            hourlyTrendChart.setOption(hourlyTrendOption);
            spotTypeAvailabilityChart.setOption(spotTypeAvailabilityOption);

            return () => {
                zoneOccupancyChart.dispose();
                hourlyTrendChart.dispose();
                spotTypeAvailabilityChart.dispose();
            };
        };

        if (!loading) {
            initializeCharts();
        }
    }, [selectedZone, timeFilter, loading, zones, zoneOccupancy, hourlyTrend, spotTypeAvailability]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    const currentZoneOccupancy = selectedZone ? zoneOccupancy[selectedZone.name] || 0 : 0;

    return (
        <div className="space-y-6">
            {/* Zone Selection and Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                        <label htmlFor="zone-select" className="block text-sm font-medium text-gray-700 mb-1">
                            Select Parking Zone
                        </label>
                        <div className="flex gap-2">
                            <select
                                id="zone-select"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={selectedZone?.id || ''}
                                onChange={(e) => {
                                    const zone = zones.find(z => z.id === e.target.value);
                                    if (zone) {
                                        setSelectedZone(zone);
                                        fetchZoneData(zone.id);
                                    }
                                }}
                                disabled={zones.length === 0}
                            >
                                {zones.length > 0 ? (
                                    zones.map(zone => (
                                        <option key={zone.id} value={zone.id}>{zone.name}</option>
                                    ))
                                ) : (
                                    <option value="">No zones available</option>
                                )}
                            </select>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 whitespace-nowrap"
                            >
                                <i className="fas fa-plus mr-2"></i>Add Zone
                            </button>
                        </div>
                    </div>

                    <div className="flex-1">
                        <label htmlFor="time-filter" className="block text-sm font-medium text-gray-700 mb-1">
                            Time Period
                        </label>
                        <select
                            id="time-filter"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value as any)}
                        >
                            <option value="realtime">Real-time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            onClick={fetchAllData}
                        >
                            <i className="fas fa-sync-alt mr-2"></i>Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Zone Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Total Spots</h3>
                        <span className="text-2xl font-bold text-blue-600">{totalSpots}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {selectedZone ? `In selected zone: ${spots.length}` : 'No zone selected'}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Available Now</h3>
                        <span className="text-2xl font-bold text-green-600">{availableSpots}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {totalSpots > 0 ? Math.round((availableSpots / totalSpots) * 100) : 0}% availability
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Occupancy Rate</h3>
                        <span className="text-2xl font-bold text-orange-600">
                            {selectedZone ? `${currentZoneOccupancy}%` : 'N/A'}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {selectedZone ? (
                            currentZoneOccupancy > 85 ? 'High occupancy' :
                                currentZoneOccupancy > 70 ? 'Moderate occupancy' : 'Low occupancy'
                        ) : 'No zone selected'}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Zone Type</h3>
                        <span className="text-2xl font-bold text-purple-600">
                            {selectedZone ? selectedZone.zone_type : 'N/A'}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Parking zone category</p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="zoneOccupancyChart" style={{ height: '300px' }}></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="hourlyTrendChart" style={{ height: '300px' }}></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="spotTypeAvailabilityChart" style={{ height: '300px' }}></div>
                </div>
            </div>

            {/* Parking Spots Visualization */}
            {selectedZone && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {selectedZone.name} - Spot Availability
                            </h3>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                    <span className="text-sm text-gray-600">Available</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                                    <span className="text-sm text-gray-600">Occupied</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                                    <span className="text-sm text-gray-600">VIP</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {spots.length > 0 ? (
                            <div className="grid grid-cols-10 gap-2">
                                {spots.map(spot => (
                                    <div
                                        key={spot.id}
                                        className={`aspect-square rounded flex items-center justify-center cursor-pointer transition-all
                      ${spot.status !== 'empty' ? 'bg-red-500 hover:bg-red-600' :
                                                spot.is_vip ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}
                    `}
                                        title={`Spot ${spot.spot_number} (${spot.is_vip ? 'VIP' : 'Regular'}) - ${spot.status !== 'empty' ? 'Occupied' : 'Available'}`}
                                    >
                                        <span className="text-white text-xs font-medium">{spot.spot_number}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No parking spots available for this zone
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Create Zone Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Create New Parking Zone</h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Zone Name</label>
                                <input
                                    type="text"
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={newZone.name}
                                    onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                                    placeholder="Enter zone name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Zone Type</label>
                                <select
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={newZone.zone_type}
                                    onChange={(e) => setNewZone({ ...newZone, zone_type: e.target.value })}
                                >
                                    <option value="visitor">visitor</option>
                                    <option value="staff">staff</option>
                                    <option value="student">student</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={newZone.latitude}
                                        onChange={(e) => setNewZone({ ...newZone, latitude: e.target.value })}
                                        placeholder="Enter latitude"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">logitude</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={newZone.logitude}
                                        onChange={(e) => setNewZone({ ...newZone, logitude: e.target.value })}
                                        placeholder="Enter logitude"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                disabled={isCreating}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateZone}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                                disabled={isCreating}
                            >
                                {isCreating ? 'Creating...' : 'Create Zone'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};