import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import PublicRoute from './PublicRoute';

// ─── Lazy-loaded pages (code splitting) ─────────────────────────────────────
const HomePage = lazy(() => import('../pages/HomePage'));
const PriceCheckerPage = lazy(() => import('../pages/PriceCheckerPage'));
const AlertsPage = lazy(() => import('../pages/AlertsPage'));
const HistoryPage = lazy(() => import('../pages/HistoryPage'));
const ComparisonPage = lazy(() => import('../pages/ComparisonPage'));
const MultiPlatformPage = lazy(() => import('../pages/MultiPlatformPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

const Loading = () => <div className="page-loader">Loading...</div>;

function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* ─── Public Routes ─────────────────────────────── */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* ─── Price Checker (fullscreen pages) ──────────── */}
        <Route path="/price-checker" element={<PriceCheckerPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/comparison" element={<ComparisonPage />} />
        <Route path="/multi-search" element={<MultiPlatformPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* ─── Auth Routes (redirect if logged in) ───────── */}
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
        </Route>

        {/* ─── 404 ───────────────────────────────────────── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;


