import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Link2, Image, GraduationCap, AlertTriangle, LogOut, Shield, Bot, BookOpen, Pencil, Coins } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const { logout, user, setIsPricingOpen } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/scam-detector', label: 'Scam Detector', icon: MessageSquare },
    { to: '/chat-assistant', label: 'AI Security Assistant', icon: Bot },
    { to: '/url-scanner', label: 'URL Scanner', icon: Link2 },
    { to: '/investment-forensics', label: 'Investment Forensics', icon: Coins },
    { to: '/screenshot-scanner', label: 'Screenshot Analyzer', icon: Image },
    { to: '/scam-reports', label: 'Community Reports', icon: AlertTriangle },
    { to: '/education', label: 'Edukasi Siber', icon: BookOpen },
  ];

  if (user?.role === 'admin') {
    navItems.push({ to: '/admin/dashboard', label: 'Admin Panel', icon: Shield });
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 space-x-2">
          <Shield className="h-6 w-6 text-brand-primary" />
          <span className="font-bold text-lg text-slate-900 bg-gradient-to-r from-brand-primary to-blue-500 bg-clip-text text-transparent">
            DectScam AI
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2 flex-grow">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 border ${
                    isActive
                      ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-transparent'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div>
        {/* User Plan Card */}
        {user && (
          <div className="mx-4 p-3 bg-slate-50 border border-slate-100 rounded-2xl mb-2 flex items-center justify-between">
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Paket Anda
              </span>
              <div className="mt-1">
                {(() => {
                  switch (user.subscription_tier?.toLowerCase()) {
                    case 'plus':
                      return (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                          💎 Plus Plan
                        </span>
                      );
                    case 'pro':
                      return (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                          👑 Pro Plan
                        </span>
                      );
                    case 'ultimate':
                      return (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-900 text-amber-400 border border-slate-800">
                          ⚡ Ultimate
                        </span>
                      );
                    default:
                      return (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          Free Plan
                        </span>
                      );
                  }
                })()}
              </div>
            </div>
            {(user.subscription_tier === 'free' || user.subscription_tier === 'plus' || user.subscription_tier === 'pro' || !user.subscription_tier) && (
              <button
                onClick={() => setIsPricingOpen(true)}
                className="text-xs font-bold text-brand-primary hover:text-blue-750 hover:underline shrink-0 ml-2"
              >
                Upgrade
              </button>
            )}
          </div>
        )}

        {/* Logout Footer */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-brand-red hover:bg-brand-red/5 transition-colors duration-150"
          >
            <LogOut className="h-5 w-5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
