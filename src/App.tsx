// src/App.tsx

import React, { useState } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import Login from './authentication/login';
import SignUp from './authentication/signUp';
import Verification from './authentication/Verification';
import { AuthProvider } from './authentication/AuthProvider';
import ProtectedRoute from './authentication/RouteProtector';
import { useAuth } from './authentication/AuthProvider';
import { AdminDashboard } from './pages/AdminDashboard';
import UserManagement from './pages/userManagement';
import { ParkingZonesDashboard } from './pages/ParkingZones';
import { ParkingSpacesDashboard } from './pages/ParkingSpace';
import { ReservationsDashboard } from './pages/Reservations';
import { EventsDashboard } from './pages/Events';
import { ReportsDashboard } from './pages/Reports';
import { SettingsDashboard } from './pages/Settings';
import { StudentsDashboard } from './pages/Students';
import { VisitorsDashboard } from './pages/Visitors';
import { StaffDashboard } from './pages/Staffs';
import { ParkingSystemUsersDashboard } from './pages/Users';

// New component for the protected layout
const ProtectedLayout: React.FC = () => {
  const { userRole } = useAuth(); // Now this is inside the AuthProvider context
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar inside the protected route */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        role={userRole || 'none'}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />

      {/* THIS IS THE DIV WHERE THE FIX IS APPLIED */}
      <div
        className={`
          flex-1 flex flex-col // Existing classes
          transition-all duration-300 ease-in-out // Added for smooth margin transition
          ${isSidebarOpen ? 'ml-64' : 'ml-20'} // CRITICAL FIX: Dynamic left margin
          overflow-auto // Existing class
        `}
      >
        <header className="bg-white shadow-sm">
          <div className="h-20 px-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-800">
              {/* Add current page name */}
            </h1>
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verification" element={<Verification />} />
        {/* Protected Routes */}
        <Route path="/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout /> {/* Use the new ProtectedLayout component */}
            </ProtectedRoute>
          }
        >
          {/* Nested Routes (relative paths) */}
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<ParkingSystemUsersDashboard />} />
          <Route path="zones" element={<ParkingZonesDashboard />} />
          <Route path="spaces" element={<ParkingSpacesDashboard />} />
          <Route path="reservations" element={<ReservationsDashboard />} />
          <Route path="events" element={<EventsDashboard />} />
          <Route path="reports" element={<ReportsDashboard/>} />
          <Route path="visitors" element={<VisitorsDashboard />} />
          <Route path="students" element={<StudentsDashboard />} />
          <Route path="staff" element={<StaffDashboard />} />
          <Route path="settings" element={<SettingsDashboard />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default App;