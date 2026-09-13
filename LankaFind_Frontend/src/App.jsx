import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages are lazy-loaded - each one becomes its own JS chunk, downloaded only
// when the user actually navigates there, instead of all being bundled into
// the single initial page-load file. This shrinks the first-load bundle size.
const Home = lazy(() => import('./pages/Home'));
const LostItems = lazy(() => import('./pages/LostItems'));
const FoundItems = lazy(() => import('./pages/FoundItems'));
const ReportLostItem = lazy(() => import('./pages/ReportLostItem'));
const ReportFoundItem = lazy(() => import('./pages/ReportFoundItem'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const MyReports = lazy(() => import('./pages/MyReports'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Messages = lazy(() => import('./pages/Messages'));
const ItemsMap = lazy(() => import('./pages/ItemsMap'));
const ItemDetail = lazy(() => import('./pages/ItemDetail'));
const Profile = lazy(() => import('./pages/Profile'));

// Small inline fallback shown for the brief moment a page chunk is downloading.
// Kept minimal (no images/animation) so it never becomes the bottleneck itself.
function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-app-light dark:bg-app-dark text-gray-800 dark:text-gray-100 transition-colors">
        {/* Navbar/Footer stay eagerly loaded - small, and needed on every page immediately */}
        <Navbar />

        <main className="flex-grow">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/lost" element={<LostItems />} />
              <Route path="/lost/report" element={<ReportLostItem />} />
              <Route path="/found" element={<FoundItems />} />
              <Route path="/found/report" element={<ReportFoundItem />} />
              <Route path="/map" element={<ItemsMap />} />
              <Route path="/item/:id" element={<ItemDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/my-reports"
                element={
                  <ProtectedRoute>
                    <MyReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
