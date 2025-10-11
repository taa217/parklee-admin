import { Link } from 'react-router-dom';
import { useAuth } from '../authentication/AuthProvider';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  role: string;
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  role,
  activeMenu,
  setActiveMenu,
}) => {
  const adminMenuItems = [
    { id: 'dashboard', icon: 'fa-chart-pie', label: 'Dashboard' },
    { id: 'zones', icon: 'fa-map-marked-alt', label: 'Parking Zones' },
    { id: 'spaces', icon: 'fa-parking', label: 'Parking Spaces' },
    { id: 'reservations', icon: 'fa-calendar-check', label: 'Reservations' },
    { id: 'users', icon: 'fa-user-gear', label: 'Users' },
    { id: 'staff', icon: 'fa-user-tie', label: 'Staff' },
    { id: 'visitors', icon: 'fa-user-clock', label: 'Visitors' },
    { id: 'students', icon: 'fa-user-graduate', label: 'Students' },
    { id: 'events', icon: 'fa-calendar-alt', label: 'Events' },
    { id: 'settings', icon: 'fa-cog', label: 'Settings' },
  ];

  const menuItems = adminMenuItems;
  const { logout } = useAuth();

  const handleLogout = () => {
    console.log('Logout button clicked');
    logout();
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      {/* Top Bar with User Info and Logout Button */}
      <div
        className={`
          bg-white text-gray-700 shadow-xl
          fixed top-0 left-0 right-0 z-50 h-16
          flex items-center justify-between px-6
          ${isSidebarOpen ? 'ml-64' : 'ml-20'}
          transition-all duration-300
        `}
      >
        <div className="flex items-center space-x-4">
          {/* You can add a page title here if needed */}
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex flex-col text-right">
            <span className="text-sm font-semibold text-gray-900">Admin</span>
            <span className="text-xs text-gray-500">{currentDate}</span>
          </div>
          <div className="flex-shrink-0">
            <i className="fas fa-user-circle text-2xl text-gray-600"></i>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-full transition-colors duration-200"
          >
            <i className="fas fa-sign-out-alt mr-2"></i>
            Log out
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`
          bg-white text-gray-700 shadow-2xl transition-all duration-300
          fixed inset-y-0 left-0 z-40 flex flex-col h-screen
          ${isSidebarOpen ? 'w-64' : 'w-20'}
        `}
      >
        <div className="h-20 flex items-center justify-between px-4 border-b border-gray-200">
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 no-underline"
            onClick={() => setActiveMenu('dashboard')}
          >
            {isSidebarOpen && (
              <span className="text-2xl font-extrabold text-gray-900 whitespace-nowrap overflow-hidden">
                Park<span className="text-gray-500">lee</span>
              </span>
            )}
          </Link>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-2 rounded-md hover:bg-gray-100"
          >
            <i className={`fas ${isSidebarOpen ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 custom-scrollbar">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={`/${item.id}`}
              onClick={() => setActiveMenu(item.id)}
              className={`
                w-full flex items-center px-6 py-3 cursor-pointer transition-colors duration-200
                ${activeMenu === item.id
                  ? 'bg-gray-100 text-gray-900 font-medium border-l-4 border-gray-400'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
                ${!isSidebarOpen && 'justify-center'}
              `}
            >
              <i className={`fas ${item.icon} text-lg`}></i>
              {isSidebarOpen && <span className="ml-4 truncate">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Removed logout button from the sidebar footer */}
      </div>
    </>
  );
};