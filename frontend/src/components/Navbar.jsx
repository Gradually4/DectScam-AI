import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Bell, CheckCircle, AlertTriangle, AlertCircle, Clock, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

export default function Navbar({ title }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userName = user?.name || 'User';
  const userRole = user?.role || 'user';

  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    const saved = localStorage.getItem('read_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const dropdownRef = useRef(null);

  const getProfilePhotoUrl = () => {
    if (!user?.profile_photo_path) return null;
    if (user.profile_photo_path.startsWith('http')) return user.profile_photo_path;
    
    const apiBase = api.defaults.baseURL || 'http://localhost:8000';
    const base = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
    
    return `${base}/storage/${user.profile_photo_path}`;
  };

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      let finalNotifications = [];

      // If user is Admin, fetch pending reports for moderation
      if (user.role === 'admin') {
        const response = await api.get('/api/v1/reports?status=pending&limit=5');
        if (response.data?.status === 'success') {
          const reports = response.data.data;
          const reportNotifications = reports.map(report => ({
            id: `report-${report.id}`,
            title: 'Moderasi Laporan Baru',
            message: `Laporan "${report.title}" oleh ${report.user_name} perlu persetujuan.`,
            type: 'warning',
            time: report.created_at,
            link: '/scam-reports'
          }));
          finalNotifications = [...finalNotifications, ...reportNotifications];
        }
      }

      // Default system/educational notifications
      const systemNotifications = [
        {
          id: 'sys-welcome',
          title: 'Selamat Datang!',
          message: user.role === 'admin' 
            ? 'Selamat datang di panel kontrol admin FraudGuard AI.' 
            : 'FraudGuard AI siap melindungi Anda dari ancaman penipuan digital.',
          type: 'success',
          time: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
        },
        {
          id: 'sys-tips',
          title: 'Tips Keamanan',
          message: 'Jangan pernah mengeklik tautan atau mengunduh file .APK dari nomor tidak dikenal.',
          type: 'info',
          time: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
        }
      ];

      finalNotifications = [...finalNotifications, ...systemNotifications];
      setNotifications(finalNotifications);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds to fetch new reports for admin
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadNotifications = notifications.filter(n => !readIds.includes(n.id));
  const unreadCount = unreadNotifications.length;

  const handleMarkAsRead = (id) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      setReadIds(updated);
      localStorage.setItem('read_notifications', JSON.stringify(updated));
    }
  };

  const handleMarkAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadIds(allIds);
    localStorage.setItem('read_notifications', JSON.stringify(allIds));
  };

  const handleNotificationClick = (notification) => {
    handleMarkAsRead(notification.id);
    setIsOpen(false);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const formatRelativeTime = (isoDate) => {
    if (!isoDate) return '-';
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins}m lalu`;
    if (diffHrs < 24) return `${diffHrs}j lalu`;
    return `${diffDays}h lalu`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-brand-green flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-brand-yellow flex-shrink-0" />;
      case 'info':
      default:
        return <AlertCircle className="h-5 w-5 text-brand-primary flex-shrink-0" />;
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
      <h2 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h2>
      
      <div className="flex items-center space-x-4">
        {/* Notifications Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors duration-150 relative cursor-pointer"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-red rounded-full animate-pulse" />
            )}
          </button>

          {/* Dropdown Panel */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Header */}
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">Notifikasi</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllAsRead}
                    className="text-[11px] font-bold text-brand-primary hover:text-brand-hover flex items-center space-x-1 cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Tandai semua dibaca</span>
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                    Tidak ada notifikasi.
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const isRead = readIds.includes(notification.id);
                    return (
                      <div 
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 flex items-start space-x-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                          !isRead ? 'bg-blue-50/20' : ''
                        }`}
                      >
                        {getNotificationIcon(notification.type)}
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-xs font-bold truncate pr-2 ${!isRead ? 'text-slate-800' : 'text-slate-600'}`}>
                              {notification.title}
                            </p>
                            <span className="text-[10px] text-slate-400 font-semibold flex items-center flex-shrink-0">
                              <Clock className="h-2.5 w-2.5 mr-1" />
                              {formatRelativeTime(notification.time)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                        {!isRead && (
                          <span className="w-1.5 h-1.5 bg-brand-primary rounded-full mt-1.5 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <Link to="/profile" className="flex items-center space-x-3 border-l border-slate-200 pl-4 hover:opacity-85 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20 overflow-hidden shrink-0">
            {user?.profile_photo_path ? (
              <img
                src={getProfilePhotoUrl()}
                alt={userName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-4 w-4" />
            )}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">{userName}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{userRole} Role</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
