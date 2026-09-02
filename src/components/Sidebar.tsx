import React from 'react';
import { useSchool } from '../context/SchoolContext';
import { ViewTab } from '../types';
import {
  LayoutDashboard,
  GraduationCap,
  School,
  BookOpen,
  Award,
  CalendarCheck,
  Users,
  Calendar,
  FileSpreadsheet,
  Settings,
  Sparkles,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { activeTab, setActiveTab, students, classes, currentUser, logout } = useSchool();

  const navItems: { tab: ViewTab; label: string; icon: React.ElementType; badge?: number | string }[] = [
    { tab: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { tab: 'students', label: 'Élèves', icon: GraduationCap, badge: students.length },
    { tab: 'classes', label: 'Classes & Salles', icon: School, badge: classes.length },
    { tab: 'subjects', label: 'Matières & Coeffs', icon: BookOpen },
    { tab: 'grades', label: 'Relevé de Notes', icon: Award },
    { tab: 'attendance', label: 'Présences & Retards', icon: CalendarCheck },
    { tab: 'teachers', label: 'Corps Enseignant', icon: Users },
    { tab: 'schedule', label: 'Emploi du temps', icon: Calendar },
    { tab: 'report_cards', label: 'Bulletins Scolaires', icon: FileSpreadsheet, badge: 'PDF' },
    { tab: 'settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 w-64 glass-card z-40 flex flex-col border-r border-white/80 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Logo & Name */}
        <div className="p-6 border-b border-white/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00818c] to-[#00a896] flex items-center justify-center text-white shadow-md shadow-teal-800/25">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight text-[#0f2d30] font-heading flex items-center gap-1.5">
                EduGlass <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-[#00818c]/10 text-[#00818c] rounded-md">Pro</span>
              </h2>
              <p className="text-[11px] text-gray-500 font-medium">School Management UI</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Gestion Académique
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                id={`nav-item-${item.tab}`}
                onClick={() => {
                  setActiveTab(item.tab);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-[#00818c] to-[#006e77] text-white shadow-md shadow-teal-800/20 font-semibold'
                    : 'text-gray-600 hover:text-[#00818c] hover:bg-white/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#00818c]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold transition-all ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#00818c]/10 text-[#00818c] group-hover:bg-[#00818c]/20'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Card / User Status & Logout */}
        <div className="p-4 border-t border-white/60 space-y-2">
          <div className="p-3 rounded-2xl bg-white/70 border border-teal-900/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={
                  currentUser?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                }
                alt={currentUser?.name}
                className="w-8 h-8 rounded-xl object-cover ring-1 ring-[#00818c]/30 shrink-0"
              />
              <div className="text-left overflow-hidden">
                <p className="text-xs font-bold text-gray-900 truncate">
                  {currentUser?.name || 'Administrateur'}
                </p>
                <p className="text-[10px] text-[#00818c] font-medium truncate">
                  {currentUser?.roleLabel || 'Direction'}
                </p>
              </div>
            </div>

            <button
              id="btn-sidebar-logout"
              onClick={logout}
              title="Se déconnecter"
              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
              aria-label="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="px-2 flex items-center justify-between text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Lycée Victor Hugo
            </span>
            <span>v2.4 Pro</span>
          </div>
        </div>
      </aside>
    </>
  );
};
