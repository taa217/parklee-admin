import React, { useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

export const SettingsDashboard: React.FC = () => {
    // System Settings State
    const [systemSettings, setSystemSettings] = useState({
        systemName: 'Campus Parking Management',
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        maxReservationDuration: 24,
        reservationAdvanceDays: 30,
        allowOverbooking: false,
        maintenanceMode: false
    });

    // Parking Configuration State
    const [parkingConfig, setParkingConfig] = useState({
        totalSpots: 1250,
        studentSpots: 800,
        staffSpots: 300,
        visitorSpots: 100,
        disabledSpots: 50,
        studentHourlyRate: 1.5,
        staffHourlyRate: 1.0,
        visitorHourlyRate: 2.0,
        dailyMaxCharge: 15,
        gracePeriod: 15,
        overnightParkingAllowed: false
    });

    // Notification Settings State
    const [notificationSettings, setNotificationSettings] = useState({
        reservationConfirmation: true,
        reservationReminder: true,
        reservationCancellation: true,
        parkingViolation: true,
        systemMaintenance: true,
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        reminderTimeBefore: 1 // hours
    });

    // User Permissions State
    const [userPermissions, setUserPermissions] = useState({
        studentReservationLimit: 1,
        staffReservationLimit: 2,
        visitorReservationLimit: 1,
        allowStudentOvernight: false,
        allowStaffOvernight: true,
        allowVisitorOvernight: false,
        studentMaxDuration: 8, // hours
        staffMaxDuration: 24, // hours
        visitorMaxDuration: 12 // hours
    });

    // Integration Settings State
    const [integrationSettings, setIntegrationSettings] = useState({
        paymentGateway: 'stripe',
        calendarIntegration: true,
        calendarService: 'google',
        mapService: 'google',
        analyticsEnabled: true,
        weatherIntegration: true,
        licensePlateRecognition: false
    });

    // Security Settings State
    const [securitySettings, setSecuritySettings] = useState({
        requirePasswordChange: 90, // days
        failedAttemptsLock: 5,
        lockoutDuration: 30, // minutes
        twoFactorAuth: false,
        sessionTimeout: 30, // minutes
        passwordComplexity: 'medium',
        ipRestrictions: false
    });

    // Handle form changes
    const handleSystemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

        setSystemSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleParkingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        const checked = type === 'checkbox' ? e.target.checked : undefined;
        const parsedValue = type === 'number' ? parseFloat(value) : value;

        setParkingConfig(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : parsedValue
        }));
    };

    const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        const checked = type === 'checkbox' ? e.target.checked : undefined;
        const parsedValue = type === 'number' ? parseFloat(value) : value;

        setNotificationSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : parsedValue
        }));
    };

    const handlePermissionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserPermissions(prev => ({
            ...prev,
            [name]: parseFloat(value)
        }));
    };

    const handleIntegrationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

        setIntegrationSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
        const parsedValue = type === 'number' ? parseFloat(value) : value;

        setSecuritySettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : parsedValue
        }));
    };

    // Save settings
    const saveSettings = (section: string) => {
        console.log(`Saving ${section} settings...`);
        // In a real app, you would call an API here
        alert(`${section} settings saved successfully!`);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <Tabs>
                <TabList className="flex border-b border-gray-200">
                    <Tab className="px-4 py-2 font-medium text-sm cursor-pointer focus:outline-none border-b-2 border-transparent ui-selected:border-blue-500 ui-selected:text-blue-600">
                        System
                    </Tab>
                    <Tab className="px-4 py-2 font-medium text-sm cursor-pointer focus:outline-none border-b-2 border-transparent ui-selected:border-blue-500 ui-selected:text-blue-600">
                        Parking Config
                    </Tab>
                    <Tab className="px-4 py-2 font-medium text-sm cursor-pointer focus:outline-none border-b-2 border-transparent ui-selected:border-blue-500 ui-selected:text-blue-600">
                        Notifications
                    </Tab>
                    <Tab className="px-4 py-2 font-medium text-sm cursor-pointer focus:outline-none border-b-2 border-transparent ui-selected:border-blue-500 ui-selected:text-blue-600">
                        User Permissions
                    </Tab>
                    <Tab className="px-4 py-2 font-medium text-sm cursor-pointer focus:outline-none border-b-2 border-transparent ui-selected:border-blue-500 ui-selected:text-blue-600">
                        Integrations
                    </Tab>
                    <Tab className="px-4 py-2 font-medium text-sm cursor-pointer focus:outline-none border-b-2 border-transparent ui-selected:border-blue-500 ui-selected:text-blue-600">
                        Security
                    </Tab>
                </TabList>

                {/* System Settings Tab */}
                <TabPanel>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">System Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">System Name</label>
                                <input
                                    type="text"
                                    name="systemName"
                                    value={systemSettings.systemName}
                                    onChange={handleSystemChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                                <select
                                    name="timezone"
                                    value={systemSettings.timezone}
                                    onChange={handleSystemChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="America/New_York">Eastern Time (ET)</option>
                                    <option value="America/Chicago">Central Time (CT)</option>
                                    <option value="America/Denver">Mountain Time (MT)</option>
                                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
                                <select
                                    name="dateFormat"
                                    value={systemSettings.dateFormat}
                                    onChange={handleSystemChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time Format</label>
                                <select
                                    name="timeFormat"
                                    value={systemSettings.timeFormat}
                                    onChange={handleSystemChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="12h">12-hour</option>
                                    <option value="24h">24-hour</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Reservation Duration (hours)</label>
                                <input
                                    type="number"
                                    name="maxReservationDuration"
                                    value={systemSettings.maxReservationDuration}
                                    onChange={handleSystemChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    min="1"
                                    max="72"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reservation Advance Days</label>
                                <input
                                    type="number"
                                    name="reservationAdvanceDays"
                                    value={systemSettings.reservationAdvanceDays}
                                    onChange={handleSystemChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    min="1"
                                    max="365"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="allowOverbooking"
                                    checked={systemSettings.allowOverbooking}
                                    onChange={handleSystemChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700">Allow overbooking</label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="maintenanceMode"
                                    checked={systemSettings.maintenanceMode}
                                    onChange={handleSystemChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700">Maintenance mode</label>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={() => saveSettings('system')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Save System Settings
                            </button>
                        </div>
                    </div>
                </TabPanel>

                {/* Parking Configuration Tab */}
                <TabPanel>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Parking Configuration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Total Parking Spots</label>
                                <input
                                    type="number"
                                    name="totalSpots"
                                    value={parkingConfig.totalSpots}
                                    onChange={handleParkingChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    min="1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Student Spots</label>
                                <input
                                    type="number"
                                    name="studentSpots"
                                    value={parkingConfig.studentSpots}
                                    onChange={handleParkingChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Staff Spots</label>
                                <input
                                    type="number"
                                    name="staffSpots"
                                    value={parkingConfig.staffSpots}
                                    onChange={handleParkingChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Visitor Spots</label>
                                <input
                                    type="number"
                                    name="visitorSpots"
                                    value={parkingConfig.visitorSpots}
                                    onChange={handleParkingChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Disabled Spots</label>
                                <input
                                    type="number"
                                    name="disabledSpots"
                                    value={parkingConfig.disabledSpots}
                                    onChange={handleParkingChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Student Hourly Rate ($)</label>
                                <input
                                    type="number"
                                    name="studentHourlyRate"
                                    value={parkingConfig.studentHourlyRate}
                                    onChange={handleParkingChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    min="0"
                                    step="0.1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Staff Hourly Rate ($)</label>
                                <input
                                    type="number"
                                    name="staffHourlyRate"
                                    value={parkingConfig.staffHourlyRate}
                                    onChange={handleParkingChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    min="0"
                                    step="0.1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Visitor Hourly Rate ($)</label>
                                <input
                                    type="number"
                                    name="visitorHourlyRate"
                                    value={parkingConfig.visitorHourlyRate}
                                    onChange={handleParkingChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    min="0"
                                    step="0.1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Daily Max Charge ($)</label>
                                <input
                                    type="number"
                                    name="dailyMaxCharge"
                                    value={parkingConfig.dailyMaxCharge}
                                    onChange={handleParkingChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Grace Period (minutes)</label>
                                <input
                                    type="number"
                                    name="gracePeriod"
                                    value={parkingConfig.gracePeriod}
                                    onChange={handleParkingChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    min="0"
                                    max="60"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="overnightParkingAllowed"
                                    checked={parkingConfig.overnightParkingAllowed}
                                    onChange={handleParkingChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700">Allow overnight parking</label>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={() => saveSettings('parking configuration')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Save Parking Configuration
                            </button>
                        </div>
                    </div>
                </TabPanel>

                {/* Notification Settings Tab */}
                <TabPanel>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <h4 className="font-medium text-gray-900 mb-3">Notification Types</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="reservationConfirmation"
                                            checked={notificationSettings.reservationConfirmation}
                                            onChange={handleNotificationChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 block text-sm text-gray-700">Reservation confirmations</label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="reservationReminder"
                                            checked={notificationSettings.reservationReminder}
                                            onChange={handleNotificationChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 block text-sm text-gray-700">Reservation reminders</label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="reservationCancellation"
                                            checked={notificationSettings.reservationCancellation}
                                            onChange={handleNotificationChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 block text-sm text-gray-700">Reservation cancellations</label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="parkingViolation"
                                            checked={notificationSettings.parkingViolation}
                                            onChange={handleNotificationChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 block text-sm text-gray-700">Parking violations</label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="systemMaintenance"
                                            checked={notificationSettings.systemMaintenance}
                                            onChange={handleNotificationChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 block text-sm text-gray-700">System maintenance alerts</label>
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <h4 className="font-medium text-gray-900 mb-3">Delivery Methods</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="emailNotifications"
                                            checked={notificationSettings.emailNotifications}
                                            onChange={handleNotificationChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 block text-sm text-gray-700">Email notifications</label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="smsNotifications"
                                            checked={notificationSettings.smsNotifications}
                                            onChange={handleNotificationChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 block text-sm text-gray-700">SMS notifications</label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="pushNotifications"
                                            checked={notificationSettings.pushNotifications}
                                            onChange={handleNotificationChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 block text-sm text-gray-700">Push notifications</label>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reminder time before reservation (hours)</label>
                                <input
                                    type="number"
                                    name="reminderTimeBefore"
                                    value={notificationSettings.reminderTimeBefore}
                                    onChange={handleNotificationChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    min="1"
                                    max="24"
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={() => saveSettings('notification')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Save Notification Settings
                            </button>
                        </div>
                    </div>
                </TabPanel>

                {/* User Permissions Tab */}
                <TabPanel>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">User Permissions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Student reservation limit</label>
                                <input
                                    type="number"
                                    name="studentReservationLimit"
                                    value={userPermissions.studentReservationLimit}
                                    onChange={handlePermissionsChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Staff reservation limit</label>
                                <input
                                    type="number"
                                    name="staffReservationLimit"
                                    value={userPermissions.staffReservationLimit}
                                    onChange={handlePermissionsChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Visitor reservation limit</label>
                                <input
                                    type="number"
                                    name="visitorReservationLimit"
                                    value={userPermissions.visitorReservationLimit}
                                    onChange={handlePermissionsChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Student max duration (hours)</label>
                                <input
                                    type="number"
                                    name="studentMaxDuration"
                                    value={userPermissions.studentMaxDuration}
                                    onChange={handlePermissionsChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    min="1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Staff max duration (hours)</label>
                                <input
                                    type="number"
                                    name="staffMaxDuration"
                                    value={userPermissions.staffMaxDuration}
                                    onChange={handlePermissionsChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    min="1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Visitor max duration (hours)</label>
                                <input
                                    type="number"
                                    name="visitorMaxDuration"
                                    value={userPermissions.visitorMaxDuration}
                                    onChange={handlePermissionsChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    min="1"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="allowStudentOvernight"
                                    checked={userPermissions.allowStudentOvernight}
                                    onChange={(e) => setUserPermissions({ ...userPermissions, allowStudentOvernight: e.target.checked })}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700">Allow student overnight parking</label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="allowStaffOvernight"
                                    checked={userPermissions.allowStaffOvernight}
                                    onChange={(e) => setUserPermissions({ ...userPermissions, allowStaffOvernight: e.target.checked })}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700">Allow staff overnight parking</label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="allowVisitorOvernight"
                                    checked={userPermissions.allowVisitorOvernight}
                                    onChange={(e) => setUserPermissions({ ...userPermissions, allowVisitorOvernight: e.target.checked })}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700">Allow visitor overnight parking</label>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={() => saveSettings('user permissions')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Save User Permissions
                            </button>
                        </div>
                    </div>
                </TabPanel>

                {/* Integrations Tab */}
                <TabPanel>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Integration Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Gateway</label>
                                <select
                                    name="paymentGateway"
                                    value={integrationSettings.paymentGateway}
                                    onChange={handleIntegrationChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="stripe">Stripe</option>
                                    <option value="paypal">PayPal</option>
                                    <option value="square">Square</option>
                                    <option value="none">None</option>
                                </select>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="calendarIntegration"
                                    checked={integrationSettings.calendarIntegration}
                                    onChange={handleIntegrationChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700">Enable calendar integration</label>
                            </div>

                            {integrationSettings.calendarIntegration && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Calendar Service</label>
                                    <select
                                        name="calendarService"
                                        value={integrationSettings.calendarService}
                                        onChange={handleIntegrationChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="google">Google Calendar</option>
                                        <option value="outlook">Microsoft Outlook</option>
                                        <option value="apple">Apple Calendar</option>
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Map Service</label>
                                <select
                                    name="mapService"
                                    value={integrationSettings.mapService}
                                    onChange={handleIntegrationChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="google">Google Maps</option>
                                    <option value="mapbox">Mapbox</option>
                                    <option value="openstreet">OpenStreetMap</option>
                                </select>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="analyticsEnabled"
                                    checked={integrationSettings.analyticsEnabled}
                                    onChange={handleIntegrationChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700">Enable analytics</label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="weatherIntegration"
                                    checked={integrationSettings.weatherIntegration}
                                    onChange={handleIntegrationChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700">Enable weather integration</label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="licensePlateRecognition"
                                    checked={integrationSettings.licensePlateRecognition}
                                    onChange={handleIntegrationChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700">Enable license plate recognition</label>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={() => saveSettings('integration')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Save Integration Settings
                            </button>
                        </div>
                    </div>
                </TabPanel>

                {/* Security Settings Tab */}
                <TabPanel>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Security Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Require password change (days)</label>
                                <input
                                    type="number"
                                    name="requirePasswordChange"
                                    value={securitySettings.requirePasswordChange}
                                    onChange={handleSecurityChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    min="0"
                                />
                                <p className="mt-1 text-xs text-gray-500">0 = never require change</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Failed login attempts before lock</label>
                                <input
                                    type="number"
                                    name="failedAttemptsLock"
                                    value={securitySettings.failedAttemptsLock}
                                    onChange={handleSecurityChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    min="1"
                                    max="10"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lockout duration (minutes)</label>
                                <input
                                    type="number"
                                    name="lockoutDuration"
                                    value={securitySettings.lockoutDuration}
                                    onChange={handleSecurityChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    min="1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Session timeout (minutes)</label>
                                <input
                                    type="number"
                                    name="sessionTimeout"
                                    value={securitySettings.sessionTimeout}
                                    onChange={handleSecurityChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    min="1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password complexity</label>
                                <select
                                    name="passwordComplexity"
                                    value={securitySettings.passwordComplexity}
                                    onChange={handleSecurityChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="low">Low (6+ characters)</option>
                                    <option value="medium">Medium (8+ chars with mix of letters and numbers)</option>
                                    <option value="high">High (10+ chars with uppercase, lowercase, numbers, and symbols)</option>
                                </select>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="twoFactorAuth"
                                    checked={securitySettings.twoFactorAuth}
                                    onChange={handleSecurityChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700">Require two-factor authentication</label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="ipRestrictions"
                                    checked={securitySettings.ipRestrictions}
                                    onChange={handleSecurityChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700">Enable IP restrictions</label>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={() => saveSettings('security')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Save Security Settings
                            </button>
                        </div>
                    </div>
                </TabPanel>
            </Tabs>
        </div>
    );
};