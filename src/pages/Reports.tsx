import React, { useState, useEffect } from 'react';
import * as echarts from 'echarts';
import { saveAs } from 'file-saver';
import { CSVLink } from 'react-csv';
import { PDFDownloadLink } from '@react-pdf/renderer';

interface ReportData {
    id: string;
    title: string;
    type: 'daily' | 'weekly' | 'monthly' | 'annual' | 'custom';
    dateRange: string;
    generatedAt: Date;
    metrics: {
        totalParkingSpots: number;
        averageOccupancy: number;
        peakHours: string;
        reservationRate: number;
        cancellationRate: number;
        revenue: number;
    };
}

export const ReportsDashboard: React.FC = () => {
    // Mock reports data
    const mockReports: ReportData[] = [
        {
            id: 'rep-2023-11',
            title: 'November 2023 Monthly Report',
            type: 'monthly',
            dateRange: 'Nov 1 - Nov 30, 2023',
            generatedAt: new Date(2023, 11, 1),
            metrics: {
                totalParkingSpots: 1250,
                averageOccupancy: 72,
                peakHours: '8-10 AM, 4-6 PM',
                reservationRate: 65,
                cancellationRate: 12,
                revenue: 28450
            }
        },
        {
            id: 'rep-2023-wk48',
            title: 'Week 48 Weekly Report',
            type: 'weekly',
            dateRange: 'Nov 27 - Dec 3, 2023',
            generatedAt: new Date(2023, 10, 27),
            metrics: {
                totalParkingSpots: 1250,
                averageOccupancy: 68,
                peakHours: '8-9 AM, 5-6 PM',
                reservationRate: 58,
                cancellationRate: 15,
                revenue: 6250
            }
        },
        {
            id: 'rep-2023-11-15',
            title: 'Daily Report - Nov 15, 2023',
            type: 'daily',
            dateRange: 'Nov 15, 2023',
            generatedAt: new Date(2023, 10, 15),
            metrics: {
                totalParkingSpots: 1250,
                averageOccupancy: 82,
                peakHours: '8:30-9:30 AM',
                reservationRate: 72,
                cancellationRate: 8,
                revenue: 2150
            }
        },
        {
            id: 'rep-fy2023',
            title: 'Annual Report FY2023',
            type: 'annual',
            dateRange: 'Jan 1 - Dec 31, 2023',
            generatedAt: new Date(2023, 11, 31),
            metrics: {
                totalParkingSpots: 1250,
                averageOccupancy: 65,
                peakHours: '8-10 AM',
                reservationRate: 60,
                cancellationRate: 10,
                revenue: 285600
            }
        }
    ];

    const [reports, setReports] = useState<ReportData[]>(mockReports);
    const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 7)),
        end: new Date()
    });
    const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'annual' | 'custom'>('weekly');
    const [isGenerating, setIsGenerating] = useState(false);

    // Initialize charts
    useEffect(() => {
        const initCharts = () => {
            // Occupancy Trend Chart
            const occupancyChart = echarts.init(document.getElementById('occupancyTrendChart'));

            // Revenue Analysis Chart
            const revenueChart = echarts.init(document.getElementById('revenueAnalysisChart'));

            // Reservation Metrics Chart
            const metricsChart = echarts.init(document.getElementById('reservationMetricsChart'));

            // Occupancy Trend Options
            const occupancyOptions = {
                title: {
                    text: 'Occupancy Trend (Last 30 Days)',
                    left: 'center',
                    textStyle: { fontSize: 14 }
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: ['Occupancy Rate', 'Reservation Rate'],
                    bottom: 0
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '15%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: Array.from({ length: 30 }, (_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() - 30 + i);
                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    })
                },
                yAxis: {
                    type: 'value',
                    name: 'Percentage',
                    axisLabel: {
                        formatter: '{value}%'
                    },
                    max: 100
                },
                series: [
                    {
                        name: 'Occupancy Rate',
                        type: 'line',
                        smooth: true,
                        data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 30) + 50),
                        lineStyle: { width: 3 },
                        itemStyle: { color: '#3B82F6' }
                    },
                    {
                        name: 'Reservation Rate',
                        type: 'line',
                        smooth: true,
                        data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 20) + 40),
                        lineStyle: { width: 3 },
                        itemStyle: { color: '#10B981' }
                    }
                ]
            };

            // Revenue Analysis Options
            const revenueOptions = {
                title: {
                    text: 'Revenue Analysis by Month (2023)',
                    left: 'center',
                    textStyle: { fontSize: 14 }
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    },
                    formatter: 'Revenue: <b>${c0}</b>'
                },
                xAxis: {
                    type: 'category',
                    data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                },
                yAxis: {
                    type: 'value',
                    name: 'Revenue ($)'
                },
                series: [
                    {
                        name: 'Revenue',
                        type: 'bar',
                        data: Array.from({ length: 12 }, () => Math.floor(Math.random() * 5000) + 20000),
                        itemStyle: {
                            color: function (params: any) {
                                const colors = [
                                    '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE',
                                    '#10B981', '#34D399', '#6EE7B7', '#A7F3D0',
                                    '#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A'
                                ];
                                return colors[params.dataIndex];
                            },
                            borderRadius: [4, 4, 0, 0]
                        }
                    }
                ]
            };

            // Metrics Chart Options
            const metricsOptions = {
                title: {
                    text: 'Reservation Metrics',
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
                    data: ['Completed', 'No-Shows', 'Cancelled', 'Active Reservations']
                },
                series: [
                    {
                        name: 'Reservation Metrics',
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
                            { value: 65, name: 'Completed', itemStyle: { color: '#10B981' } },
                            { value: 15, name: 'No-Shows', itemStyle: { color: '#F59E0B' } },
                            { value: 12, name: 'Cancelled', itemStyle: { color: '#EF4444' } },
                            { value: 8, name: 'Active Reservations', itemStyle: { color: '#3B82F6' } }
                        ]
                    }
                ]
            };

            occupancyChart.setOption(occupancyOptions);
            revenueChart.setOption(revenueOptions);
            metricsChart.setOption(metricsOptions);

            return () => {
                occupancyChart.dispose();
                revenueChart.dispose();
                metricsChart.dispose();
            };
        };

        initCharts();
    }, []);

    const generateReport = () => {
        setIsGenerating(true);

        // Simulate report generation
        setTimeout(() => {
            const newReport: ReportData = {
                id: `rep-${Date.now()}`,
                title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${dateRange.start.toLocaleDateString()} to ${dateRange.end.toLocaleDateString()}`,
                type: reportType,
                dateRange: `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`,
                generatedAt: new Date(),
                metrics: {
                    totalParkingSpots: 1250,
                    averageOccupancy: Math.floor(Math.random() * 30) + 50,
                    peakHours: `${Math.floor(Math.random() * 3) + 8}-${Math.floor(Math.random() * 3) + 9} AM, ${Math.floor(Math.random() * 3) + 4}-${Math.floor(Math.random() * 3) + 5} PM`,
                    reservationRate: Math.floor(Math.random() * 30) + 50,
                    cancellationRate: Math.floor(Math.random() * 10) + 5,
                    revenue: Math.floor(Math.random() * 10000) + 15000
                }
            };

            setReports([newReport, ...reports]);
            setSelectedReport(newReport);
            setIsGenerating(false);
        }, 1500);
    };

    const exportToCSV = () => {
        const csvData = [
            ['Metric', 'Value'],
            ['Total Parking Spots', selectedReport?.metrics.totalParkingSpots],
            ['Average Occupancy', `${selectedReport?.metrics.averageOccupancy}%`],
            ['Peak Hours', selectedReport?.metrics.peakHours],
            ['Reservation Rate', `${selectedReport?.metrics.reservationRate}%`],
            ['Cancellation Rate', `${selectedReport?.metrics.cancellationRate}%`],
            ['Revenue', `$${selectedReport?.metrics.revenue.toLocaleString()}`]
        ];

        return csvData;
    };

    const exportToJSON = () => {
        const jsonData = JSON.stringify(selectedReport, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        saveAs(blob, `report-${selectedReport?.id}.json`);
    };

    return (
        <div className="space-y-6">
            {/* Report Generator */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Generate New Report</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value as any)}
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="annual">Annual</option>
                            <option value="custom">Custom Range</option>
                        </select>
                    </div>

                    {reportType === 'custom' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={dateRange.start.toISOString().split('T')[0]}
                                    onChange={(e) => setDateRange({ ...dateRange, start: new Date(e.target.value) })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input
                                    type="date"
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={dateRange.end.toISOString().split('T')[0]}
                                    onChange={(e) => setDateRange({ ...dateRange, end: new Date(e.target.value) })}
                                />
                            </div>
                        </>
                    )}

                    <div className="flex items-end">
                        <button
                            className={`w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${isGenerating ? 'opacity-75 cursor-not-allowed' : ''}`}
                            onClick={generateReport}
                            disabled={isGenerating}
                        >
                            {isGenerating ? (
                                <>
                                    <i className="fas fa-spinner fa-spin mr-2"></i>
                                    Generating...
                                </>
                            ) : (
                                'Generate Report'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="occupancyTrendChart" style={{ height: '300px' }}></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="revenueAnalysisChart" style={{ height: '300px' }}></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div id="reservationMetricsChart" style={{ height: '300px' }}></div>
                </div>
            </div>

            {/* Generated Reports */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">Generated Reports</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated At</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reports.map(report => (
                                <tr key={report.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{report.title}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${report.type === 'daily' ? 'bg-blue-100 text-blue-800' :
                                                report.type === 'weekly' ? 'bg-green-100 text-green-800' :
                                                    report.type === 'monthly' ? 'bg-purple-100 text-purple-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {report.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {report.dateRange}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {report.generatedAt.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                            onClick={() => setSelectedReport(report)}
                                        >
                                            View
                                        </button>
                                        <button className="text-gray-600 hover:text-gray-900">
                                            Share
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Report Detail Modal */}
            {selectedReport && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {selectedReport.title}
                                </h3>
                                <button
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={() => setSelectedReport(null)}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-3">Report Details</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Report ID:</span>
                                            <span className="font-mono">{selectedReport.id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Type:</span>
                                            <span className="capitalize">{selectedReport.type}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Date Range:</span>
                                            <span>{selectedReport.dateRange}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Generated At:</span>
                                            <span>{selectedReport.generatedAt.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-3">Key Metrics</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white p-3 rounded shadow-sm">
                                            <div className="text-sm text-gray-500">Avg. Occupancy</div>
                                            <div className="text-2xl font-bold text-blue-600">
                                                {selectedReport.metrics.averageOccupancy}%
                                            </div>
                                        </div>
                                        <div className="bg-white p-3 rounded shadow-sm">
                                            <div className="text-sm text-gray-500">Reservation Rate</div>
                                            <div className="text-2xl font-bold text-green-600">
                                                {selectedReport.metrics.reservationRate}%
                                            </div>
                                        </div>
                                        <div className="bg-white p-3 rounded shadow-sm">
                                            <div className="text-sm text-gray-500">Cancellation Rate</div>
                                            <div className="text-2xl font-bold text-red-600">
                                                {selectedReport.metrics.cancellationRate}%
                                            </div>
                                        </div>
                                        <div className="bg-white p-3 rounded shadow-sm">
                                            <div className="text-sm text-gray-500">Revenue</div>
                                            <div className="text-2xl font-bold text-purple-600">
                                                ${selectedReport.metrics.revenue.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h4 className="font-medium text-gray-900 mb-3">Peak Hours</h4>
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    {selectedReport.metrics.peakHours}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">Occupancy Trend</h4>
                                    <div className="bg-white p-4 rounded-lg border border-gray-200 h-64">
                                        {/* Mini chart would go here */}
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            <i className="fas fa-chart-line text-4xl"></i>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">Revenue Breakdown</h4>
                                    <div className="bg-white p-4 rounded-lg border border-gray-200 h-64">
                                        {/* Mini chart would go here */}
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            <i className="fas fa-chart-pie text-4xl"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-6">
                                <h4 className="font-medium text-gray-900 mb-3">Export Options</h4>
                                <div className="flex flex-wrap gap-3">
                                    <CSVLink
                                        data={exportToCSV()}
                                        filename={`report-${selectedReport.id}.csv`}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                    >
                                        <i className="fas fa-file-csv mr-2"></i> Export to CSV
                                    </CSVLink>

                                    <button
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        onClick={exportToJSON}
                                    >
                                        <i className="fas fa-file-code mr-2"></i> Export to JSON
                                    </button>

                                    {/* <PDFDownloadLink
                                        document={</>}
                                        fileName={`report-${selectedReport.id}.pdf`}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                    >
                                        {({ loading }: { loading: boolean }) => (
                                            loading ? (
                                                <span>Loading PDF...</span>
                                            ) : (
                                                <span><i className="fas fa-file-pdf mr-2"></i> Export to PDF</span>
                                            )
                                        )}

                                    </PDFDownloadLink> */}

                                    <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                                        <i className="fas fa-envelope mr-2"></i> Email Report
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};