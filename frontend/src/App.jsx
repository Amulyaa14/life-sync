import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DailyTasks from './pages/DailyTasks';
import HealthTracker from './pages/HealthTracker';
import RoutinePlanner from './pages/RoutinePlanner';
import Analytics from './pages/Analytics';

// Simple NavLink to highlight active path
const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`block px-4 py-3 rounded-xl transition ${isActive ? 'bg-primary-500 text-white shadow-md font-medium' : 'text-text hover:bg-surface'}`}
    >
      {children}
    </Link>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen flex bg-surface">
        {/* Sidebar */}
        <aside className="w-64 bg-background border-r border-border flex flex-col">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-primary-600">Life Sync</h1>
          </div>
          <nav className="flex-1 px-4 space-y-2 mt-4">
            <NavLink to="/">Dashboard</NavLink>
            <NavLink to="/tasks">Daily Tasks</NavLink>
            <NavLink to="/health">Health Tracker</NavLink>
            <NavLink to="/planner">Routine Planner</NavLink>
            <NavLink to="/analytics">Analytics</NavLink>
            <NavLink to="/settings">Settings</NavLink>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<DailyTasks />} />
            <Route path="/health" element={<HealthTracker />} />
            <Route path="/planner" element={<RoutinePlanner />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<div className="text-2xl font-semibold">Settings (Coming Soon)</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
