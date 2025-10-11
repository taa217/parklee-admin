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

interface SpotTypeDistribution {
    student: number;
    staff: number;
    visitor: number;
    vip: number;
}

interface HourlyOccupancyTrend {
    [key: string]: {
        staff: number;
        visitor: number;
    };
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            ×
                        </button>
                    </div>
                </div>
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

export const ParkingSpacesDashboard: React.FC = () => {
    const [spots, setSpots] = useState<ParkingSpot[]>([]);
    const [filteredSpots, setFilteredSpots] = useState<ParkingSpot[]>([]);
    const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
    const [totalSpots, setTotalSpots] = useState<number>(0);
    const [availableSpots, setAvailableSpots] = useState<number>(0);
    const [spotDistribution, setSpotDistribution] = useState<SpotTypeDistribution>({ student: 0, staff: 0, visitor: 0, vip: 0 });
    const [hourlyTrend, setHourlyTrend] = useState<HourlyOccupancyTrend>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
    const [zones, setZones] = useState<any[]>([]);
    const [newSpot, setNewSpot] = useState({
        spot_number: '',
        lot_name: '',
        is_vip: false,
        parking_zone_id: ''
    });
    const [file, setFile] = useState<File | null>(null);

    const [filters, setFilters] = useState({
        lot: 'all',
        status: 'all',
        type: 'all',
        sort: 'number'
    });

    const fetchAllData = async () => {
        try {
            setLoading(true);

            // Fetch all spots
            const spotsResponse = await fetch(`${BASE_URL}/spots/all-spots`, {
                headers: {
                    'accept': 'application/json'
                }
            });
            const spotsData = await spotsResponse.json();
            setSpots(spotsData);
            setFilteredSpots(spotsData);

            // Fetch total spots count
            const totalSpotsResponse = await fetch(`${BASE_URL}/analytics/spots_count`, {
                headers: {
                    'accept': 'application/json'
                }
            });
            const totalSpotsData = await totalSpotsResponse.json();
            setTotalSpots(totalSpotsData);

            // Fetch available spots count
            const availableSpotsResponse = await fetch(`${BASE_URL}/analytics/spots/unoccupied_count`, {
                headers: {
                    'accept': 'application/json'
                }
            });
            const availableSpotsData = await availableSpotsResponse.json();
            setAvailableSpots(availableSpotsData);

            // Fetch spot distribution by role
            const distributionResponse = await fetch(`${BASE_URL}/analytics/users/spot_distribution_by_role`, {
                headers: {
                    'accept': 'application/json'
                }
            });
            const distributionData = await distributionResponse.json();
            setSpotDistribution(distributionData);

            // Fetch hourly occupancy trend
            const trendResponse = await fetch(`${BASE_URL}/analytics/hourly_occupancy_trend_by_zone_type?hours_back=24`, {
                headers: {
                    'accept': 'application/json'
                }
            });
            const trendData = await trendResponse.json();
            setHourlyTrend(trendData);

            // Fetch zones
            const zonesResponse = await fetch(`${BASE_URL}/spots/zones/`, {
                headers: {
                    'accept': 'application/json'
                }
            });
            const zonesData = await zonesResponse.json();
            setZones(zonesData);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    // Fetch all data from APIs
    useEffect(() => {
        fetchAllData();
    }, []);

    // Apply filters
    useEffect(() => {
        let result = [...spots];

        if (filters.lot !== 'all') {
            result = result.filter(spot => spot.lot_name === filters.lot);
        }

        if (filters.status !== 'all') {
            result = result.filter(spot =>
                filters.status === 'occupied' ? spot.status === 'occupied' : spot.status === 'empty'
            );
        }

        if (filters.type !== 'all') {
            result = result.filter(spot => {
                if (filters.type === 'vip') return spot.is_vip;
                return true;
            });
        }

        result.sort((a, b) => {
            if (filters.sort === 'number') return a.spot_number.localeCompare(b.spot_number);
            return 0;
        });

        setFilteredSpots(result);
    }, [filters, spots]);

    // Initialize charts with real data
    useEffect(() => {
        if (loading) return;

        const initializeCharts = () => {
            const typeChart = echarts.init(document.getElementById('spotTypeChart'));
            const trendChart = echarts.init(document.getElementById('occupancyTrendChart'));

            const typeOptions = {
                title: {
                    text: 'Spot Type Distribution',
                    left: 'center',
                    textStyle: { fontSize: 14 }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}: {c} ({d}%)'
                },
                legend: {
                    bottom: 10,
                    data: ['Student', 'Staff', 'Visitor', 'VIP']
                },
                series: [
                    {
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
                            { value: spotDistribution.student, name: 'Student', itemStyle: { color: '#3B82F6' } },
                            { value: spotDistribution.staff, name: 'Staff', itemStyle: { color: '#10B981' } },
                            { value: spotDistribution.visitor, name: 'Visitor', itemStyle: { color: '#F59E0B' } },
                            { value: spotDistribution.vip, name: 'VIP', itemStyle: { color: '#EF4444' } }
                        ]
                    }
                ]
            };

            const trendData = Object.entries(hourlyTrend).map(([time, data]) => ({
                time,
                staff: data.staff,
                visitor: data.visitor
            }));

            const trendOptions = {
                title: {
                    text: 'Hourly Occupancy Trend',
                    left: 'center',
                    textStyle: { fontSize: 14 }
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: ['Staff', 'Visitor'],
                    bottom: 10
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: trendData.map(item => item.time)
                },
                yAxis: {
                    type: 'value',
                    name: 'Occupancy Count',
                    axisLabel: {
                        formatter: '{value}'
                    }
                },
                series: [
                    {
                        name: 'Staff',
                        type: 'line',
                        data: trendData.map(item => Number(item.staff) <= 70 ? Number(item.staff) : null),
                        smooth: true,
                        lineStyle: { width: 3 },
                        itemStyle: { color: '#10B981' }
                    },
                    {
                        name: 'Visitor',
                        type: 'line',
                        data: trendData.map(item => Number(item.visitor) <= 70 ? Number(item.visitor) : null),
                        smooth: true,
                        lineStyle: { width: 3 },
                        itemStyle: { color: '#F59E0B' }
                    }
                ]
            };


            typeChart.setOption(typeOptions);
            trendChart.setOption(trendOptions);

            return () => {
                typeChart.dispose();
                trendChart.dispose();
            };
        };

        initializeCharts();
    }, [loading, spots, spotDistribution, hourlyTrend]);

    const toggleSpotOccupancy = (id: string) => {
        setSpots(prevSpots =>
            prevSpots.map(spot =>
                spot.id === id
                    ? {
                        ...spot,
                        status: spot.status === 'occupied' ? 'empty' : 'occupied'
                    }
                    : spot
            )
        );
    };

    const handleCreateSpot = async () => {
        try {
            const response = await fetch(`${BASE_URL}/spots/spots`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json'
                },
                body: JSON.stringify({
                    spot_number: newSpot.spot_number,
                    lot_name: newSpot.lot_name,
                    is_vip: newSpot.is_vip,
                    parking_zone_id: newSpot.parking_zone_id
                })
            });

            if (response.ok) {
                alert('Parking space created successfully!');
                setShowCreateModal(false);
                setNewSpot({
                    spot_number: '',
                    lot_name: '',
                    is_vip: false,
                    parking_zone_id: ''
                });
                // Refresh all data after successful creation
                await fetchAllData();
            } else {
                throw new Error('Failed to create parking space');
            }
        } catch (error) {
            console.error('Error creating parking space:', error);
            alert('Error creating parking space');
        }
    };

    const handleBulkUpload = async () => {
        if (!file) {
            alert('Please select a file');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${BASE_URL}/spots/bulk-upload`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                alert('Bulk upload completed successfully!');
                setShowBulkUploadModal(false);
                setFile(null);
                // Refresh all data after successful upload
                await fetchAllData();
            } else {
                throw new Error('Failed to process bulk upload');
            }
        } catch (error) {
            console.error('Error during bulk upload:', error);
            alert('Error during bulk upload');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-xl font-semibold">Loading parking data...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters and Controls */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Parking Lot</label>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={filters.lot}
                            onChange={(e) => setFilters({ ...filters, lot: e.target.value })}
                        >
                            <option value="all">All Lots</option>
                            {Array.from(new Set(spots.map(spot => spot.lot_name))).map(lot => (
                                <option key={lot} value={lot}>{lot}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option value="all">All Statuses</option>
                            <option value="occupied">Occupied</option>
                            <option value="available">Available</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Spot Type</label>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
                        >
                            <option value="all">All Types</option>
                            <option value="student">Student</option>
                            <option value="staff">Staff</option>
                            <option value="visitor">Visitor</option>
                            <option value="vip">VIP</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={filters.sort}
                            onChange={(e) => setFilters({ ...filters, sort: e.target.value as any })}
                        >
                            <option value="number">Spot Number</option>
                        </select>
                    </div>

                    <div className="flex items-end space-x-2">
                        <button
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            onClick={() => {
                                setFilters({
                                    lot: 'all',
                                    status: 'all',
                                    type: 'all',
                                    sort: 'number'
                                });
                            }}
                        >
                            Reset Filters
                        </button>
                        <button
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            onClick={() => setShowCreateModal(true)}
                        >
                            Create
                        </button>
                        <button
                            className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                            onClick={() => setShowBulkUploadModal(true)}
                        >
                            Bulk Upload
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Total Spots</h3>
                        <span className="text-2xl font-bold text-blue-600">{totalSpots}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {spotDistribution.student} student, {spotDistribution.staff} staff
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
                        <h3 className="text-lg font-semibold text-gray-800">Occupied Spots</h3>
                        <span className="text-2xl font-bold text-orange-600">
                            {totalSpots - availableSpots}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {totalSpots > 0 ? Math.round(((totalSpots - availableSpots) / totalSpots) * 100) : 0}% occupancy
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">VIP Spots</h3>
                        <span className="text-2xl font-bold text-purple-600">
                            {spotDistribution.vip}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {spots.filter(s => s.is_vip).filter(s => s.status === 'empty').length} available
                    </p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="spotTypeChart" style={{ height: '300px' }}></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="occupancyTrendChart" style={{ height: '300px' }}></div>
                </div>
            </div>

            {/* Parking Spots Visualization */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Parking Spots - {filteredSpots.length} spots found
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
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filteredSpots.slice(0, 50).map(spot => (
                            <div
                                key={spot.id}
                                className={`p-3 rounded-lg border cursor-pointer transition-all
                  ${spot.status === 'occupied' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}
                  ${selectedSpot?.id === spot.id ? 'ring-2 ring-blue-500' : ''}
                `}
                                onClick={() => setSelectedSpot(spot)}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${spot.status === 'occupied' ? 'bg-red-500' : 'bg-green-500'
                                            }`}></span>
                                        <span className="font-medium">Spot {spot.spot_number}</span>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded capitalize ${spot.is_vip ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {spot.is_vip ? 'VIP' : 'Regular'}
                                    </span>
                                </div>
                                <div className="mt-2 text-sm text-gray-600">
                                    <div>Lot: {spot.lot_name}</div>
                                    <div>Status: {spot.status === 'occupied' ? 'Occupied' : 'Available'}</div>
                                    <div>Zone:  {zones.map(zone => (
                                        <option key={zone.id} value={zone.id}>{zone.name}</option>
                                    ))}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredSpots.length > 50 && (
                        <div className="mt-4 text-center text-sm text-gray-500">
                            Showing 50 of {filteredSpots.length} spots. Use filters to refine your search.
                        </div>
                    )}
                </div>
            </div>

            {/* Selected Spot Details */}
            {selectedSpot && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Spot {selectedSpot.spot_number} Details
                            </h3>
                            <button
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => setSelectedSpot(null)}
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Lot:</span>
                                    <span className="font-medium">{selectedSpot.lot_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Type:</span>
                                    <span className={`px-2 py-1 rounded text-xs capitalize ${selectedSpot.is_vip ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {selectedSpot.is_vip ? 'VIP' : 'Regular'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status:</span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${selectedSpot.status === 'occupied' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                        {selectedSpot.status === 'occupied' ? 'Occupied' : 'Available'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Zone ID:</span>
                                    <span className="font-mono text-xs">
                                        {selectedSpot.parking_zone_id}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Spot Actions</h4>
                            <div className="space-y-3">
                                <button
                                    className={`w-full px-4 py-2 rounded-md text-white ${selectedSpot.status === 'occupied' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                                        }`}
                                    onClick={() => toggleSpotOccupancy(selectedSpot.id)}
                                >
                                    {selectedSpot.status === 'occupied' ? 'Mark as Available' : 'Mark as Occupied'}
                                </button>
                                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                    View Reservation History
                                </button>
                                <button className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                                    Edit Spot Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Parking Space Modal */}
            <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Parking Space">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Spot Number</label>
                        <input
                            type="text"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={newSpot.spot_number}
                            onChange={(e) => setNewSpot({ ...newSpot, spot_number: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lot Name</label>
                        <input
                            type="text"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={newSpot.lot_name}
                            onChange={(e) => setNewSpot({ ...newSpot, lot_name: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Parking Zone</label>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={newSpot.parking_zone_id}
                            onChange={(e) => setNewSpot({ ...newSpot, parking_zone_id: e.target.value })}
                            required
                        >
                            <option value="">Select a zone</option>
                            {zones.map(zone => (
                                <option key={zone.id} value={zone.id}>{zone.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="is_vip"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={newSpot.is_vip}
                            onChange={(e) => setNewSpot({ ...newSpot, is_vip: e.target.checked })}
                        />
                        <label htmlFor="is_vip" className="ml-2 block text-sm text-gray-700">
                            VIP Spot
                        </label>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                            onClick={() => setShowCreateModal(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            onClick={handleCreateSpot}
                        >
                            Create
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Bulk Upload Modal */}
            <Modal isOpen={showBulkUploadModal} onClose={() => setShowBulkUploadModal(false)} title="Bulk Upload Parking Spaces">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CSV File</label>
                        <input
                            type="file"
                            accept=".csv"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            CSV should contain columns: spot_number, lot_name, is_vip, parking_zone_id
                        </p>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                            onClick={() => setShowBulkUploadModal(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            onClick={handleBulkUpload}
                        >
                            Upload
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};