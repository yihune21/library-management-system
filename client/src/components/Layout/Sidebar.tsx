import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BookOpen, 
  Users, 
  BookMarked, 
  Calendar, 
  BarChart3, 
  UserCheck,
  Home
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      label: 'Dashboard',
      path: '/',
      icon: Home,
      roles: ['admin', 'librarian', 'member']
    },
    {
      label: 'Books',
      path: '/books',
      icon: BookOpen,
      roles: ['admin', 'librarian', 'member']
    },
    {
      label: 'Members',
      path: '/members',
      icon: Users,
      roles: ['admin', 'librarian']
    },
    {
      label: 'Loans',
      path: '/loans',
      icon: BookMarked,
      roles: ['admin', 'librarian']
    },
    {
      label: 'Reservations',
      path: '/reservations',
      icon: Calendar,
      roles: ['admin', 'librarian', 'member']
    },
    {
      label: 'Reports',
      path: '/reports',
      icon: BarChart3,
      roles: ['admin', 'librarian']
    },
    {
      label: 'My Profile',
      path: '/profile',
      icon: UserCheck,
      roles: ['admin', 'librarian', 'member']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen">
      <nav className="p-4">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;