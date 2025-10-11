import React, { useState, useEffect } from 'react';
import * as echarts from 'echarts';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import { BASE_URL } from '../api';

const localizer = momentLocalizer(moment);

interface Event {
    id: string;
    name: string;
    description: string;
    date: string;
    start_time: string;
    end_time: string;
    event_location: string;
    latitude: number;
    longitude: number;
    allowed_parking_lots: any[];
    event_type: 'academic' | 'sports' | 'cultural' | 'official';
    status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

interface NewEventFormData {
    name: string;
    description: string;
    date: string;
    start_time: string;
    end_time: string;
    event_location: string;
    latitude: number;
    longitude: number;
    allowed_parking_lots: any[];
    event_type: 'academic' | 'sports' | 'cultural' | 'official';
}

export const EventsDashboard: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [filter, setFilter] = useState({
        status: 'all',
        eventType: 'all',
        timeRange: 'month'
    });
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newEvent, setNewEvent] = useState<NewEventFormData>({
        name: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '17:00',
        event_location: '',
        latitude: 0,
        longitude: 0,
        allowed_parking_lots: [],
        event_type: 'academic'
    });
    const [stats, setStats] = useState({
        total_events: 0,
        type_distribution: {
            academia: 0,
            sports: 0,
            cultural: 0,
            official: 0
        },
        monthly_trend: {
            months: [] as string[],
            academia: [] as number[],
            sports: [] as number[],
            cultural: [] as number[],
            official: [] as number[]
        },
        weekly_distribution: {} as Record<string, any>
    });

    // Fetch data from APIs
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch events
                const eventsResponse = await axios.get(`${BASE_URL}/events/`);
                const eventsWithStatus = eventsResponse.data.map((event: any) => ({
                    ...event,
                    status: getEventStatus(event)
                }));
                setEvents(eventsWithStatus);

                // Fetch statistics
                const totalEventsResponse = await axios.get(`${BASE_URL}/analytics/api/analytics/events/count`);
                const typeDistributionResponse = await axios.get(`${BASE_URL}/analytics/api/analytics/events/distribution_by_type`);
                const monthlyTrendResponse = await axios.get(`${BASE_URL}/analytics/api/analytics/events/trend_by_month`);
                const weeklyDistributionResponse = await axios.get(`${BASE_URL}/analytics/api/analytics/events/distribution_by_week`);

                setStats({
                    total_events: totalEventsResponse.data.total_events,
                    type_distribution: typeDistributionResponse.data,
                    monthly_trend: monthlyTrendResponse.data,
                    weekly_distribution: weeklyDistributionResponse.data
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    // Determine event status based on dates
    const getEventStatus = (event: Event): 'upcoming' | 'ongoing' | 'completed' | 'cancelled' => {
        const now = new Date();
        const startDate = new Date(event.start_time);
        const endDate = new Date(event.end_time);

        // For simplicity, we'll assume no events are cancelled in this implementation
        if (now < startDate) return 'upcoming';
        if (now >= startDate && now <= endDate) return 'ongoing';
        return 'completed';
    };

    const filteredEvents = events.filter(event => {
        const now = new Date();

        const eventDate = new Date(event.start_time);

        // Calculate start and end of current week (Monday to Sunday)
        // JS: getDay() Sunday=0 ... Saturday=6
        const dayOfWeek = now.getDay();
        // Monday is 1, so if Sunday(0), treat as 7 for calculation
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const weekStart = new Date(now);
        weekStart.setHours(0, 0, 0, 0);
        weekStart.setDate(now.getDate() + mondayOffset);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        // Start and end of current month
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        // Start and end of today
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);

        return (
            (filter.status === 'all' || event.status === filter.status) &&
            (filter.eventType === 'all' || event.event_type === filter.eventType) &&
            (filter.timeRange === 'all' ||
                (filter.timeRange === 'month' &&
                    eventDate >= monthStart &&
                    eventDate <= monthEnd) ||
                (filter.timeRange === 'week' &&
                    eventDate >= weekStart &&
                    eventDate <= weekEnd) ||
                (filter.timeRange === 'today' &&
                    eventDate >= todayStart &&
                    eventDate <= todayEnd)
            )
        );
    });


    // Initialize charts
    useEffect(() => {
        if (!stats.monthly_trend.months.length) return;

        const initCharts = () => {
            // Event Type Distribution Chart
            const typeChart = echarts.init(document.getElementById('eventTypeChart'));
            const typeOptions = {
                title: {
                    text: 'Event Type Distribution',
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
                    data: ['academia', 'Sports', 'Cultural', 'Official']
                },
                series: [
                    {
                        name: 'Event Types',
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
                                value: stats.type_distribution.academia,
                                name: 'academia',
                                itemStyle: { color: '#3B82F6' }
                            },
                            {
                                value: stats.type_distribution.sports,
                                name: 'Sports',
                                itemStyle: { color: '#10B981' }
                            },
                            {
                                value: stats.type_distribution.cultural,
                                name: 'Cultural',
                                itemStyle: { color: '#F59E0B' }
                            },
                            {
                                value: stats.type_distribution.official,
                                name: 'Official',
                                itemStyle: { color: '#8B5CF6' }
                            }
                        ]
                    }
                ]
            };

            // Monthly Event Trend Chart
            const trendChart = echarts.init(document.getElementById('eventTrendChart'));
            const trendOptions = {
                title: {
                    text: 'Monthly Event Trend',
                    left: 'center',
                    textStyle: { fontSize: 14 }
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: ['academia', 'Sports', 'Cultural', 'Official'],
                    bottom: 0
                },
                xAxis: {
                    type: 'category',
                    data: stats.monthly_trend.months
                },
                yAxis: {
                    type: 'value',
                    name: 'Number of Events'
                },
                series: [
                    {
                        name: 'academia',
                        type: 'line',
                        smooth: true,
                        data: stats.monthly_trend.academia,
                        lineStyle: { width: 3 },
                        itemStyle: { color: '#3B82F6' }
                    },
                    {
                        name: 'Sports',
                        type: 'line',
                        smooth: true,
                        data: stats.monthly_trend.sports,
                        lineStyle: { width: 3 },
                        itemStyle: { color: '#10B981' }
                    },
                    {
                        name: 'Cultural',
                        type: 'line',
                        smooth: true,
                        data: stats.monthly_trend.cultural,
                        lineStyle: { width: 3 },
                        itemStyle: { color: '#F59E0B' }
                    },
                    {
                        name: 'Official',
                        type: 'line',
                        smooth: true,
                        data: stats.monthly_trend.official,
                        lineStyle: { width: 3 },
                        itemStyle: { color: '#8B5CF6' }
                    }
                ]
            };

            // Parking Demand Chart (using type distribution as proxy)
            const demandChart = echarts.init(document.getElementById('parkingDemandChart'));
            const demandOptions = {
                title: {
                    text: 'Parking Demand by Event Type',
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
                    data: ['academia', 'Sports', 'Cultural', 'Official']
                },
                yAxis: {
                    type: 'value',
                    name: 'Number of Events'
                },
                series: [
                    {
                        name: 'Events',
                        type: 'bar',
                        data: [
                            stats.type_distribution.academia,
                            stats.type_distribution.sports,
                            stats.type_distribution.cultural,
                            stats.type_distribution.official
                        ],
                        itemStyle: {
                            color: function (params: any) {
                                const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
                                return colors[params.dataIndex];
                            },
                            borderRadius: [4, 4, 0, 0]
                        }
                    }
                ]
            };

            typeChart.setOption(typeOptions);
            trendChart.setOption(trendOptions);
            demandChart.setOption(demandOptions);

            return () => {
                typeChart.dispose();
                trendChart.dispose();
                demandChart.dispose();
            };
        };

        initCharts();
    }, [stats]);

    // Calendar events for react-big-calendar
    const calendarEvents = filteredEvents.map(event => ({
        id: event.id,
        title: event.name,
        start: new Date(event.start_time),
        end: new Date(event.end_time),
        status: event.status,
        eventType: event.event_type,
        allDay: false
    }));

    const eventStyleGetter = (event: any) => {
        let backgroundColor = '';
        let borderColor = '';

        switch (event.eventType) {
            case 'academia':
                backgroundColor = '#BFDBFE';
                borderColor = '#3B82F6';
                break;
            case 'sports':
                backgroundColor = '#A7F3D0';
                borderColor = '#10B981';
                break;
            case 'cultural':
                backgroundColor = '#FDE68A';
                borderColor = '#F59E0B';
                break;
            case 'official':
                backgroundColor = '#DDD6FE';
                borderColor = '#8B5CF6';
                break;
            default:
                backgroundColor = '#E5E7EB';
                borderColor = '#6B7280';
        }

        if (event.status === 'cancelled') {
            backgroundColor = '#FECACA';
            borderColor = '#EF4444';
        } else if (event.status === 'ongoing') {
            borderColor = '#000000';
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '4px',
                border: `2px solid ${borderColor}`,
                color: '#1F2937',
                fontSize: '12px',
                opacity: event.status === 'cancelled' ? 0.7 : 1
            }
        };
    };

    const handleSelectEvent = (event: any) => {
        const foundEvent = events.find(e => e.id === event.id);
        if (foundEvent) setSelectedEvent(foundEvent);
    };

    const updateEventStatus = (id: string, status: string) => {
        setEvents(prev =>
            prev.map(event =>
                event.id === id ? { ...event, status: status as any } : event
            )
        );
        setSelectedEvent(null);
    };

    const handleCreateEvent = async () => {
        try {
            // Format the date and times for the API
            const formattedEvent = {
                ...newEvent,
                date: `${newEvent.date}T${newEvent.start_time}:00.000Z`,
                start_time: `${newEvent.date}T${newEvent.start_time}:00.000Z`,
                end_time: `${newEvent.date}T${newEvent.end_time}:00.000Z`
            };

            const response = await axios.post(`${BASE_URL}/events/`, formattedEvent, {
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            // Add the new event to the list with a status
            const eventWithStatus = {
                ...response.data,
                status: getEventStatus(response.data)
            };
            setEvents([...events, eventWithStatus]);
            setShowCreateModal(false);
            alert('Event created successfully!');
            setNewEvent({
                name: '',
                description: '',
                date: new Date().toISOString().split('T')[0],
                start_time: '09:00',
                end_time: '17:00',
                event_location: '',
                latitude: 0,
                longitude: 0,
                allowed_parking_lots: [],
                event_type: 'academic'
            });
        } catch (error) {
            console.error('Error creating event:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewEvent(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={filter.status}
                            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                        >
                            <option value="all">All Statuses</option>
                            <option value="upcoming">Upcoming</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={filter.eventType}
                            onChange={(e) => setFilter({ ...filter, eventType: e.target.value })}
                        >
                            <option value="all">All Types</option>
                            <option value="academic">academic</option>
                            <option value="sports">sports</option>
                            <option value="cultural">cultural</option>
                            <option value="official">official</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={filter.timeRange}
                            onChange={(e) => setFilter({ ...filter, timeRange: e.target.value })}
                        >
                            <option value="month">This Month</option>
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
                                eventType: 'all',
                                timeRange: 'month'
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
                        <h3 className="text-lg font-semibold text-gray-800">Total Events</h3>
                        <span className="text-2xl font-bold text-blue-600">{stats.total_events}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {filteredEvents.length} match filters
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Upcoming Events</h3>
                        <span className="text-2xl font-bold text-green-600">
                            {events.filter(e => e.status === 'upcoming').length}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {events.filter(e =>
                            e.status === 'upcoming' &&
                            new Date(e.start_time).toDateString() === new Date().toDateString()
                        ).length} today
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Event Types</h3>
                        <span className="text-2xl font-bold text-orange-600">
                            {Object.keys(stats.type_distribution).length}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {Object.entries(stats.type_distribution).map(([type, count]) => `${type}: ${count}`).join(', ')}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Monthly Trend</h3>
                        <span className="text-2xl font-bold text-purple-600">
                            {stats.monthly_trend.months.length} months
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        Current: {stats.monthly_trend.months[stats.monthly_trend.months.length - 1]}
                    </p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="eventTypeChart" style={{ height: '300px' }}></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="eventTrendChart" style={{ height: '300px' }}></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="parkingDemandChart" style={{ height: '300px' }}></div>
                </div>
            </div>

            {/* Calendar View */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">Event Calendar</h3>
                </div>
                <div className="p-4" style={{ height: '500px' }}>
                    <Calendar
                        localizer={localizer}
                        events={calendarEvents}
                        startAccessor="start"
                        endAccessor="end"
                        defaultView="month"
                        views={['day', 'week', 'month']}
                        eventPropGetter={eventStyleGetter}
                        onSelectEvent={handleSelectEvent}
                        style={{ height: '100%' }}
                    />
                </div>
            </div>

            {/* Events Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Event Records ({filteredEvents.length})
                        </h3>
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            onClick={() => setShowCreateModal(true)}
                        >
                            + New Event
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parking Lots</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coordinates</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredEvents.slice(0, 10).map(event => (
                                <tr key={event.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{event.name}</div>
                                        <div className="text-sm text-gray-500 truncate max-w-xs">{event.description}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {new Date(event.start_time).toLocaleDateString()}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            09:00 AM - 16:00 PM
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {event.event_location}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${event.event_type === 'academic' ? 'bg-blue-100 text-blue-800' :
                                            event.event_type === 'sports' ? 'bg-green-100 text-green-800' :
                                                event.event_type === 'cultural' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-purple-100 text-purple-800'
                                            }`}>
                                            {event.event_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {event.allowed_parking_lots.length} lots
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                                            event.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                                                event.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {event.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                            onClick={() => setSelectedEvent(event)}
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
                {filteredEvents.length > 10 && (
                    <div className="p-4 border-t border-gray-200 text-center text-sm text-gray-500">
                        Showing 10 of {filteredEvents.length} events. Use filters to refine your search.
                    </div>
                )}
            </div>

            {/* Event Detail Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {selectedEvent.name}
                                </h3>
                                <button
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={() => setSelectedEvent(null)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Event Information</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Event ID:</span>
                                        <span className="font-mono">{selectedEvent.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${selectedEvent.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                                            selectedEvent.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                                                selectedEvent.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {selectedEvent.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Type:</span>
                                        <span className="capitalize">{selectedEvent.event_type}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Location:</span>
                                        <span className="font-medium">{selectedEvent.event_location}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Coordinates:</span>
                                        <span>
                                            {selectedEvent.latitude}, {selectedEvent.longitude}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Date/Time:</span>
                                        <span>
                                            {new Date(selectedEvent.start_time).toLocaleString()} -<br />
                                            {new Date(selectedEvent.end_time).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Additional Information</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Parking Lots:</span>
                                        <span className="font-medium">{selectedEvent.allowed_parking_lots.length}</span>
                                    </div>
                                </div>

                                <h4 className="font-medium text-gray-900 mt-6 mb-3">Description</h4>
                                <p className="text-sm text-gray-600">
                                    {selectedEvent.description}
                                </p>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-3">Actions</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {selectedEvent.status !== 'ongoing' && selectedEvent.status !== 'completed' && (
                                    <button
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                        onClick={() => updateEventStatus(selectedEvent.id, 'ongoing')}
                                    >
                                        Start Event
                                    </button>
                                )}
                                {selectedEvent.status === 'ongoing' && (
                                    <button
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        onClick={() => updateEventStatus(selectedEvent.id, 'completed')}
                                    >
                                        Complete Event
                                    </button>
                                )}
                                {selectedEvent.status !== 'cancelled' && (
                                    <button
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                        onClick={() => updateEventStatus(selectedEvent.id, 'cancelled')}
                                    >
                                        Cancel Event
                                    </button>
                                )}
                                <button
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                >
                                    Edit Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Event Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Create New Event
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

                        <div className="p-6">
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={newEvent.name}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                        placeholder="e.g. University of Zimbabwe Founders Day Celebration"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={newEvent.description}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        rows={3}
                                        required
                                        placeholder="e.g. An official annual event celebrating the founding of the University..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={newEvent.date}
                                            onChange={handleInputChange}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                                        <select
                                            name="event_type"
                                            value={newEvent.event_type}
                                            onChange={handleInputChange}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="academic">academia</option>
                                            <option value="sports">sports</option>
                                            <option value="cultural">cultural</option>
                                            <option value="official">official</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                        <input
                                            type="time"
                                            name="start_time"
                                            value={newEvent.start_time}
                                            onChange={handleInputChange}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                        <input
                                            type="time"
                                            name="end_time"
                                            value={newEvent.end_time}
                                            onChange={handleInputChange}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <input
                                        type="text"
                                        name="event_location"
                                        value={newEvent.event_location}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                        placeholder="e.g. University of Zimbabwe Great Hall"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                                        <input
                                            type="number"
                                            name="latitude"
                                            value={newEvent.latitude}
                                            onChange={handleInputChange}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            step="0.0001"
                                            required
                                            placeholder="e.g. -17.7834"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                                        <input
                                            type="number"
                                            name="longitude"
                                            value={newEvent.longitude}
                                            onChange={handleInputChange}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            step="0.0001"
                                            required
                                            placeholder="e.g. 31.0506"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Allowed Parking Lots</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Innovation Hub', 'uz admin'].map((lot) => (
                                            <div key={lot} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`lot-${lot}`}
                                                    name="allowed_parking_lots"
                                                    value={lot}
                                                    checked={newEvent.allowed_parking_lots.includes(lot)}
                                                    onChange={(e) => {
                                                        const isChecked = e.target.checked;
                                                        setNewEvent(prev => ({
                                                            ...prev,
                                                            allowed_parking_lots: isChecked
                                                                ? [...prev.allowed_parking_lots, lot]
                                                                : prev.allowed_parking_lots.filter(l => l !== lot)
                                                        }));
                                                    }}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor={`lot-${lot}`} className="ml-2 text-sm text-gray-700">
                                                    {lot}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
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
                                onClick={handleCreateEvent}
                            >
                                Create Event
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};