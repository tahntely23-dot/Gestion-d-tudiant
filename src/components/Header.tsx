import React, { useState, useRef, useEffect } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Search, Bell, Plus, Check, Trash2, LogOut, User, ChevronDown, Sparkles, Shield, GraduationCap } from 'lucide-react';

interface HeaderProps {
  onOpenAddModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddModal }) => {
  const {
    searchQuery,
    setSearchQuery,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    activeTab,
    currentUser,
    logout,
    setActiveTab,
  } = useSchool();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Tableau de Bord';
      case 'students':
        return 'Gestion des Élèves';
      case 'classes':
        return 'Salles & Classes';
      case 'subjects':
        return 'Matières & Coefficients';
      case 'grades':
        return 'Relevé de Notes';
      case 'attendance':
        return 'Feuille de Présence';
      case 'teachers':
        return 'Corps Enseignant';
      case 'schedule':
        return 'Emploi du Temps';
      case 'report_cards':
        return 'Bulletins & Relevés';
      case 'settings':
        return 'Configuration';
      default:
        return 'Student Management';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 glass-nav">
      {/* Page Title & Search Bar */}
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0f2d30] font-heading">
            {getPageTitle()}
          </h1>
          <p className="text-xs text-[#1597A3] font-medium hidden sm:block">
            Année Académique 2024-2025 • Semestre 2
          </p>
        </div>

        <div className="relative hidden md:block w-72 lg:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher élève, classe, professeur..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white/70 border border-teal-900/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1597A3]/30 focus:border-[#1597A3] transition-all placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full w-4 h-4 flex items-center justify-center"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Right Actions: Quick Add, Notifications, Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          id="btn-quick-add"
          onClick={onOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1597A3] to-[#0f7c86] text-white rounded-xl font-medium text-sm shadow-md shadow-teal-700/20 hover:shadow-teal-700/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Ajouter</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            id="btn-notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl bg-white/80 hover:bg-white text-gray-700 border border-teal-900/10 transition-all shadow-sm cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-card rounded-2xl p-4 shadow-xl border border-white z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-xs bg-teal-100 text-[#1597A3] font-medium rounded-full">
                      {unreadCount} nouvelles
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-xs text-[#1597A3] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <Check className="w-3 h-3" /> Tout marquer lu
                  </button>
                )}
              </div>

              <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-center py-6 text-xs text-gray-400">Aucune notification pour le moment.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`p-3 rounded-xl transition-all cursor-pointer text-left ${
                        n.read ? 'bg-white/40 hover:bg-white/60' : 'bg-teal-50/80 border border-teal-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-gray-900">{n.title}</h4>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">{n.time}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu Popover */}
        <div className="relative border-l border-gray-200 pl-2 sm:pl-3">
          <button
            id="btn-user-profile-menu"
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 p-1 rounded-2xl hover:bg-white/70 transition-all text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-[#1597A3]/30 shadow-xs">
              <img
                src={
                  currentUser?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                }
                alt={currentUser?.name || 'Utilisateur'}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-gray-900 leading-tight">
                {currentUser?.name || 'Administrateur'}
              </p>
              <p className="text-[11px] text-[#1597A3] font-medium">
                {currentUser?.roleLabel || 'Direction Académique'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700 hidden sm:block transition-transform" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 glass-card rounded-2xl p-4 shadow-2xl border border-white z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Profile Card Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <img
                  src={
                    currentUser?.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={currentUser?.name}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-[#1597A3]/30 shadow-xs"
                />
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-gray-900 truncate">{currentUser?.name}</p>
                  <p className="text-[11px] text-gray-500 truncate">{currentUser?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold bg-[#1597A3]/10 text-[#1597A3] rounded-md">
                    {currentUser?.roleLabel}
                  </span>
                </div>
              </div>

              {/* Account details */}
              <div className="py-2.5 text-xs text-gray-600 space-y-1">
                {currentUser?.title && (
                  <p className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">Fonction :</span>
                    <span className="font-semibold text-gray-800">{currentUser.title}</span>
                  </p>
                )}
                {currentUser?.department && (
                  <p className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">Établissement :</span>
                    <span className="font-semibold text-gray-800">{currentUser.department}</span>
                  </p>
                )}
              </div>

              {/* Bottom Logout Button */}
              <div className="pt-3 mt-2 border-t border-gray-100">
                <button
                  id="btn-header-logout"
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

