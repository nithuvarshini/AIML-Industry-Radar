import { useCallback, useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardPage from './pages/DashboardPage';
import MarketInsightsPage from './pages/MarketInsightsPage';
import RoleAnalysisPage from './pages/RoleAnalysisPage';
import RecommendationsPage from './pages/RecommendationsPage';

import RoadmapPage from './pages/RoadmapPage';

const PAGES = {
  dashboard: DashboardPage,
  market: MarketInsightsPage,
  roles: RoleAnalysisPage,
  recommendations: RecommendationsPage,
  roadmap: RoadmapPage,
};

function readRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  return PAGES[hash] ? hash : 'dashboard';
}

export default function App() {
  const [route, setRoute] = useState(readRoute);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const onHash = () => setRoute(readRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = useCallback((id) => {
    window.location.hash = `/${id}`;
    setRoute(id);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const Page = PAGES[route] || DashboardPage;

  return (
    <div className="min-h-screen">
      <Sidebar
        active={route}
        onNavigate={navigate}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-72">
        <Topbar active={route} onMenu={() => setSidebarOpen(true)} />
        <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
          <Page />
        </main>
        <footer className="mx-auto max-w-7xl px-4 pb-8 pt-4 lg:px-8">
          <p className="text-center text-xs text-slate-500">
            AIML Industry Radar — AI/ML job market intelligence. Data fetched live from the backend API.
          </p>
        </footer>
      </div>
    </div>
  );
}
