<<<<<<< HEAD
import React, { useEffect, useMemo, useState } from 'react';
=======
import React, { useEffect, useState } from 'react';
>>>>>>> 9bda6c6 (Phase 9: Mobile and Desktop responsiveness - dual nav, responsive grids and layouts)
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard, ListChecks, HeartPulse, CalendarClock, ChartColumn, Settings as SettingsIcon } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import DailyTasks from './pages/DailyTasks';
import HealthTracker from './pages/HealthTracker';
import RoutinePlanner from './pages/RoutinePlanner';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
<<<<<<< HEAD
import InstallPrompt from './components/InstallPrompt';
import useEventReminders from './hooks/useEventReminders';
import usePushNotifications from './hooks/usePushNotifications';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'Daily Tasks', icon: ListChecks },
  { to: '/health', label: 'Health', icon: HeartPulse },
  { to: '/planner', label: 'Planner', icon: CalendarClock },
  { to: '/analytics', label: 'Analytics', icon: ChartColumn },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

const NavLink = ({ to, label, icon: Icon, onNavigate }) => {
=======
import { LayoutDashboard, CheckSquare, HeartPulse, CalendarDays, BarChart3, Settings2 } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/health', label: 'Health', icon: HeartPulse },
  { to: '/planner', label: 'Planner', icon: CalendarDays },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings2 },
];

// Desktop sidebar nav link
const SidebarNavLink = ({ to, label, icon: Icon }) => {
>>>>>>> 9bda6c6 (Phase 9: Mobile and Desktop responsiveness - dual nav, responsive grids and layouts)
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
<<<<<<< HEAD
      onClick={onNavigate}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${isActive ? 'bg-primary-500 text-white shadow-md font-medium' : 'text-text hover:bg-surface'}`}
    >
      <Icon size={18} />
=======
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        isActive
          ? 'bg-primary-500 text-white shadow-md font-semibold'
          : 'text-text hover:bg-surface'
      }`}
    >
      <Icon size={20} />
>>>>>>> 9bda6c6 (Phase 9: Mobile and Desktop responsiveness - dual nav, responsive grids and layouts)
      <span>{label}</span>
    </Link>
  );
};

<<<<<<< HEAD
const MobileBottomNav = () => {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="grid grid-cols-6 gap-1 px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center py-1 rounded-lg ${isActive ? 'text-primary-600 bg-primary-50' : 'text-text-muted'}`}
            >
              <Icon size={18} />
              <span className="text-[10px] mt-1 leading-none">{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

const AppShell = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const appTitle = useMemo(() => 'Life Sync', []);

=======
// Mobile bottom nav link
const BottomNavLink = ({ to, label, icon: Icon }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className="flex flex-col items-center justify-center flex-1 py-2 min-w-0">
      <Icon
        size={22}
        className={isActive ? 'text-primary-500' : 'text-text-muted'}
      />
      <span className={`text-[10px] mt-0.5 truncate ${isActive ? 'text-primary-500 font-semibold' : 'text-text-muted'}`}>
        {label}
      </span>
    </Link>
  );
};

function AppLayout() {
  return (
    <div className="min-h-screen flex bg-surface">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex w-64 bg-background border-r border-border flex-col flex-shrink-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary-600">Life Sync ⚡</h1>
          <p className="text-xs text-text-muted mt-1">Your productivity hub</p>
        </div>
        <nav className="flex-1 px-4 space-y-1 mt-2">
          {NAV_ITEMS.map(item => (
            <SidebarNavLink key={item.to} {...item} />
          ))}
        </nav>
        <div className="p-6 text-xs text-text-muted border-t border-border">
          Stay focused. Stay synced. 🚀
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Top Header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-background border-b border-border sticky top-0 z-30">
          <h1 className="text-xl font-bold text-primary-600">Life Sync ⚡</h1>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<DailyTasks />} />
            <Route path="/health" element={<HealthTracker />} />
            <Route path="/planner" element={<RoutinePlanner />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border flex items-stretch z-40 shadow-xl">
        {NAV_ITEMS.map(item => (
          <BottomNavLink key={item.to} {...item} />
        ))}
      </nav>
    </div>
  );
}

function App() {
>>>>>>> 9bda6c6 (Phase 9: Mobile and Desktop responsiveness - dual nav, responsive grids and layouts)
  useEffect(() => {
    const root = document.documentElement;
    const saved = localStorage.getItem('lifeSyncPrefs');
    let theme = 'System';
    let notifications = true;

    if (saved) {
      const parsed = JSON.parse(saved);
      theme = parsed.theme || 'System';
      notifications = parsed.notifications !== false;
    }

    setNotificationsEnabled(notifications);

    if (theme === 'Dark') {
      root.classList.add('dark');
    } else if (theme === 'Light') {
      root.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, []);

<<<<<<< HEAD
  useEffect(() => {
    const handlePreferenceUpdate = (event) => {
      const nextNotifications = event && event.detail && event.detail.notifications;
      setNotificationsEnabled(nextNotifications !== false);
    };

    window.addEventListener('lifesync-preferences-updated', handlePreferenceUpdate);
    return () => window.removeEventListener('lifesync-preferences-updated', handlePreferenceUpdate);
  }, []);

  const isPushActive = usePushNotifications(notificationsEnabled);
  useEventReminders(notificationsEnabled && !isPushActive);

  return (
    <div className="min-h-screen flex bg-surface text-text">
      <aside className="hidden md:flex w-64 bg-background border-r border-border flex-col sticky top-0 h-screen">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary-600">Life Sync</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} label={item.label} icon={item.icon} />
          ))}
        </nav>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="md:hidden sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="h-14 px-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-lg border border-border bg-surface"
              aria-label="Toggle navigation"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <h1 className="text-lg font-semibold text-primary-600">{appTitle}</h1>
            <div className="w-9" aria-hidden="true" />
          </div>
          {isMobileMenuOpen && (
            <div className="border-t border-border p-3 space-y-2">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  label={item.label}
                  icon={item.icon}
                  onNavigate={() => setIsMobileMenuOpen(false)}
                />
              ))}
            </div>
          )}
        </header>

        <main className="p-4 sm:p-6 md:p-8 pb-24 md:pb-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<DailyTasks />} />
            <Route path="/health" element={<HealthTracker />} />
            <Route path="/planner" element={<RoutinePlanner />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>

      <MobileBottomNav />
      <InstallPrompt />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppShell />
=======
  return (
    <Router>
      <AppLayout />
>>>>>>> 9bda6c6 (Phase 9: Mobile and Desktop responsiveness - dual nav, responsive grids and layouts)
    </Router>
  );
}

export default App;
